import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  Cloud,
  Database,
  GitPullRequest,
  History,
  Home,
  Layers,
  Maximize2,
  Menu,
  MousePointer2,
  RadioTower,
  Search,
  Server,
  Shield,
  Sparkles,
  Wand2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { createElement, useEffect, useState } from 'react'
import { insights, mitigationSteps, resources } from './reviewData'

const resourceIcons = {
  Cloud,
  Database,
  Globe2: Activity,
  Home,
  Layers,
  RadioTower,
  Server,
}

const views = [
  { id: 'environment', label: 'Environment', icon: Home },
  { id: 'generate', label: 'Generate', icon: Wand2 },
  { id: 'insights', label: 'Insights', icon: Sparkles },
  { id: 'actions', label: 'Actions', icon: GitPullRequest },
  { id: 'compliance', label: 'Compliance', icon: Shield },
]

const impactRows = [
  ['Security', 'Medium'],
  ['Reliability', 'Medium'],
  ['Cost', 'High'],
  ['Performance', 'Low'],
]

const defaultGateTarget = {
  repository: '',
  pullRequest: '',
  shortRef: '',
  sha: '',
  run: '',
  title: '',
  state: '',
  headRef: '',
  baseRef: '',
  author: '',
  changedFiles: '',
  additions: '',
  deletions: '',
  context: '',
}

function readGateTarget() {
  if (typeof window === 'undefined') {
    return defaultGateTarget
  }

  const params = new URLSearchParams(window.location.search)
  const shortRef = window.location.pathname.startsWith('/pr/') ? window.location.pathname.slice('/pr/'.length) : ''
  return {
    repository: params.get('repo') || defaultGateTarget.repository,
    pullRequest: params.get('pr') || defaultGateTarget.pullRequest,
    shortRef: params.get('ref') || shortRef || defaultGateTarget.shortRef,
    sha: params.get('sha') || defaultGateTarget.sha,
    run: params.get('run') || defaultGateTarget.run,
  }
}

function githubPullRequestUrl(target) {
  if (!target.repository || !target.pullRequest) {
    return '#'
  }
  return `https://github.com/${target.repository}/pull/${target.pullRequest}`
}

function reviewDisplayName(target) {
  return target.title ? 'Pull request review' : 'Infrastructure review'
}

