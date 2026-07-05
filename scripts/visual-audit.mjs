import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { chromium, devices } from 'playwright'

const explicitUrl = process.env.VISUAL_AUDIT_URL
const port = Number(process.env.VISUAL_AUDIT_PORT || 4873)
const baseUrl = explicitUrl || `http://127.0.0.1:${port}`
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const outDir = resolve('artifacts', 'visual-audit', stamp)

const desktopViewports = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'wide', viewport: { width: 1920, height: 1080 } },
]

const viewClicks = [
  { view: 'environment', title: 'Environment', expectedText: 'Production Environment' },
  { view: 'generate', title: 'Generate', expectedText: 'Production SQL review' },
  { view: 'insights', title: 'Insights', expectedText: 'Mitigation' },
]

let serverProcess

function log(message) {
  process.stdout.write(`${message}\n`)
}

function fail(message, details = {}) {
  return { level: 'fail', message, details }
}

function warn(message, details = {}) {
  return { level: 'warn', message, details }
}

async function waitForServer(url, timeoutMs = 30000) {
  const startedAt = Date.now()
  let lastError

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(1200) })
      if (res.ok) return
      lastError = new Error(`HTTP ${res.status}`)
    } catch (error) {
      lastError = error
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 300))
  }

  throw new Error(`Timed out waiting for ${url}: ${lastError?.message || 'no response'}`)
}

async function startLocalServer() {
  if (!existsSync(resolve('dist', 'index.html'))) {
    throw new Error('dist/index.html is missing. Run npm run build first, or use npm run visual:audit:build.')
  }

  serverProcess = spawn('npm', ['run', 'start'], {
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  serverProcess.stdout.on('data', (chunk) => process.stdout.write(`[visual-server] ${chunk}`))
  serverProcess.stderr.on('data', (chunk) => process.stderr.write(`[visual-server] ${chunk}`))

  await waitForServer(baseUrl)
}

async function stopLocalServer() {
  if (!serverProcess || serverProcess.killed) return

  await new Promise((resolveStop) => {
    serverProcess.once('exit', resolveStop)
    serverProcess.kill('SIGTERM')
    setTimeout(resolveStop, 1200)
  })
}

async function captureView(browser, viewportName, viewport, clickTarget) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    colorScheme: 'dark',
  })
  const page = await context.newPage()
  const issues = []

  await page.goto(baseUrl, { waitUntil: 'networkidle' })

  if (clickTarget.title !== 'Environment') {
    await page.getByTitle(clickTarget.title).click()
    await page.waitForTimeout(250)
  }

  const screenshotPath = resolve(outDir, `${viewportName}-${clickTarget.view}.png`)
  await page.screenshot({ path: screenshotPath, fullPage: false })

  const metrics = await page.evaluate((expectedText) => {
    const root = document.querySelector('#root')
    const rootRect = root?.getBoundingClientRect()
    const visibleButtons = [...document.querySelectorAll('button')].filter((button) => {
      const rect = button.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 && getComputedStyle(button).visibility !== 'hidden'
    })
    const unnamedButtons = visibleButtons
      .filter((button) => {
        const label = [
          button.getAttribute('aria-label'),
          button.getAttribute('title'),
          button.textContent,
        ].join(' ').trim()
        return !label
      })
      .map((button) => ({
        className: button.className,
        width: Math.round(button.getBoundingClientRect().width),
        height: Math.round(button.getBoundingClientRect().height),
      }))

    const whiteLike = new Set(['rgb(255, 255, 255)', 'rgba(255, 255, 255, 1)', 'white'])

    return {
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      documentBackground: getComputedStyle(document.documentElement).backgroundColor,
      bodyHeight: document.body.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      clientWidth: document.documentElement.clientWidth,
      expectedTextPresent: document.body.innerText.includes(expectedText),
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      rootRect: rootRect
        ? {
            width: Math.round(rootRect.width),
            height: Math.round(rootRect.height),
            top: Math.round(rootRect.top),
            left: Math.round(rootRect.left),
          }
        : null,
      textLength: document.body.innerText.length,
      unnamedButtons,
      visibleButtonCount: visibleButtons.length,
      whiteBackground:
        whiteLike.has(getComputedStyle(document.body).backgroundColor) ||
        whiteLike.has(getComputedStyle(document.documentElement).backgroundColor),
    }
  }, clickTarget.expectedText)

  if (metrics.whiteBackground) {
    issues.push(fail('Page background resolves to white; rubber-band overscroll will break the dark app shell.', metrics))
  }

  if (metrics.horizontalOverflow > 2) {
    issues.push(fail('Document has horizontal overflow outside the intended internal canvas.', metrics))
  }

  if (!metrics.expectedTextPresent) {
    issues.push(fail(`Expected view text not found: ${clickTarget.expectedText}`, metrics))
  }

  if (!metrics.rootRect || metrics.rootRect.width < viewport.width * 0.94 || metrics.rootRect.height < viewport.height * 0.94) {
    issues.push(fail('App root does not fill the viewport; this risks the small poster-frame look.', metrics))
  }

  if (metrics.unnamedButtons.length > 0) {
    issues.push(warn('Visible icon buttons are missing text, title, or aria-label.', metrics.unnamedButtons))
  }

  if (metrics.textLength > 9500) {
    issues.push(warn('Viewport contains a lot of visible text; check whether the screen is overstuffed.', { textLength: metrics.textLength }))
  }

  await context.close()
  return { screenshotPath, metrics, issues, view: clickTarget.view, viewport: viewportName }
}

