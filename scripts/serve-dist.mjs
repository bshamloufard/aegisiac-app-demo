import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'

const root = resolve('dist')
const port = Number(process.env.PORT || 4173)
const host = process.env.HOST || '0.0.0.0'

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

function resolveAsset(url) {
  const cleanPath = decodeURIComponent((url || '/').split('?')[0])
  const requested = normalize(join(root, cleanPath))

  if (!requested.startsWith(root)) {
    return join(root, 'index.html')
  }

  if (existsSync(requested) && statSync(requested).isFile()) {
    return requested
  }

  return join(root, 'index.html')
}

const server = createServer((req, res) => {
  const file = resolveAsset(req.url)
  const ext = extname(file)

  res.setHeader('Content-Type', types[ext] || 'application/octet-stream')

  if (file.includes('/assets/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  } else {
    res.setHeader('Cache-Control', 'no-store')
  }

  createReadStream(file)
    .on('error', () => {
      res.statusCode = 500
      res.end('Unable to read asset')
    })
    .pipe(res)
})

server.listen(port, host, () => {
  console.log(`AegisIaC UI listening on http://${host}:${port}`)
})
