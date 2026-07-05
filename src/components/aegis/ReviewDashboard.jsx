import {
  Activity,
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  Cloud,
  Database,
  GitBranch,
  GitPullRequest,
  History,
  Home,
  Layers,
  Menu,
  RadioTower,
  Search,
  Shield,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { ArchitectureDiagram } from './ArchitectureDiagram'
import { actionRuns, chatMessages, insights, mitigationSteps, resources, versions } from './reviewData'

const iconMap = {
  Cloud,
  Database,
  Globe2: Activity,
  Home,
  Layers,
  RadioTower,
}

const nav = [
  { label: 'Home', icon: Home },
  { label: 'Published', icon: Cloud },
  { label: 'Designs', icon: GitBranch },
  { label: 'Generate', icon: Wand2, active: true },
  { label: 'Insights', icon: Sparkles },
  { label: 'Actions', icon: Activity },
  { label: 'Compliance', icon: Shield },
]

export function ReviewDashboard() {
  const [mobilePanel, setMobilePanel] = useState('diagram')
  const [version, setVersion] = useState(versions[0])

  return (
    <div className="min-h-screen overflow-hidden bg-[#111817] text-zinc-100">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(20,184,166,0.24),transparent_31%),radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.12),transparent_28%),linear-gradient(135deg,#13201e,#070908_58%)]" />
      <DesktopExperience version={version} setVersion={setVersion} />
      <MobileExperience version={version} setVersion={setVersion} mobilePanel={mobilePanel} setMobilePanel={setMobilePanel} />
    </div>
  )
}