async function captureMobile(browser) {
  const context = await browser.newContext({
    ...devices['iPhone 15'],
    colorScheme: 'dark',
  })
  const page = await context.newPage()
  const issues = []
  await page.goto(baseUrl, { waitUntil: 'networkidle' })

  const screenshotPath = resolve(outDir, 'mobile-environment.png')
  await page.screenshot({ path: screenshotPath, fullPage: false })

  const metrics = await page.evaluate(() => ({
    bodyBackground: getComputedStyle(document.body).backgroundColor,
    documentBackground: getComputedStyle(document.documentElement).backgroundColor,
    expectedTextPresent: document.body.innerText.includes('Production Environment'),
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    viewport: {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    },
  }))

  if (metrics.horizontalOverflow > 2) {
    issues.push(fail('Mobile document has horizontal overflow.', metrics))
  }
  if (!metrics.expectedTextPresent) {
    issues.push(fail('Mobile default view does not show the environment screen.', metrics))
  }

  await context.close()
  return { screenshotPath, metrics, issues, view: 'environment', viewport: 'mobile' }
}

async function writeReport(results) {
  const allIssues = results.flatMap((result) =>
    result.issues.map((issue) => ({
      ...issue,
      view: result.view,
      viewport: result.viewport,
      screenshotPath: result.screenshotPath,
    })),
  )
  const failed = allIssues.filter((issue) => issue.level === 'fail')

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    failed: failed.length,
    warned: allIssues.length - failed.length,
    results,
  }

  await writeFile(resolve(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)

  const summary = [
    '# Visual Audit',
    '',
    `Base URL: ${baseUrl}`,
    `Result: ${failed.length ? `${failed.length} failure(s)` : 'passed hard checks'}`,
    '',
    '## Screenshots',
    ...results.map((result) => `- ${result.viewport}/${result.view}: ${result.screenshotPath}`),
    '',
    '## Issues',
    allIssues.length
      ? allIssues.map((issue) => `- ${issue.level.toUpperCase()} ${issue.viewport}/${issue.view}: ${issue.message}`).join('\n')
      : '- None',
    '',
  ].join('\n')

  await writeFile(resolve(outDir, 'summary.md'), summary)
  return { allIssues, failed, reportPath: resolve(outDir, 'report.json'), summaryPath: resolve(outDir, 'summary.md') }
}

async function main() {
  await mkdir(outDir, { recursive: true })

  try {
    if (!explicitUrl) {
      await startLocalServer()
    } else {
      await waitForServer(baseUrl)
    }

    const browser = await chromium.launch()
    const results = []

    try {
      for (const desktop of desktopViewports) {
        for (const clickTarget of viewClicks) {
          results.push(await captureView(browser, desktop.name, desktop.viewport, clickTarget))
        }
      }
      results.push(await captureMobile(browser))
    } finally {
      await browser.close()
    }

    const { failed, reportPath, summaryPath } = await writeReport(results)
    log(`Visual audit artifacts: ${outDir}`)
    log(`Report: ${reportPath}`)
    log(`Summary: ${summaryPath}`)

    if (failed.length) {
      for (const issue of failed) {
        log(`FAIL ${issue.viewport}/${issue.view}: ${issue.message}`)
      }
      process.exitCode = 1
    }
  } finally {
    await stopLocalServer()
  }
}

process.on('exit', () => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGTERM')
  }
})

main().catch((error) => {
  console.error(error)
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGTERM')
  }
  process.exit(1)
})