export function ReviewDashboard() {
  const [view, setView] = useState('environment')
  const [gateTarget, setGateTarget] = useState(() => readGateTarget())

  useEffect(() => {
    const resetRootView = () => {
      if (!window.location.hash) setView('environment')
    }

    resetRootView()
    window.addEventListener('pageshow', resetRootView)
    return () => window.removeEventListener('pageshow', resetRootView)
  }, [])

  useEffect(() => {
    if (!gateTarget.shortRef) {
      const controller = new AbortController()
      fetch('/v1/demo/pr-gate', { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error('Unable to load review context')
          return response.json()
        })
        .then((payload) => {
          setGateTarget((current) => ({
            ...current,
            repository: current.repository || payload.repository || '',
            pullRequest: current.pullRequest || (payload.pullRequest ? String(payload.pullRequest) : ''),
            context: payload.context || current.context,
          }))
        })
        .catch((error) => {
          if (error.name !== 'AbortError') console.warn(error)
        })

      return () => controller.abort()
    }

    const controller = new AbortController()
    fetch(`/v1/demo/pr-gate/resolve/${encodeURIComponent(gateTarget.shortRef)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to resolve PR review link')
        return response.json()
      })
      .then((payload) => {
        if (!payload?.gate) return
        setGateTarget((current) => ({
          ...current,
          repository: payload.gate.repository || current.repository,
          pullRequest: payload.gate.pullRequest ? String(payload.gate.pullRequest) : current.pullRequest,
          shortRef: payload.gate.shortRef || current.shortRef,
          sha: payload.gate.sha || current.sha,
          title: payload.gate.pr?.title || current.title,
          state: payload.gate.pr?.state || current.state,
          headRef: payload.gate.pr?.headRef || current.headRef,
          baseRef: payload.gate.pr?.baseRef || current.baseRef,
          author: payload.gate.pr?.author || current.author,
          changedFiles: payload.gate.pr?.changedFiles ? String(payload.gate.pr.changedFiles) : current.changedFiles,
          additions: payload.gate.pr?.additions ? String(payload.gate.pr.additions) : current.additions,
          deletions: payload.gate.pr?.deletions ? String(payload.gate.pr.deletions) : current.deletions,
        }))
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.warn(error)
        }
      })

    return () => controller.abort()
  }, [gateTarget.shortRef])

  return (
    <div className="h-dvh overflow-hidden bg-[#0d1110] text-[#eef1ec] antialiased">
      <div className="aegis-shell fixed inset-0" />
      <DesktopShell view={view} setView={setView} gateTarget={gateTarget} />
      <MobileShell view={view} setView={setView} gateTarget={gateTarget} />
    </div>
  )
}

function DesktopShell({ view, setView, gateTarget }) {
  return (
    <div className="relative hidden h-dvh overflow-hidden lg:block">
      <div
        className="grid h-full w-full grid-cols-[64px_minmax(0,1fr)] overflow-hidden border border-white/10 bg-[#0d1110]/95 shadow-2xl shadow-black/70"
      >
        <Rail view={view} setView={setView} />
        {view === 'environment' && (
          <div className="grid min-h-0 grid-cols-[320px_minmax(0,1fr)]">
            <ResourceBrowser gateTarget={gateTarget} />
            <EnvironmentCanvas gateTarget={gateTarget} onOpenInsight={() => setView('insights')} />
          </div>
        )}
        {view === 'generate' && (
          <div className="grid min-h-0 grid-cols-[minmax(390px,0.48fr)_minmax(640px,1fr)]">
            <GeneratePanel />
            <DesignPreview onOpenInsight={() => setView('insights')} />
          </div>
        )}
        {view === 'insights' && <InsightView />}
        {(view === 'actions' || view === 'compliance') && <QuietListView view={view} gateTarget={gateTarget} />}
      </div>
    </div>
  )
}

function MobileShell({ view, setView, gateTarget }) {
  return (
    <div className="relative h-dvh overflow-hidden lg:hidden">
      <header className="border-b border-[#242a32] bg-[#111418]/98 px-4 py-3">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button aria-label="Open menu" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.035]">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="truncate text-base font-semibold">{reviewDisplayName(gateTarget)}</div>
              <div className="truncate text-xs text-[#8f98a3]">
                {gateTarget.title || `Isengard · PR #${gateTarget.pullRequest} blocked`}
              </div>
            </div>
          </div>
          <ReviewScopeBadge gateTarget={gateTarget} compact />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {views.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`h-10 rounded-lg px-2 text-xs font-medium transition ${
                view === item.id ? 'bg-[#eef1ec] text-[#0b0d10]' : 'bg-white/[0.055] text-[#8f98a3] hover:bg-white/10 hover:text-[#d4dad3]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>
      <main className="h-[calc(100dvh-117px)] overflow-y-auto bg-[#0d1110]">
        {view === 'environment' && (
          <div className="min-h-full">
            <EnvironmentCanvas mobile onOpenInsight={() => setView('insights')} />
            <ResourceBrowser mobile gateTarget={gateTarget} />
          </div>
        )}
        {view === 'generate' && <GeneratePanel mobile />}
        {view === 'insights' && <InsightView mobile />}
        {(view === 'actions' || view === 'compliance') && <QuietListView view={view} mobile gateTarget={gateTarget} />}
      </main>
    </div>
  )
}

function Rail({ view, setView }) {
  return (
    <aside className="flex min-h-0 flex-col items-center border-r border-[#242a32] bg-[#0b0f0e]/96 px-3 py-5">
      <button
        aria-label="Open Isengard home"
        onClick={() => setView('environment')}
        className="aegis-interactive mb-7 grid h-9 w-9 place-items-center rounded-lg text-[#eef1ec] hover:bg-white/[0.06]"
      >
        <Sparkles className="h-5 w-5" />
      </button>
      <nav className="flex flex-1 flex-col items-center gap-3" aria-label="Workspace navigation">
        {views.map((item) => {
          const Icon = item.icon
          const active = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              title={item.label}
              aria-label={item.label}
              className={`aegis-interactive group flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium active:scale-[0.98] ${
                active ? 'bg-[#1d2a24] text-[#eef1ec] ring-1 ring-[#314138]' : 'text-[#8f98a3] hover:bg-white/[0.045] hover:text-[#d4dad3]'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-[#b7f7d0]' : ''}`} />
            </button>
          )
        })}
      </nav>
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#314138] text-xs font-bold text-[#b7f7d0]">
        I
      </div>
    </aside>
  )
}

function ResourceBrowser({ mobile = false, gateTarget = defaultGateTarget }) {
  const sourceLabel = gateTarget.sha ? `Commit ${gateTarget.sha.slice(0, 7)}` : gateTarget.pullRequest ? `PR #${gateTarget.pullRequest}` : 'Current plan'

  return (
    <aside className={`${mobile ? 'border-t' : 'border-r'} min-h-0 border-[#242a32] bg-[#111418]/92`}>
      {!mobile && (
        <div className="flex h-[72px] items-center gap-4 border-b border-[#242a32] px-5">
          <button aria-label="Back to published designs" className="aegis-interactive grid h-9 w-9 place-items-center rounded-lg text-[#8f98a3] hover:bg-white/[0.06] hover:text-[#f0f3f6]">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">{reviewDisplayName(gateTarget)}</div>
            <div className="truncate text-xs text-[#8f98a3]">Mapped from {sourceLabel}</div>
          </div>
        </div>
      )}
      <div className="border-b border-[#242a32] p-4">
        <label className="aegis-interactive flex h-11 items-center gap-3 rounded-lg border border-[#303844] bg-[#07090c]/55 px-3 focus-within:border-[#79c0ff]/70">
          <Search className="h-[18px] w-[18px] text-[#8f98a3]" />
          <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#656c76]" placeholder="Search resources..." />
          <Activity className="h-4 w-4 text-[#8f98a3]" />
        </label>
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <div className="text-sm font-semibold">Resources</div>
          <div className="mt-1 text-xs text-[#656c76]">Groups mirror the canvas hierarchy</div>
        </div>
        <Layers className="h-5 w-5 text-[#8f98a3]" />
      </div>
      <div className={`${mobile ? 'max-h-[420px]' : 'h-[calc(100%-206px)]'} overflow-y-auto px-4 pb-5`}>
        <ResourceTree items={resources} level={0} />
      </div>
    </aside>
  )
}

function EnvironmentCanvas({ gateTarget = defaultGateTarget, mobile = false, onOpenInsight, preview = false }) {
  if (mobile) {
    return <MobileEnvironmentCanvas onOpenInsight={onOpenInsight} />
  }

  return (
    <section className="relative min-h-0 overflow-hidden bg-[#0d1110]">
      <CanvasTexture />
      {!preview && !mobile && <CanvasTopbar gateTarget={gateTarget} />}
      {!preview && !mobile && <CanvasToolbar />}
      <div
        className={`${
          preview ? 'h-[760px] w-[1160px] origin-top-left scale-[0.78]' : 'flex h-full min-h-[720px] w-full items-start justify-center px-10 pb-24 pt-[104px]'
        } relative`}
      >
        <DesktopArchitectureLayout preview={preview} onOpenInsight={onOpenInsight} />
      </div>
    </section>
  )
}

function DesktopArchitectureLayout({ preview = false, onOpenInsight }) {
  return (
    <DiagramGroup
      icon={Home}
      label="Tenant"
      tone="teal"
      className={`${preview ? 'm-10 min-h-[610px] w-[1120px]' : 'min-h-[585px] w-full max-w-[1420px]'} px-12 pb-12 pt-14`}
    >
      <div className="pointer-events-none absolute left-[43%] right-[35%] top-[318px] z-[2] h-px bg-zinc-500/30" />
      <div className="relative z-10 grid grid-cols-[minmax(420px,1fr)_minmax(420px,1fr)] items-start gap-10">
        <DiagramGroup icon={Cloud} label="Subscription" tone="yellow" className="px-10 pb-10 pt-12">
          <DiagramGroup icon={Activity} label="Account" tone="violet" className="px-8 pb-8 pt-12">
            <DiagramGroup icon={RadioTower} label="Virtual network" tone="lime" dashed className="flex min-h-[210px] items-center justify-center px-8 py-10">
              <div className="flex items-center justify-center gap-7">
                <ArchitectureNode
                  icon={Server}
                  label="API service"
                  badge="risk"
                  insight={{
                    title: 'Public ingress risk',
                    severity: 'High',
                    body: 'The new service exposes a public ingress path without a WAF rate-limit rule.',
                  }}
                  onOpenInsight={onOpenInsight}
                />
                <ArchitectureNode icon={Layers} label="Session cache" badge="MOD" muted />
              </div>
            </DiagramGroup>
          </DiagramGroup>
        </DiagramGroup>

        <DiagramGroup icon={Cloud} label="Subscription" tone="yellow" className="grid grid-rows-[250px_165px] gap-8 px-10 pb-10 pt-12">
          <DiagramGroup icon={Activity} label="Account" tone="violet" className="px-8 pb-8 pt-12">
            <DiagramGroup icon={RadioTower} label="Data subnet" tone="lime" dashed className="flex h-full min-h-[180px] items-center justify-center px-8 py-10">
              <ArchitectureNode
                icon={Database}
                label="Primary database"
                badge="2"
                insight={{
                  title: 'Database replacement',
                  severity: 'Critical',
                  body: 'Replacement touches stateful data and requires linked approval evidence before merge.',
                }}
                popoverSide="left"
                onOpenInsight={onOpenInsight}
              />
            </DiagramGroup>
          </DiagramGroup>

          <DiagramGroup icon={RadioTower} label="Shared edge" tone="teal" dashed className="flex items-center justify-end px-14 py-8">
            <ArchitectureNode
              icon={RadioTower}
              label="DNS VNet"
              badge="risk"
              insight={{
                title: 'Shared edge drift',
                severity: 'Medium',
                body: 'DNS routing changes land outside the application subnet and need ownership review.',
              }}
              popoverSide="left"
              onOpenInsight={onOpenInsight}
            />
          </DiagramGroup>
        </DiagramGroup>
      </div>
    </DiagramGroup>
  )
}

function MobileEnvironmentCanvas({ onOpenInsight }) {
  return (
    <section className="relative h-[530px] overflow-hidden border-b border-[#242a32] bg-[#0d1110] p-4">
      <CanvasTexture />
      <div className="relative h-full rounded-xl border border-[rgb(139_233_220/0.35)] bg-[rgb(17_20_24/0.45)] p-4">
        <CanvasLabel icon={Home} label="Tenant" className="-top-2 left-5" />

        <div className="relative h-[270px] rounded-xl border border-[rgb(242_204_96/0.35)] bg-black/[0.08] p-4">
          <CanvasLabel icon={Cloud} label="Subscription" className="-top-2 left-5" />
          <div className="relative h-full rounded-xl border border-[rgb(210_168_255/0.28)] p-4">
            <CanvasLabel icon={Activity} label="Account" className="-top-2 left-5" />
            <div className="relative mt-5 h-[164px] rounded-xl border border-dashed border-[rgb(126_231_135/0.28)] p-4">
              <CanvasLabel icon={RadioTower} label="Virtual network" className="-top-2 left-5" />
              <div className="flex h-full items-center justify-center gap-3">
                <MobileNode icon={Server} label="API service" risk onOpenInsight={onOpenInsight} />
                <MobileNode icon={Layers} label="Session cache" badge="MOD" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_0.72fr] gap-3">
          <div className="relative rounded-xl border border-[rgb(242_204_96/0.35)] bg-black/[0.08] p-4">
            <CanvasLabel icon={Cloud} label="Data" className="-top-2 left-5" />
            <div className="relative h-[128px] rounded-xl border border-dashed border-[rgb(126_231_135/0.28)] p-3">
              <CanvasLabel icon={RadioTower} label="Subnet" className="-top-2 left-5" />
              <MobileNode icon={Database} label="Primary database" badge="2" compact />
            </div>
          </div>
          <div className="relative rounded-xl border border-dashed border-[rgb(139_233_220/0.28)] bg-black/[0.08] p-4">
            <CanvasLabel icon={RadioTower} label="Edge" className="-top-2 left-5" />
            <MobileNode icon={RadioTower} label="DNS VNet" risk compact onOpenInsight={onOpenInsight} />
          </div>
        </div>
      </div>
    </section>
  )
}

