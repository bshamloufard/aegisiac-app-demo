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
import { insights, mitigationSteps, resources, versions } from './reviewData'

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
  repository: 'bshamloufard/aegisiac-demo-actions-wall',
  pullRequest: '1',
  shortRef: '',
  sha: '',
  run: '',
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
  return `https://github.com/${target.repository}/pull/${target.pullRequest}`
}

export function ReviewDashboard() {
  const [view, setView] = useState('environment')
  const [version, setVersion] = useState(versions[0])
  const [gateTarget] = useState(() => readGateTarget())

  useEffect(() => {
    const resetRootView = () => {
      if (!window.location.hash) setView('environment')
    }

    resetRootView()
    window.addEventListener('pageshow', resetRootView)
    return () => window.removeEventListener('pageshow', resetRootView)
  }, [])

  return (
    <div className="h-dvh overflow-hidden bg-[#070b0a] text-zinc-100 antialiased">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(62,113,96,0.22),transparent_36%),linear-gradient(135deg,#15221f_0%,#070b0a_56%,#040504_100%)]" />
      <DesktopShell view={view} setView={setView} version={version} setVersion={setVersion} gateTarget={gateTarget} />
      <MobileShell view={view} setView={setView} version={version} setVersion={setVersion} gateTarget={gateTarget} />
    </div>
  )
}

function DesktopShell({ view, setView, version, setVersion, gateTarget }) {
  const compactRail = view !== 'insights' && view !== 'actions' && view !== 'compliance'

  return (
    <div className="relative hidden h-dvh overflow-hidden lg:block">
      <div
        className={`grid h-full w-full overflow-hidden border border-white/10 bg-[#070a09]/95 shadow-2xl shadow-black/70 ${
          compactRail ? 'grid-cols-[64px_minmax(0,1fr)]' : 'grid-cols-[240px_minmax(0,1fr)]'
        }`}
      >
        <Rail view={view} setView={setView} compact={compactRail} />
        {view === 'environment' && (
          <div className="grid min-h-0 grid-cols-[320px_minmax(0,1fr)]">
            <ResourceBrowser />
            <EnvironmentCanvas version={version} setVersion={setVersion} gateTarget={gateTarget} onOpenInsight={() => setView('insights')} />
          </div>
        )}
        {view === 'generate' && (
          <div className="grid min-h-0 grid-cols-[minmax(390px,0.48fr)_minmax(640px,1fr)]">
            <GeneratePanel />
            <DesignPreview version={version} setVersion={setVersion} onOpenInsight={() => setView('insights')} />
          </div>
        )}
        {view === 'insights' && <InsightView />}
        {(view === 'actions' || view === 'compliance') && <QuietListView view={view} />}
      </div>
    </div>
  )
}

