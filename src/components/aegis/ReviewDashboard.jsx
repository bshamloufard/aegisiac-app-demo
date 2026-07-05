import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  Cloud,
  Database,
  DollarSign,
  FileJson,
  GitBranch,
  GitPullRequest,
  Home,
  Layers,
  Menu,
  RadioTower,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { ArchitectureDiagram } from './ArchitectureDiagram'
import { actionRuns, insights, resources, versions } from './reviewData'

const iconMap = {
  Cloud,
  Database,
  Globe2: Activity,
  Home,
  Layers,
  RadioTower,
}

const summary = [
  { label: 'Risk tier', value: 'High', detail: 'Security approval required', icon: ShieldAlert, tone: 'text-red-300' },
  { label: 'Monthly delta', value: '+$574', detail: 'Above workspace threshold', icon: DollarSign, tone: 'text-orange-300' },
  { label: 'Resources', value: '4', detail: '1 create, 2 update, 1 replace', icon: Layers, tone: 'text-zinc-100' },
  { label: 'Plan hash', value: '6fd9c93', detail: 'Approvals bind to this plan', icon: FileJson, tone: 'text-blue-300' },
]

const nav = [
  { label: 'Review', icon: GitPullRequest, active: true },
  { label: 'Resources', icon: Layers },
  { label: 'Findings', icon: Shield },
  { label: 'Actions', icon: Activity },
]

export function ReviewDashboard() {
  const [mobilePanel, setMobilePanel] = useState('overview')
  const [version, setVersion] = useState(versions[0])

  return (
    <div className="min-h-screen bg-[#090d0c] text-zinc-100">
      <DesktopExperience version={version} setVersion={setVersion} />
      <MobileExperience version={version} setVersion={setVersion} mobilePanel={mobilePanel} setMobilePanel={setMobilePanel} />
    </div>
  )
}

function DesktopExperience({ version, setVersion }) {
  return (
    <div className="hidden h-screen grid-cols-[64px_minmax(0,1fr)] lg:grid">
      <Rail />
      <div className="grid min-w-0 grid-rows-[64px_minmax(0,1fr)]">
        <Header version={version} setVersion={setVersion} />
        <main className="grid min-h-0 grid-cols-[300px_minmax(0,1fr)_340px] border-t border-white/10">
          <LeftPanel />
          <section className="flex min-w-0 flex-col border-x border-white/10">
            <RunSummary />
            <ArchitectureDiagram />
          </section>
          <RightPanel />
        </main>
      </div>
    </div>
  )
}

function MobileExperience({ version, setVersion, mobilePanel, setMobilePanel }) {
  return (
    <div className="min-h-screen lg:hidden">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090d0c]/95 px-4 py-3 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="rounded-md border border-white/10 p-2 text-zinc-300">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="text-sm font-semibold">SQL Server production review</div>
              <div className="text-xs text-zinc-500">PR #1 · aegis/plan-review blocked</div>
            </div>
          </div>
          <VersionSelect version={version} setVersion={setVersion} mobile />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {['overview', 'diagram', 'findings', 'approve'].map((panel) => (
            <button
              key={panel}
              onClick={() => setMobilePanel(panel)}
              className={`rounded-md px-2 py-2 text-xs capitalize ${
                mobilePanel === panel ? 'bg-zinc-100 text-zinc-950' : 'bg-white/5 text-zinc-400'
              }`}
            >
              {panel}
            </button>
          ))}
        </div>
      </header>

      <main className="space-y-4 px-4 py-4">
        {mobilePanel === 'overview' && (
          <>
            <ApprovalGate />
            <div className="grid grid-cols-2 gap-3">
              {summary.map((item) => (
                <SummaryTile key={item.label} item={item} />
              ))}
            </div>
            <ActionWall />
          </>
        )}
        {mobilePanel === 'diagram' && (
          <div className="h-[640px] overflow-hidden rounded-lg border border-white/10">
            <ArchitectureDiagram compact />
          </div>
        )}
        {mobilePanel === 'findings' && <FindingsPanel />}
        {mobilePanel === 'approve' && <ApprovalPanel />}
      </main>
    </div>
  )
}

function Header({ version, setVersion }) {
  return (
    <header className="flex min-w-0 items-center justify-between bg-[#0b0f0e] px-5">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <GitPullRequest className="h-4 w-4 text-blue-300" />
          SQL Server production review
          <span className="rounded bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-300">Blocked</span>
        </div>
        <div className="mt-1 truncate text-xs text-zinc-500">
          bshamloufard/aegisiac-demo-actions-wall · PR #1 · head 0db321f · branch demo/approve-to-unblock
        </div>
      </div>
      <div className="flex items-center gap-3">
        <a
          className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-300 hover:bg-white/10"
          href="https://github.com/bshamloufard/aegisiac-demo-actions-wall/pull/1"
          target="_blank"
          rel="noreferrer"
        >
          Open PR
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
        <VersionSelect version={version} setVersion={setVersion} />
      </div>
    </header>
  )
}