function CanvasLabel({ icon: Icon, label, className }) {
  return (
    <div className={`absolute flex w-fit items-center gap-1.5 bg-[#0d1110] px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f98a3] ${className}`}>
      {createElement(Icon, { className: 'h-3.5 w-3.5 text-[#f2cc60]' })}
      {label}
    </div>
  )
}

function MobileNode({ icon: Icon, label, badge, risk = false, compact = false, onOpenInsight }) {
  return (
    <button
      onClick={risk ? onOpenInsight : undefined}
      className={`aegis-interactive relative rounded-xl border bg-[#171b21]/92 p-3 text-left shadow-xl shadow-black/25 active:scale-[0.98] ${
        compact ? 'h-[96px] w-full' : 'h-[106px] min-w-0 flex-1'
      } ${risk ? 'border-[rgb(242_204_96/0.7)]' : 'border-[#303844]'}`}
    >
      {createElement(Icon, { className: 'mb-5 h-5 w-5 text-[#f2cc60]' })}
      <span className="block text-sm font-semibold leading-tight text-[#f0f3f6]">{label}</span>
      {risk && (
        <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md bg-[#0c2d4f] text-[#79c0ff]">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
      )}
      {badge && <span className="absolute right-2 top-2 rounded-md bg-[#04260f] px-1.5 py-1 text-[10px] font-bold text-[#7ee787]">{badge}</span>}
    </button>
  )
}

function CanvasTexture() {
  return (
    <>
      <div className="aegis-grid absolute inset-0 opacity-65" />
      <div className="aegis-grid-drift absolute -inset-32" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,transparent_0%,rgb(13_17_16/0.18)_56%,rgb(13_17_16/0.72)_100%)]" />
    </>
  )
}