function DesktopExperience({ version, setVersion }) {
  return (
    <div className="relative hidden min-h-screen place-items-center p-8 lg:grid">
      <div className="grid h-[78vh] min-h-[680px] w-full max-w-[1320px] grid-cols-[64px_minmax(430px,0.82fr)_minmax(640px,1.18fr)] overflow-hidden rounded-xl border border-white/10 bg-[#080a09]/95 shadow-2xl shadow-black/60">
        <Rail />

        <section className="flex min-w-0 flex-col border-r border-white/10">
          <TopBar title="Generate" />
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            <Conversation />
            <ActionWall compact />
          </div>
          <Composer />
        </section>

        <section className="grid min-w-0 grid-rows-[auto_minmax(0,1fr)]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-sm font-semibold">SQL Server production review</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                  <GitPullRequest className="h-3.5 w-3.5" />
                  bshamloufard/aegisiac-demo-actions-wall · PR #1
                </div>
              </div>
              <VersionSelect version={version} setVersion={setVersion} />
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300">
                Save as Design
              </button>
              <button className="rounded-md p-2 text-zinc-400 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 overflow-auto p-5">
            <div className="grid min-w-[980px] grid-cols-[260px_minmax(0,1fr)] gap-5">
              <ResourcePanel />
              <div className="space-y-5">
                <ArchitectureDiagram />
                <InsightsStrip />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function MobileExperience({ version, setVersion, mobilePanel, setMobilePanel }) {
  return (
    <div className="relative min-h-screen lg:hidden">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090c0b]/95 px-4 py-3 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="rounded-md p-2 text-zinc-300">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="text-base font-semibold">AegisIaC</div>
              <div className="text-xs text-zinc-500">Live GitHub Actions demo</div>
            </div>
          </div>
          <VersionSelect version={version} setVersion={setVersion} mobile />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {['diagram', 'resources', 'insights', 'actions'].map((panel) => (
            <button
              key={panel}
              onClick={() => setMobilePanel(panel)}
              className={`rounded-md px-2 py-2 text-xs capitalize ${
                mobilePanel === panel ? 'bg-white text-zinc-950' : 'bg-white/5 text-zinc-400'
              }`}
            >
              {panel}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 py-4">
        {mobilePanel === 'diagram' && (
          <div className="space-y-4">
            <MobileGateCard />
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <ArchitectureDiagram compact />
            </div>
          </div>
        )}
        {mobilePanel === 'resources' && <ResourcePanel mobile />}
        {mobilePanel === 'insights' && <InsightDetail />}
        {mobilePanel === 'actions' && <ActionWall />}
      </main>
    </div>
  )
}

function Rail() {
  return (
    <aside className="flex flex-col items-center border-r border-white/10 py-5">
      <Sparkles className="mb-7 h-5 w-5 text-white" />
      <nav className="flex flex-1 flex-col items-center gap-3">
        {nav.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              className={`rounded-lg p-2.5 ${item.active ? 'bg-white/10 text-orange-300' : 'text-zinc-500 hover:text-zinc-200'}`}
              title={item.label}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
      </nav>
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-xs font-bold">E</div>
    </aside>
  )
}

function TopBar({ title }) {
  return (
    <div className="flex h-[65px] items-center justify-between border-b border-white/10 px-5">
      <div className="text-sm font-semibold">{title}</div>
      <div className="flex items-center gap-4 text-xs text-zinc-400">
        <button>New chat</button>
        <button className="flex items-center gap-1">
          <History className="h-3.5 w-3.5" />
          Chat history
        </button>
      </div>
    </div>
  )
}

function Conversation() {
  return (
    <div className="space-y-5">
      {chatMessages.map((message, index) => (
        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[84%] rounded-lg px-4 py-3 text-sm leading-6 ${
              message.role === 'user' ? 'bg-white/7 text-zinc-200' : 'text-zinc-300'
            }`}
          >
            {message.text}
          </div>
        </div>
      ))}

      <div className="rounded-lg border border-orange-400/70 bg-orange-500/5 p-4">
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-500/15 text-orange-300">
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

function Composer() {
  return (
    <div className="border-t border-white/10 p-5">
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
        <input className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600" placeholder="Reply..." />
        <div className="mt-4 flex items-center justify-between">
          <button className="rounded-md bg-white/5 px-3 py-2 text-xs text-zinc-400">Attach plan</button>
          <button className="rounded-md bg-orange-500 px-3 py-2 text-xs font-semibold text-black">Send</button>
        </div>
      </div>
      <div className="mt-3 text-center text-[11px] text-zinc-600">AI may make mistakes. Verify important infrastructure changes.</div>
    </div>
  )
}

function ResourcePanel({ mobile = false }) {
  return (
    <aside className={`rounded-lg border border-white/10 bg-[#111513]/95 ${mobile ? '' : 'h-[680px]'} overflow-hidden`}>
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <ArrowLeft className="h-5 w-5 text-zinc-300" />
        <div className="text-xl font-semibold">Production Environment</div>
      </div>
      <div className="border-b border-white/10 p-4">
        <label className="flex h-11 items-center gap-3 rounded-md border border-white/10 bg-black/30 px-3">
          <Search className="h-5 w-5 text-zinc-500" />
          <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500" placeholder="Search resources..." />
        </label>
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <div className="text-sm font-semibold">Resources</div>
        <Layers className="h-5 w-5 text-zinc-500" />
      </div>
      <div className="px-4 pb-5">
        <ResourceTree items={resources} level={0} />
      </div>
    </aside>
  )
}

function ResourceTree({ items, level }) {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const Icon = iconMap[item.icon] || Cloud
        return (
          <div key={item.id}>
            <div className="flex items-center gap-2 py-1.5 text-sm text-zinc-300" style={{ paddingLeft: level * 16 }}>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
              <Icon className="h-4 w-4 text-orange-400" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-300">{item.badge}</span>
              )}
            </div>
            {item.children && <ResourceTree items={item.children} level={level + 1} />}
          </div>
        )
      })}
    </div>
  )
}

function VersionSelect({ version, setVersion, mobile = false }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className={`flex items-center justify-between gap-3 rounded-md bg-[#111513] px-3 py-2 text-sm text-zinc-100 ${
          mobile ? 'min-w-[108px]' : 'min-w-[132px] border border-white/10'
        }`}
      >
        {version}
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[190px] overflow-hidden rounded-lg border border-white/10 bg-[#303a31]/95 p-2 shadow-2xl">
          {versions.map((item) => (
            <button
              key={item}
              onClick={() => {
                setVersion(item)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm ${
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

function InsightsStrip() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {insights.map((insight) => (
        <div key={insight.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold">{insight.title}</span>
            <span className="text-xs text-orange-300">{insight.severity}</span>
          </div>
          <p className="line-clamp-3 text-sm leading-5 text-zinc-400">{insight.description}</p>
        </div>
      ))}
    </div>
  )
}

function InsightDetail() {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0b0e0d]/95 p-5">
      <div className="mb-6 text-sm text-zinc-500">Insights &gt; Workload misconfiguration #5</div>
      <h1 className="mb-3 text-xl font-semibold">Description</h1>
      <p className="text-sm leading-6 text-zinc-400">{insights[0].description}</p>
      <h2 className="mb-4 mt-8 text-lg font-semibold">Mitigation</h2>
      <div className="space-y-5">
        {mitigationSteps.map((step, index) => (
          <div key={step} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs text-zinc-400">
              {index + 1}
            </span>
            <p className="text-sm leading-6 text-zinc-300">{step}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ActionWall({ compact = false }) {
  return (
    <section className={`mt-6 rounded-lg border border-white/10 bg-white/[0.035] p-4 ${compact ? '' : 'mt-0'}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">GitHub Actions wall</div>
          <div className="mt-1 text-xs text-zinc-500">Live demo repo gate sequence</div>
        </div>
        <GitPullRequest className="h-4 w-4 text-zinc-500" />
      </div>
      <div className="space-y-2">
        {actionRuns.map((run) => (
          <div key={run.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-md bg-black/20 px-3 py-2 text-sm">
            <span className="truncate text-zinc-300">{run.label}</span>
            <span
              className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                run.state === 'Passed'
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : run.state === 'Blocked'
                    ? 'bg-red-500/15 text-red-300'
                    : 'bg-orange-500/15 text-orange-300'
              }`}
            >
              {run.state}
            </span>
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock3 className="h-3 w-3" />
              {run.time}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function MobileGateCard() {
  return (
    <section className="rounded-lg border border-orange-400/30 bg-orange-500/10 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-orange-100">aegis/plan-review</span>
        <span className="rounded bg-orange-400/20 px-2 py-1 text-xs font-semibold text-orange-200">Action required</span>
      </div>
      <p className="text-sm leading-6 text-zinc-300">
        Security approval is required because this plan introduces public ingress and replaces a stateful database.
      </p>
    </section>
  )
}