function Rail() {
  return (
    <aside className="flex flex-col items-center border-r border-white/10 bg-[#080b0a] py-4">
      <Sparkles className="mb-7 h-5 w-5 text-white" />
      <nav className="flex flex-1 flex-col items-center gap-2">
        {nav.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              className={`rounded-lg p-2.5 ${item.active ? 'bg-orange-500/15 text-orange-300' : 'text-zinc-500 hover:text-zinc-200'}`}
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

function LeftPanel() {
  return (
    <aside className="flex min-h-0 flex-col bg-[#0d1110]">
      <div className="border-b border-white/10 p-4">
        <ApprovalGate />
      </div>
      <div className="border-b border-white/10 p-4">
        <label className="flex h-10 items-center gap-3 rounded-md border border-white/10 bg-black/25 px-3">
          <Search className="h-4 w-4 text-zinc-500" />
          <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500" placeholder="Search resources..." />
        </label>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Resources</div>
          <span className="text-xs text-zinc-500">Changed focus</span>
        </div>
        <ResourceTree items={resources} level={0} />
      </div>
    </aside>
  )
}

function RightPanel() {
  return (
    <aside className="min-h-0 overflow-y-auto bg-[#0d1110]">
      <div className="border-b border-white/10 p-4">
        <ApprovalPanel />
      </div>
      <div className="border-b border-white/10 p-4">
        <FindingsPanel />
      </div>
      <div className="p-4">
        <ActionWall />
      </div>
    </aside>
  )
}

function RunSummary() {
  return (
    <section className="grid grid-cols-4 gap-px border-b border-white/10 bg-white/10">
      {summary.map((item) => (
        <SummaryTile key={item.label} item={item} />
      ))}
    </section>
  )
}

function SummaryTile({ item }) {
  const Icon = item.icon
  return (
    <div className="bg-[#101411] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-zinc-500">{item.label}</span>
        <Icon className={`h-4 w-4 ${item.tone}`} />
      </div>
      <div className={`text-xl font-semibold ${item.tone}`}>{item.value}</div>
      <div className="mt-1 text-xs text-zinc-500">{item.detail}</div>
    </div>
  )
}

function ApprovalGate() {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">aegis/plan-review</div>
          <div className="mt-1 text-xs text-zinc-500">Required GitHub Check</div>
        </div>
        <span className="rounded bg-red-500/15 px-2 py-1 text-xs font-semibold text-red-300">Action required</span>
      </div>
      <p className="text-sm leading-6 text-zinc-400">
        Merge is blocked until a security approver approves plan hash <span className="font-mono text-zinc-200">6fd9c93</span>.
      </p>
    </section>
  )
}

function ApprovalPanel() {
  return (
    <section>
      <div className="mb-4">
        <div className="text-sm font-semibold">Approval requirement</div>
        <div className="mt-1 text-xs text-zinc-500">High tier · security approver required</div>
      </div>
      <div className="mb-4 space-y-2">
        <Requirement checked label="Terraform plan uploaded" />
        <Requirement checked label="Policy findings normalized" />
        <Requirement label="Security approval pending" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/15">
          Reject
        </button>
        <button className="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/15">
          Approve
        </button>
      </div>
    </section>
  )
}

function Requirement({ checked = false, label }) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-300">
      {checked ? <Check className="h-4 w-4 text-emerald-300" /> : <Clock3 className="h-4 w-4 text-orange-300" />}
      {label}
    </div>
  )
}

function FindingsPanel() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Findings</div>
          <div className="mt-1 text-xs text-zinc-500">Checkov + Infracost + risk engine</div>
        </div>
        <span className="rounded bg-orange-500/15 px-2 py-1 text-xs font-semibold text-orange-300">3 open</span>
      </div>
      <div className="space-y-3">
        {insights.map((finding) => (
          <div key={finding.id} className="rounded-md border border-white/10 bg-black/20 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="truncate text-sm font-semibold">{finding.title}</div>
              <Severity severity={finding.severity} />
            </div>
            <div className="mb-2 text-xs text-zinc-500">{finding.resource}</div>
            <p className="text-xs leading-5 text-zinc-400">{finding.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Severity({ severity }) {
  const className =
    severity === 'Critical'
      ? 'bg-red-500/15 text-red-300'
      : severity === 'High'
        ? 'bg-orange-500/15 text-orange-300'
        : 'bg-yellow-500/15 text-yellow-300'
  return <span className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold ${className}`}>{severity}</span>
}

function ResourceTree({ items, level }) {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = iconMap[item.icon] || Cloud
        return (
          <div key={item.id}>
            <div
              className="flex min-h-8 items-center gap-2 rounded-md px-2 py-1 text-sm text-zinc-300 hover:bg-white/[0.04]"
              style={{ paddingLeft: 8 + level * 14 }}
            >
              <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />
              <Icon className="h-4 w-4 text-orange-400" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
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
        className={`flex items-center justify-between gap-3 rounded-md border border-white/10 bg-[#111513] px-3 py-2 text-sm text-zinc-100 ${
          mobile ? 'min-w-[100px]' : 'min-w-[132px]'
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

function ActionWall() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">GitHub Actions</div>
          <div className="mt-1 text-xs text-zinc-500">Gate sequence for PR #1</div>
        </div>
        <GitBranch className="h-4 w-4 text-zinc-500" />
      </div>
      <div className="space-y-2">
        {actionRuns.map((run) => (
          <div key={run.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-md bg-black/20 px-3 py-2 text-sm">
            <span className="truncate text-zinc-300">{run.label}</span>
            <RunState state={run.state} />
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

function RunState({ state }) {
  const ok = state === 'Passed'
  const blocked = state === 'Blocked' || state === 'Action required'
  return (
    <span
      className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold ${
        ok ? 'bg-emerald-500/15 text-emerald-300' : blocked ? 'bg-red-500/15 text-red-300' : 'bg-orange-500/15 text-orange-300'
      }`}
    >
      {ok ? <Check className="h-3 w-3" /> : blocked ? <XCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
      {state}
    </span>
  )
}