function CanvasTopbar({ gateTarget }) {
  const pullRequestHref = githubPullRequestUrl(gateTarget)
  const hasPullRequestLink = pullRequestHref !== '#'

  return (
    <div className="absolute left-5 right-5 top-4 z-30 flex flex-wrap items-start justify-end gap-2">
      <div className="mr-auto hidden min-w-0 max-w-[520px] px-1 pt-1 xl:block">
        <div className="truncate text-sm font-medium text-[#eef1ec]">{gateTarget.title || 'Infrastructure review'}</div>
        <div className="mt-0.5 flex min-w-0 items-center gap-2 text-xs text-[#8f98a3]">
          <span className="truncate">
            {gateTarget.headRef && gateTarget.baseRef ? `${gateTarget.headRef} → ${gateTarget.baseRef}` : 'Review context'}
          </span>
          {gateTarget.changedFiles && <span className="shrink-0">{gateTarget.changedFiles} files</span>}
          {gateTarget.sha && <span className="shrink-0 font-mono">{gateTarget.sha.slice(0, 7)}</span>}
        </div>
      </div>
      <a
        href={pullRequestHref}
        target={hasPullRequestLink ? '_blank' : undefined}
        rel={hasPullRequestLink ? 'noreferrer' : undefined}
        aria-disabled={!hasPullRequestLink}
        className="aegis-interactive flex h-10 shrink-0 items-center rounded-lg border border-[#303844] bg-[#171b21] px-3 text-sm text-[#d4dad3] shadow-sm shadow-black/20 hover:border-[#4d5a68] hover:bg-[#1c2229] hover:text-[#f0f3f6]"
      >
        {gateTarget.pullRequest ? `PR #${gateTarget.pullRequest}` : 'No PR'}
      </a>
      <GitHubGateControl gateTarget={gateTarget} />
      <ReviewScopeBadge gateTarget={gateTarget} />
    </div>
  )
}