function MobileShell({ view, setView, version, setVersion, gateTarget }) {
  return (
    <div className="relative h-dvh overflow-hidden lg:hidden">
      <header className="border-b border-white/10 bg-[#080b0a]/98 px-4 py-3">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button aria-label="Open menu" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.035]">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="truncate text-base font-semibold">Production Environment</div>
              <div className="truncate text-xs text-zinc-500">Isengard · PR #{gateTarget.pullRequest} blocked</div>
            </div>
          </div>
          <VersionSelect version={version} setVersion={setVersion} compact />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {views.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`h-10 rounded-lg px-2 text-xs font-medium transition ${
                view === item.id ? 'bg-zinc-100 text-zinc-950' : 'bg-white/[0.055] text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>
      <main className="h-[calc(100dvh-117px)] overflow-y-auto bg-[#080b0a]">
        {view === 'environment' && (
          <div className="min-h-full">
            <EnvironmentCanvas mobile version={version} setVersion={setVersion} onOpenInsight={() => setView('insights')} />
            <ResourceBrowser mobile />
          </div>
        )}
        {view === 'generate' && <GeneratePanel mobile />}
        {view === 'insights' && <InsightView mobile />}
        {(view === 'actions' || view === 'compliance') && <QuietListView view={view} mobile />}
      </main>
    </div>
  )
}

function Rail({ view, setView, compact = false }) {
  return (
    <aside className={`flex min-h-0 flex-col border-r border-white/10 bg-[#060908] ${compact ? 'items-center px-3 py-5' : 'px-4 py-5'}`}>
      <button
        aria-label="Open Isengard home"
        onClick={() => setView('environment')}
        className="mb-7 grid h-9 w-9 place-items-center rounded-lg text-zinc-100 transition hover:bg-white/[0.06]"
      >
        <Sparkles className="h-5 w-5" />
      </button>
      <nav className={`flex flex-1 flex-col ${compact ? 'items-center gap-3' : 'gap-2'}`} aria-label="Workspace navigation">
        {views.map((item) => {
          const Icon = item.icon
          const active = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              title={compact ? item.label : undefined}
              aria-label={item.label}
              className={`group flex items-center gap-3 rounded-lg text-sm font-medium transition active:scale-[0.98] ${
                compact ? 'h-9 w-9 justify-center' : 'h-10 w-full px-3'
              } ${active ? 'bg-white/[0.09] text-zinc-100' : 'text-zinc-500 hover:bg-white/[0.045] hover:text-zinc-200'}`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-orange-300' : ''}`} />
              {!compact && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>
      <div className={compact ? 'grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-xs font-bold' : 'rounded-lg border border-white/10 bg-white/[0.03] p-2'}>
        {compact ? (
          'I'
        ) : (
          <div className="flex items-center justify-between gap-3">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-blue-600 text-xs font-bold">I</span>
            <span className="min-w-0 flex-1 truncate text-sm text-zinc-300">Isengard</span>
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          </div>
        )}
      </div>
    </aside>
  )
}

function ResourceBrowser({ mobile = false }) {
  return (
    <aside className={`${mobile ? 'border-t' : 'border-r'} min-h-0 border-white/10 bg-[#101511]/96`}>
      {!mobile && (
        <div className="flex h-[72px] items-center gap-4 border-b border-white/10 px-5">
          <button aria-label="Back to published designs" className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-100">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">Production Environment</div>
            <div className="truncate text-xs text-zinc-500">Mapped from Terraform plan 6fd9c93</div>
          </div>
        </div>
      )}
      <div className="border-b border-white/10 p-4">
        <label className="flex h-11 items-center gap-3 rounded-lg border border-white/10 bg-black/25 px-3 transition focus-within:border-orange-300/60">
          <Search className="h-[18px] w-[18px] text-zinc-500" />
          <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500" placeholder="Search resources..." />
          <Activity className="h-4 w-4 text-zinc-500" />
        </label>
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <div className="text-sm font-semibold">Resources</div>
          <div className="mt-1 text-xs text-zinc-600">Groups mirror the canvas hierarchy</div>
        </div>
        <Layers className="h-5 w-5 text-zinc-500" />
      </div>
      <div className={`${mobile ? 'max-h-[420px]' : 'h-[calc(100%-206px)]'} overflow-y-auto px-4 pb-5`}>
        <ResourceTree items={resources} level={0} />
      </div>
    </aside>
  )
}

function EnvironmentCanvas({ version, setVersion, gateTarget = defaultGateTarget, mobile = false, onOpenInsight, preview = false }) {
  if (mobile) {
    return <MobileEnvironmentCanvas onOpenInsight={onOpenInsight} />
  }

  return (
    <section className="relative min-h-0 overflow-hidden bg-[#070b0a]">
      <CanvasTexture />
      {!preview && !mobile && <CanvasTopbar version={version} setVersion={setVersion} gateTarget={gateTarget} />}
      {!preview && !mobile && <CanvasToolbar />}
      <div
        className={`${
          preview ? 'h-[760px] w-[1160px] origin-top-left scale-[0.78]' : 'flex h-full min-h-[720px] w-full items-start justify-center px-10 pb-24 pt-[58px]'
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
    <section className="relative h-[530px] overflow-hidden border-b border-white/10 bg-[#070b0a] p-4">
      <CanvasTexture />
      <div className="relative h-full rounded-xl border border-teal-300/55 bg-[#07100e]/45 p-4">
        <CanvasLabel icon={Home} label="Tenant" className="-top-2 left-5" />

        <div className="relative h-[270px] rounded-xl border border-yellow-300/70 bg-black/[0.08] p-4">
          <CanvasLabel icon={Cloud} label="Subscription" className="-top-2 left-5" />
          <div className="relative h-full rounded-xl border border-fuchsia-400/60 p-4">
            <CanvasLabel icon={Activity} label="Account" className="-top-2 left-5" />
            <div className="relative mt-5 h-[164px] rounded-xl border border-dashed border-lime-300/55 p-4">
              <CanvasLabel icon={RadioTower} label="Virtual network" className="-top-2 left-5" />
              <div className="flex h-full items-center justify-center gap-3">
                <MobileNode icon={Server} label="API service" risk onOpenInsight={onOpenInsight} />
                <MobileNode icon={Layers} label="Session cache" badge="MOD" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_0.72fr] gap-3">
          <div className="relative rounded-xl border border-yellow-300/60 bg-black/[0.08] p-4">
            <CanvasLabel icon={Cloud} label="Data" className="-top-2 left-5" />
            <div className="relative h-[128px] rounded-xl border border-dashed border-lime-300/55 p-3">
              <CanvasLabel icon={RadioTower} label="Subnet" className="-top-2 left-5" />
              <MobileNode icon={Database} label="Primary database" badge="2" compact />
            </div>
          </div>
          <div className="relative rounded-xl border border-dashed border-teal-300/45 bg-black/[0.08] p-4">
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
    <div className={`absolute flex w-fit items-center gap-1.5 bg-[#070b0a] px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 ${className}`}>
      {createElement(Icon, { className: 'h-3.5 w-3.5 text-orange-400' })}
      {label}
    </div>
  )
}

function MobileNode({ icon: Icon, label, badge, risk = false, compact = false, onOpenInsight }) {
  return (
    <button
      onClick={risk ? onOpenInsight : undefined}
      className={`relative rounded-xl border bg-[#1b211d]/95 p-3 text-left shadow-xl shadow-black/25 transition active:scale-[0.98] ${
        compact ? 'h-[96px] w-full' : 'h-[106px] min-w-0 flex-1'
      } ${risk ? 'border-orange-400/80' : 'border-white/10'}`}
    >
      {createElement(Icon, { className: 'mb-5 h-5 w-5 text-orange-400' })}
      <span className="block text-sm font-semibold leading-tight text-zinc-100">{label}</span>
      {risk && (
        <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md bg-blue-500/20 text-blue-200">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
      )}
      {badge && <span className="absolute right-2 top-2 rounded-md bg-teal-400/10 px-1.5 py-1 text-[10px] font-bold text-teal-200">{badge}</span>}
    </button>
  )
}

function CanvasTexture() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14)_1px,transparent_1.7px)] bg-[length:28px_28px] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_34%_10%,rgba(47,144,119,0.12),transparent_34%),radial-gradient(circle_at_84%_76%,rgba(255,122,24,0.07),transparent_28%)]" />
    </>
  )
}

function CanvasTopbar({ version, setVersion, gateTarget }) {
  return (
    <div className="absolute right-5 top-5 z-30 flex items-center gap-2">
      <a
        href={githubPullRequestUrl(gateTarget)}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 text-sm text-zinc-300 transition hover:border-orange-300/50 hover:bg-white/10 hover:text-zinc-100"
      >
        PR #{gateTarget.pullRequest}
      </a>
      <GitHubGateControl gateTarget={gateTarget} />
      <VersionSelect version={version} setVersion={setVersion} />
    </div>
  )
}

function GitHubGateControl({ gateTarget }) {
  const [state, setState] = useState('pending')
  const [busy, setBusy] = useState(null)
  const [message, setMessage] = useState('Waiting for website approval')

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
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#111713]/95 p-1 shadow-xl shadow-black/30">
      <div
        className={`hidden max-w-[220px] truncate px-2 text-xs lg:block ${
          state === 'error' ? 'text-rose-300' : approved ? 'text-emerald-300' : rejected ? 'text-orange-300' : 'text-zinc-500'
        }`}
        title={message}
      >
        {message}
      </div>
      <button
        type="button"
        onClick={() => submitDecision('rejected')}
        disabled={Boolean(busy)}
        className={`grid h-8 w-8 place-items-center rounded-md transition active:scale-[0.96] disabled:cursor-wait disabled:opacity-60 ${
          rejected ? 'bg-orange-500/20 text-orange-200' : 'text-zinc-500 hover:bg-white/[0.07] hover:text-orange-200'
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
        className={`grid h-8 w-8 place-items-center rounded-md transition active:scale-[0.96] disabled:cursor-wait disabled:opacity-60 ${
          approved ? 'bg-emerald-500/20 text-emerald-200' : 'bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20'
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
  return (
    <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-white/10 bg-[#151a16]/92 p-1.5 shadow-2xl shadow-black/45">
      <ToolIcon icon={MousePointer2} label="Select" active />
      <ToolIcon icon={Wand2} label="Canvas assist" />
      <div className="mx-1 h-7 w-px bg-white/10" />
      <ToolIcon icon={ZoomOut} label="Zoom out" />
      <ToolIcon icon={ZoomIn} label="Zoom in" />
      <ToolIcon icon={Maximize2} label="Fit to screen" />
    </div>
  )
}

function ToolIcon({ icon: Icon, label, active = false }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-lg transition active:scale-[0.96] ${
        active ? 'bg-white/10 text-zinc-100' : 'text-zinc-500 hover:bg-white/[0.07] hover:text-zinc-200'
      }`}
    >
      {createElement(Icon, { className: 'h-[18px] w-[18px]' })}
    </button>
  )
}

function DiagramGroup({ icon: Icon, label, tone, dashed = false, className = '', children }) {
  const toneClass = {
    teal: 'border-teal-300/55',
    yellow: 'border-yellow-300/65',
    violet: 'border-fuchsia-400/55',
    lime: 'border-lime-300/55',
  }[tone]

  return (
    <section className={`relative rounded-xl border ${toneClass} ${dashed ? 'border-dashed' : ''} bg-[#07100e]/20 ${className}`}>
      <div className="absolute -top-3 left-6 flex w-fit items-center gap-1.5 bg-[#070b0a] px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {createElement(Icon, { className: 'h-3.5 w-3.5 text-orange-400' })}
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
        className={`relative h-[116px] w-[132px] rounded-xl border bg-[#1b211d]/95 p-4 text-left shadow-xl shadow-black/30 transition duration-200 hover:-translate-y-0.5 hover:border-orange-300/90 hover:bg-[#222820] focus:outline-none focus:ring-2 focus:ring-orange-300/70 ${
          insight ? 'border-orange-400/75' : muted ? 'border-white/14' : 'border-white/10'
        }`}
      >
        {createElement(Icon, { className: 'mb-9 h-5 w-5 text-orange-400' })}
        <span className="block text-sm font-semibold leading-tight text-zinc-100">{label}</span>
        {badge && <ResourceBadge value={badge} />}
      </button>
      {insight && (
        <div
          className={`pointer-events-none absolute z-30 w-[278px] overflow-hidden rounded-xl border border-white/10 bg-[#303830]/95 opacity-0 shadow-2xl shadow-black/45 backdrop-blur-xl transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 ${popoverClass}`}
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
            <AlertTriangle className="h-[18px] w-[18px] text-orange-400" />
            <div>
              <div className="text-sm font-semibold text-zinc-100">{insight.title}</div>
              <div className="mt-0.5 text-xs text-orange-200/75">{insight.severity} impact</div>
            </div>
          </div>
          <p className="px-4 py-4 text-sm leading-6 text-zinc-300">{insight.body}</p>
          <div className="border-t border-white/10 p-3">
            <button
              onClick={onOpenInsight}
              className="h-10 w-full rounded-lg bg-white/[0.105] text-sm font-semibold text-zinc-100 transition hover:bg-white/[0.16] active:scale-[0.98]"
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
      <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md bg-blue-500/20 text-blue-200 shadow-lg shadow-blue-950/30">
        <Sparkles className="h-3.5 w-3.5" />
      </span>
    )
  }

  return <span className="absolute right-2 top-2 rounded-md bg-teal-400/10 px-2 py-1 text-xs font-bold text-teal-200">{value}</span>
}

function GeneratePanel({ mobile = false }) {
  return (
    <section className={`${mobile ? 'min-h-full' : ''} flex min-h-0 flex-col border-r border-white/10 bg-[#080b0a]`}>
      <div className="flex h-[64px] items-center justify-between border-b border-white/10 px-5">
        <div className="text-sm font-semibold">Generate</div>
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <button className="transition hover:text-zinc-100">New chat</button>
          <button className="flex items-center gap-1 transition hover:text-zinc-100">
            <History className="h-3.5 w-3.5" />
            Chat history
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <Conversation />
      </div>
      <div className="border-t border-white/10 p-5">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <label className="sr-only" htmlFor="generate-reply">
            Reply
          </label>
          <input id="generate-reply" className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600" placeholder="Reply..." />
          <div className="mt-4 flex items-center justify-between">
            <button className="rounded-lg bg-white/[0.055] px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/10 hover:text-zinc-200">
              Attach plan
            </button>
            <button className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-black transition hover:bg-orange-400 active:scale-[0.98]">
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
      <p className="max-w-[82%] text-sm leading-6 text-zinc-300">
        Yes. I mapped the plan into tenant, subscription, account, and virtual network boundaries, then highlighted the risky resource changes.
      </p>
      <ChatBubble side="right">Show me the gate blockers and what security needs to approve.</ChatBubble>
      <div className="rounded-xl border border-orange-400/70 bg-orange-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-orange-500/15 text-orange-300">
            <Wand2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">Production SQL review</div>
            <div className="text-xs text-zinc-500">High availability and reliability</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatBubble({ children, side }) {
  return (
    <div className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[74%] rounded-xl bg-white/[0.055] px-4 py-3 text-sm leading-6 text-zinc-200 shadow-lg shadow-black/10">{children}</div>
    </div>
  )
}

function DesignPreview({ version, setVersion, onOpenInsight }) {
  return (
    <section className="min-h-0 bg-[#070b0a] p-5">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#101511]">
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold">SQL Server</div>
            <VersionSelect version={version} setVersion={setVersion} />
          </div>
          <button className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-black transition hover:bg-orange-400 active:scale-[0.98]">
            Save as Design
          </button>
        </div>
        <EnvironmentCanvas version={version} setVersion={setVersion} preview onOpenInsight={onOpenInsight} />
      </div>
    </section>
  )
}

function InsightView({ mobile = false }) {
  return (
    <main className={`${mobile ? 'min-h-full p-4' : 'grid h-full grid-cols-[minmax(0,1fr)_360px] gap-8 p-8'} overflow-y-auto bg-[#080b0a]`}>
      <section className="mx-auto w-full max-w-[860px]">
        <div className="mb-8 text-sm text-zinc-500">
          Insights <span className="mx-2">›</span> <span className="text-orange-300">Workload misconfiguration</span> #5
        </div>
        <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.025] p-5">
          <div className="mb-3 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-orange-500/12 text-orange-300">
              <Activity className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-semibold">Description</h1>
          </div>
          <p className="max-w-[760px] text-sm leading-7 text-zinc-400">{insights[0].description}</p>
        </div>
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold">Mitigation</h2>
          <span className="text-xs text-zinc-600">4 required steps</span>
        </div>
        <div className="space-y-4">
          {mitigationSteps.map((step, index) => (
            <div key={step} className="grid grid-cols-[34px_minmax(0,1fr)] gap-4 rounded-xl border border-white/10 bg-white/[0.022] p-4">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-white/10 text-xs text-zinc-400">{index + 1}</span>
              <p className="text-sm leading-7 text-zinc-400">{step}</p>
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
          <div key={label} className="flex items-center justify-between py-2 text-sm text-zinc-400">
            <span>{label}</span>
            <span className="text-orange-300">{value}</span>
          </div>
        ))}
      </PropertyCard>
    </aside>
  )
}

function PropertyCard({ title, children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <div className="mb-4 text-sm font-semibold">{title}</div>
      {children}
    </div>
  )
}

function Property({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-5 py-2 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="truncate text-zinc-300">{value}</span>
    </div>
  )
}

function QuietListView({ view, mobile = false }) {
  const isActions = view === 'actions'
  const rows = isActions
    ? [
        ['Terraform plan', 'Passed', '41s'],
        ['Checkov policy', 'Blocked', '18s'],
        ['Infracost delta', 'Warning', '9s'],
        ['isengard/plan-review', 'Action required', '1m 04s'],
      ]
    : [
        ['GDPR evidence', 'Linked', '2 controls'],
        ['Well-Architected review', 'Open', '4 notes'],
        ['Security approval', 'Pending', '1 owner'],
      ]

  return (
    <main className={`${mobile ? 'p-4' : 'h-full p-8'} bg-[#080b0a]`}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">{isActions ? 'GitHub Actions' : 'Compliance'}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {isActions ? 'Gate sequence for the current pull request.' : 'Workspace guardrails attached to this environment.'}
          </p>
        </div>
        <div className="space-y-3">
          {rows.map(([label, state, meta]) => (
            <div key={label} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
              <span className="text-sm text-zinc-200">{label}</span>
              <span className="rounded-md bg-white/[0.08] px-2 py-1 text-xs text-zinc-300">{state}</span>
              <span className="text-xs text-zinc-500">{meta}</span>
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
      {items.map((item) => {
        const Icon = resourceIcons[item.icon] || Cloud
        return (
          <div key={item.id}>
            <div
              className="group flex items-center gap-2 rounded-lg py-1.5 pr-2 text-sm text-zinc-300 transition hover:bg-white/[0.035]"
              style={{ paddingLeft: level * 15 + 4 }}
            >
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
              <Icon className="h-4 w-4 shrink-0 text-orange-400" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge && <TreeBadge value={item.badge} />}
            </div>
            {item.children && <ResourceTree items={item.children} level={level + 1} />}
          </div>
        )
      })}
    </div>
  )
}

function TreeBadge({ value }) {
  return value === 'risk' ? (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-blue-500/16 text-blue-200">
      <Sparkles className="h-3 w-3" />
    </span>
  ) : (
    <span className="shrink-0 rounded-md bg-blue-500/16 px-2 py-0.5 text-[10px] font-bold text-blue-200">{value}</span>
  )
}

function VersionSelect({ version, setVersion, compact = false }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className={`flex h-10 items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#111713] px-3 text-sm text-zinc-100 transition hover:border-white/20 hover:bg-white/[0.055] ${
          compact ? 'min-w-[106px]' : 'min-w-[132px]'
        }`}
      >
        {version}
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[190px] overflow-hidden rounded-xl border border-white/10 bg-[#303830]/98 p-2 shadow-2xl shadow-black/40">
          {versions.map((item) => (
            <button
              key={item}
              onClick={() => {
                setVersion(item)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${
                item === version ? 'bg-white/15 text-white' : 'text-zinc-300 hover:bg-white/10'
              }`}
            >
              {item === version && <Check className="h-4 w-4" />}
              <span className={item === version ? '' : 'ml-7'}>{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