function GitHubGateControl({ gateTarget }) {
  const [state, setState] = useState('pending')
  const [busy, setBusy] = useState(null)
  const [message, setMessage] = useState('Waiting for approval')

  const submitDecision = async (decision) => {
    setBusy(decision)
    setMessage(decision === 'approved' ? 'Approving PR gate...' : 'Requesting changes...')

    try {
      const response = await fetch('/v1/demo/pr-gate/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          repository: gateTarget.repository,
          pullRequest: gateTarget.pullRequest,
          shortRef: gateTarget.shortRef || undefined,
          sha: gateTarget.sha || undefined,
          reviewer: 'Isengard reviewer',
          targetUrl: window.location.href,
        }),
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to update GitHub status')
      }

      setState(decision)
      setMessage(decision === 'approved' ? 'GitHub merge gate approved' : 'GitHub merge gate blocked')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Unable to update GitHub status')
    } finally {
      setBusy(null)
    }
  }

  const approved = state === 'approved'
  const rejected = state === 'rejected'

  return (
    <div className="flex h-10 min-w-0 max-w-[360px] items-center gap-1 rounded-lg border border-[#303844] bg-[#171b21] p-1 shadow-sm shadow-black/20">
      <div
        className={`hidden min-w-0 max-w-[220px] truncate px-2 text-xs xl:block ${
          state === 'error' ? 'text-[#ff9bce]' : approved ? 'text-[#7ee787]' : rejected ? 'text-[#f2cc60]' : 'text-[#8f98a3]'
        }`}
        title={message}
      >
        {message}
      </div>
      <button
        type="button"
        onClick={() => submitDecision('rejected')}
        disabled={Boolean(busy)}
        className={`aegis-interactive grid h-8 w-8 shrink-0 place-items-center rounded-md active:scale-[0.96] disabled:cursor-wait disabled:opacity-60 ${
          rejected ? 'bg-[#341a00] text-[#f2cc60]' : 'text-[#8f98a3] hover:bg-white/[0.07] hover:text-[#f2cc60]'
        }`}
        aria-label="Request changes on GitHub gate"
        title="Request changes"
      >
        <X className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => submitDecision('approved')}
        disabled={Boolean(busy)}
        className={`aegis-interactive grid h-8 w-8 shrink-0 place-items-center rounded-md active:scale-[0.96] disabled:cursor-wait disabled:opacity-60 ${
          approved ? 'bg-[#04260f] text-[#7ee787]' : 'bg-[#04260f]/70 text-[#7ee787] hover:bg-[#0b3b1a]'
        }`}
        aria-label="Approve GitHub gate"
        title="Approve"
      >
        <Check className="h-4 w-4" />
      </button>
    </div>
  )
}

function CanvasToolbar() {
  const [zoom, setZoom] = useState(86)
  const zoomOut = () => setZoom((value) => Math.max(50, value - 10))
  const zoomIn = () => setZoom((value) => Math.min(140, value + 10))
  const fitToScreen = () => setZoom(86)

  return (
    <div className="absolute bottom-5 left-1/2 z-30 flex h-11 -translate-x-1/2 items-center gap-1 rounded-xl border border-[#303844] bg-[#171b21] p-1 shadow-xl shadow-black/35">
      <ToolIcon icon={MousePointer2} label="Select" active />
      <ToolIcon icon={Wand2} label="Canvas assist" />
      <div className="mx-1 h-7 w-px bg-[#303844]" />
      <ToolIcon icon={ZoomOut} label="Zoom out" onClick={zoomOut} />
      <span className="min-w-10 text-center text-xs tabular-nums text-[#b7bdc8]">{zoom}%</span>
      <ToolIcon icon={ZoomIn} label="Zoom in" onClick={zoomIn} />
      <ToolIcon icon={Maximize2} label="Fit to screen" onClick={fitToScreen} />
    </div>
  )
}

function ToolIcon({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`aegis-interactive grid h-9 w-9 place-items-center rounded-lg active:scale-[0.96] ${
        active ? 'bg-[#20362b] text-[#b7f7d0]' : 'text-[#8f98a3] hover:bg-[#1c2229] hover:text-[#d4dad3]'
      }`}
    >
      {createElement(Icon, { className: 'h-[18px] w-[18px]' })}
    </button>
  )
}

function DiagramGroup({ icon: Icon, label, tone, dashed = false, className = '', children }) {
  const toneClass = {
    teal: 'border-[rgb(139_233_220/0.35)]',
    yellow: 'border-[rgb(242_204_96/0.35)]',
    violet: 'border-[rgb(210_168_255/0.28)]',
    lime: 'border-[rgb(126_231_135/0.28)]',
  }[tone]

  return (
    <section className={`relative rounded-xl border ${toneClass} ${dashed ? 'border-dashed' : ''} bg-[rgb(17_20_24/0.18)] ${className}`}>
      <div className="absolute -top-3 left-6 flex w-fit items-center gap-1.5 bg-[#0d1110] px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f98a3]">
        {createElement(Icon, { className: 'h-3.5 w-3.5 text-[#f2cc60]' })}
        {label}
      </div>
      {children}
    </section>
  )
}

function ArchitectureNode({ icon: Icon, label, badge, insight, muted = false, popoverSide = 'above', onOpenInsight }) {
  const popoverClass = popoverSide === 'left' ? 'right-[calc(100%+14px)] top-0' : 'bottom-[calc(100%+14px)] left-0'

  return (
    <div className="group relative z-20">
      <button
        className={`aegis-interactive relative h-[116px] w-[132px] rounded-xl border bg-[#171b21]/92 p-4 text-left shadow-xl shadow-black/25 hover:-translate-y-0.5 hover:border-[rgb(242_204_96/0.7)] hover:bg-[#1c2229] focus:outline-none focus:ring-2 focus:ring-[rgb(121_192_255/0.55)] ${
          insight ? 'border-[rgb(242_204_96/0.68)]' : muted ? 'border-[#3d4653]' : 'border-[#303844]'
        }`}
      >
        {createElement(Icon, { className: 'mb-9 h-5 w-5 text-[#f2cc60]' })}
        <span className="block text-sm font-semibold leading-tight text-[#f0f3f6]">{label}</span>
        {badge && <ResourceBadge value={badge} />}
      </button>
      {insight && (
        <div
          className={`aegis-surface pointer-events-none absolute z-30 w-[278px] overflow-hidden rounded-xl border opacity-0 backdrop-blur-xl transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 ${popoverClass}`}
        >
          <div className="flex items-center gap-3 border-b border-[#242a32] px-4 py-4">
            <AlertTriangle className="h-[18px] w-[18px] text-[#f2cc60]" />
            <div>
              <div className="text-sm font-semibold text-[#f0f3f6]">{insight.title}</div>
              <div className="mt-0.5 text-xs text-[#f2cc60]/75">{insight.severity} impact</div>
            </div>
          </div>
          <p className="px-4 py-4 text-sm leading-6 text-[#b7bdc8]">{insight.body}</p>
          <div className="border-t border-[#242a32] p-3">
            <button
              onClick={onOpenInsight}
              className="aegis-interactive h-10 w-full rounded-lg bg-white/[0.08] text-sm font-semibold text-[#f0f3f6] hover:bg-white/[0.13] active:scale-[0.98]"
            >
              View details
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ResourceBadge({ value }) {
  if (value === 'risk') {
    return (
      <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md bg-[#0c2d4f] text-[#79c0ff] shadow-lg shadow-blue-950/25">
        <Sparkles className="h-3.5 w-3.5" />
      </span>
    )
  }

  return <span className="absolute right-2 top-2 rounded-md bg-[#04260f] px-2 py-1 text-xs font-bold text-[#7ee787]">{value}</span>
}

function GeneratePanel({ mobile = false }) {
  return (
    <section className={`${mobile ? 'min-h-full' : ''} flex min-h-0 flex-col border-r border-[#242a32] bg-[#0d1110]`}>
      <div className="flex h-[64px] items-center justify-between border-b border-[#242a32] px-5">
        <div className="text-sm font-semibold">Generate</div>
        <div className="flex items-center gap-4 text-xs text-[#8f98a3]">
          <button className="aegis-interactive hover:text-[#f0f3f6]">New chat</button>
          <button className="aegis-interactive flex items-center gap-1 hover:text-[#f0f3f6]">
            <History className="h-3.5 w-3.5" />
            Chat history
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <Conversation />
      </div>
      <div className="border-t border-[#242a32] p-5">
        <div className="rounded-xl border border-[#303844] bg-[#111418]/80 p-3">
          <label className="sr-only" htmlFor="generate-reply">
            Reply
          </label>
          <input id="generate-reply" className="w-full bg-transparent text-sm outline-none placeholder:text-[#656c76]" placeholder="Reply..." />
          <div className="mt-4 flex items-center justify-between">
            <button className="aegis-interactive rounded-lg bg-white/[0.055] px-3 py-2 text-xs text-[#8f98a3] hover:bg-white/10 hover:text-[#d4dad3]">
              Attach plan
            </button>
            <button className="aegis-interactive rounded-lg bg-[#f2cc60] px-3 py-2 text-xs font-semibold text-[#11100d] hover:bg-[#ffe08a] active:scale-[0.98]">
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Conversation() {
  return (
    <div className="space-y-8">
      <ChatBubble side="right">Could you review this Terraform PR like a production architecture change?</ChatBubble>
      <p className="max-w-[82%] text-sm leading-6 text-[#b7bdc8]">
        Yes. I mapped the plan into tenant, subscription, account, and virtual network boundaries, then highlighted the risky resource changes.
      </p>
      <ChatBubble side="right">Show me the gate blockers and what security needs to approve.</ChatBubble>
      <div className="rounded-xl border border-[#f2cc60]/55 bg-[#341a00]/25 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#341a00] text-[#f2cc60]">
            <Wand2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Plan review summary</div>
            <div className="text-xs text-[#8f98a3]">High availability and reliability</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatBubble({ children, side }) {
  return (
    <div className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[74%] rounded-xl bg-white/[0.055] px-4 py-3 text-sm leading-6 text-[#d4dad3] shadow-lg shadow-black/10">{children}</div>
    </div>
  )
}

function DesignPreview({ onOpenInsight }) {
  return (
    <section className="min-h-0 bg-[#0d1110] p-5">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-[#242a32] bg-[#111418]">
        <div className="flex h-14 items-center justify-between border-b border-[#242a32] px-5">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold">Generated plan view</div>
            <span className="rounded-md bg-[#1d2a24] px-2 py-1 text-xs font-medium text-[#b7f7d0]">Current PR</span>
          </div>
          <button className="aegis-interactive rounded-lg bg-[#f2cc60] px-3 py-2 text-xs font-semibold text-[#11100d] hover:bg-[#ffe08a] active:scale-[0.98]">
            Save as Design
          </button>
        </div>
        <EnvironmentCanvas preview onOpenInsight={onOpenInsight} />
      </div>
    </section>
  )
}

function InsightView({ mobile = false }) {
  return (
    <main className={`${mobile ? 'min-h-full p-4' : 'grid h-full grid-cols-[minmax(0,1fr)_360px] gap-8 p-8'} overflow-y-auto bg-[#0d1110]`}>
      <section className="mx-auto w-full max-w-[860px]">
        <div className="mb-8 text-sm text-[#8f98a3]">
          Insights <span className="mx-2">›</span> <span className="text-[#f2cc60]">Workload misconfiguration</span> #5
        </div>
        <div className="mb-8 rounded-xl border border-[#242a32] bg-[#111418]/72 p-5">
          <div className="mb-3 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#341a00] text-[#f2cc60]">
              <Activity className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold">Description</h1>
          </div>
          <p className="max-w-[760px] text-sm leading-7 text-[#b7bdc8]">{insights[0].description}</p>
        </div>
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold">Mitigation</h2>
          <span className="text-xs text-[#656c76]">4 required steps</span>
        </div>
        <div className="space-y-4">
          {mitigationSteps.map((step, index) => (
            <div key={step} className="grid grid-cols-[34px_minmax(0,1fr)] gap-4 rounded-xl border border-[#242a32] bg-[#111418]/60 p-4">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-[#303844] text-xs text-[#b7bdc8]">{index + 1}</span>
              <p className="text-sm leading-7 text-[#b7bdc8]">{step}</p>
            </div>
          ))}
        </div>
      </section>
      {!mobile && <InsightProperties />}
    </main>
  )
}

function InsightProperties() {
  return (
    <aside className="space-y-4">
      <PropertyCard title="Properties">
        <Property label="Treatment" value="Mitigate" />
        <Property label="Status" value="Open" />
        <Property label="Assignees" value="2 Members" />
      </PropertyCard>
      <PropertyCard title="Affected area">
        <Property label="Architecture" value="Production EUW" />
        <Property label="Resource" value="Subscription" />
        <Property label="Resource ID" value="37a5-44d6-82d3" />
      </PropertyCard>
      <PropertyCard title="Impact">
        {impactRows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-2 text-sm text-[#b7bdc8]">
            <span>{label}</span>
            <span className="text-[#f2cc60]">{value}</span>
          </div>
        ))}
      </PropertyCard>
    </aside>
  )
}

function PropertyCard({ title, children }) {
  return (
    <div className="rounded-xl border border-[#242a32] bg-[#111418]/72 p-4">
      <div className="mb-4 text-sm font-semibold">{title}</div>
      {children}
    </div>
  )
}

function Property({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-5 py-2 text-sm">
      <span className="text-[#8f98a3]">{label}</span>
      <span className="truncate text-[#d4dad3]">{value}</span>
    </div>
  )
}

function QuietListView({ view, mobile = false, gateTarget = defaultGateTarget }) {
  const isActions = view === 'actions'
  const rows = isActions
    ? [
        [`PR #${gateTarget.pullRequest}`, gateTarget.state || 'Open', gateTarget.title || gateTarget.repository],
        ['Head commit', gateTarget.sha ? gateTarget.sha.slice(0, 7) : 'Pending', gateTarget.headRef || 'waiting'],
        ['Changed files', gateTarget.changedFiles || 'Unknown', gateTarget.additions && gateTarget.deletions ? `+${gateTarget.additions} / -${gateTarget.deletions}` : 'from GitHub'],
        ['Terraform plan', 'Passed', '41s'],
        ['isengard/plan-review', 'Action required', '1m 04s'],
      ]
    : [
        ['GDPR evidence', 'Linked', '2 controls'],
        ['Well-Architected review', 'Open', '4 notes'],
        ['Security approval', 'Pending', '1 owner'],
      ]

  return (
    <main className={`${mobile ? 'p-4' : 'h-full p-8'} bg-[#0d1110]`}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">{isActions ? 'GitHub Actions' : 'Compliance'}</h1>
          <p className="mt-2 text-sm text-[#8f98a3]">
            {isActions ? 'Gate sequence for the current pull request.' : 'Workspace guardrails attached to this environment.'}
          </p>
        </div>
        <div className="space-y-3">
          {rows.map(([label, state, meta]) => (
            <div key={label} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-xl border border-[#242a32] bg-[#111418]/72 px-4 py-3">
              <span className="truncate text-sm text-[#d4dad3]">{label}</span>
              <span className="rounded-md bg-white/[0.08] px-2 py-1 text-xs text-[#d4dad3]">{state}</span>
              <span className="max-w-[360px] truncate text-xs text-[#8f98a3]">{meta}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

function ResourceTree({ items, level }) {
  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <ResourceTreeItem key={item.id} item={item} level={level} />
      ))}
    </div>
  )
}

function ResourceTreeItem({ item, level }) {
  const [open, setOpen] = useState(true)
  const Icon = resourceIcons[item.icon] || Cloud
  const hasChildren = Boolean(item.children?.length)

  return (
    <div>
      <button
        type="button"
        onClick={() => hasChildren && setOpen((value) => !value)}
        aria-expanded={hasChildren ? open : undefined}
        className="aegis-interactive group flex w-full items-center gap-2 rounded-lg py-1.5 pr-2 text-left text-sm text-[#b7bdc8] hover:bg-white/[0.035] hover:text-[#f0f3f6]"
        style={{ paddingLeft: level * 15 + 4 }}
      >
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-[#8f98a3] transition ${hasChildren && open ? '' : '-rotate-90'} ${hasChildren ? '' : 'opacity-0'}`}
        />
        <Icon className="h-4 w-4 shrink-0 text-[#f2cc60]" />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {item.badge && <TreeBadge value={item.badge} />}
      </button>
      {hasChildren && open && <ResourceTree items={item.children} level={level + 1} />}
    </div>
  )
}

function TreeBadge({ value }) {
  return value === 'risk' ? (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#0c2d4f] text-[#79c0ff]">
      <Sparkles className="h-3 w-3" />
    </span>
  ) : (
    <span className="shrink-0 rounded-md bg-[#0c2d4f] px-2 py-0.5 text-[10px] font-bold text-[#79c0ff]">{value}</span>
  )
}

function ReviewScopeBadge({ gateTarget, compact = false }) {
  const label = gateTarget.changedFiles ? `${gateTarget.changedFiles} files` : 'Plan'
  const detail = gateTarget.context || 'Review gate'

  return (
    <div
      className={`flex h-10 shrink-0 items-center gap-3 rounded-lg border border-[#303844] bg-[#171b21] px-3 text-sm text-[#f0f3f6] shadow-sm shadow-black/20 ${
        compact ? 'min-w-[118px] justify-center' : 'min-w-[154px]'
      }`}
      title={detail}
    >
      <Layers className="h-4 w-4 text-[#79c0ff]" />
      <span className="font-medium">{label}</span>
      {!compact && <span className="max-w-[82px] truncate text-xs text-[#8f98a3]">{detail}</span>}
    </div>
  )
}
