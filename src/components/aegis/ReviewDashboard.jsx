import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  Cloud,
  Database,
  GitPullRequest,
  History,
  Home,
  Layers,
  Menu,
  RadioTower,
  Search,
  Server,
  Shield,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react'
import { createElement, useState } from 'react'
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

export function ReviewDashboard() {
  const [view, setView] = useState('environment')
  const [version, setVersion] = useState(versions[0])

  return (
    <div className="h-dvh overflow-hidden bg-[#111916] text-zinc-100">
      <div className="fixed inset-0 bg-[linear-gradient(135deg,#14221f_0%,#0a0d0c_58%,#050605_100%)]" />
      <DesktopShell view={view} setView={setView} version={version} setVersion={setVersion} />
      <MobileShell view={view} setView={setView} version={version} setVersion={setVersion} />
    </div>
  )
}

function DesktopShell({ view, setView, version, setVersion }) {
  return (
    <div className="relative hidden h-dvh place-items-center p-6 lg:grid">
      <div className="h-[88dvh] max-h-[920px] min-h-[680px] w-[90vw] max-w-[1720px] overflow-hidden rounded-xl border border-white/10 bg-[#090c0b]/96 shadow-2xl shadow-black/70">
        {view === 'environment' && (
          <div className="grid h-full grid-cols-[64px_320px_minmax(0,1fr)]">
            <Rail view={view} setView={setView} compact />
            <ResourceBrowser />
            <EnvironmentCanvas version={version} setVersion={setVersion} />
          </div>
        )}
        {view === 'generate' && (
          <div className="grid h-full grid-cols-[64px_minmax(430px,0.78fr)_minmax(620px,1.22fr)]">
            <Rail view={view} setView={setView} compact />
            <GeneratePanel />
            <DesignPreview version={version} setVersion={setVersion} />
          </div>
        )}
        {view === 'insights' && (
          <div className="grid h-full grid-cols-[240px_minmax(0,1fr)]">
            <Rail view={view} setView={setView} />
            <InsightView />
          </div>
        )}
        {(view === 'actions' || view === 'compliance') && (
          <div className="grid h-full grid-cols-[240px_minmax(0,1fr)]">
            <Rail view={view} setView={setView} />
            <QuietListView view={view} />
          </div>
        )}
      </div>
    </div>
  )
}

function MobileShell({ view, setView, version, setVersion }) {
  return (
    <div className="relative h-dvh overflow-hidden lg:hidden">
      <header className="border-b border-white/10 bg-[#090c0b] px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button className="rounded-md border border-white/10 p-2">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">Production Environment</div>
              <div className="truncate text-xs text-zinc-500">Isengard · PR #1 blocked</div>
            </div>
          </div>
          <VersionSelect version={version} setVersion={setVersion} compact />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {views.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`rounded-md px-2 py-2 text-xs ${view === item.id ? 'bg-zinc-100 text-zinc-950' : 'bg-white/5 text-zinc-400'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>
      <main className="h-[calc(100dvh-105px)] overflow-y-auto">
        {view === 'environment' && (
          <div className="grid min-h-full grid-rows-[auto_minmax(620px,1fr)]">
            <ResourceBrowser mobile />
            <EnvironmentCanvas mobile version={version} setVersion={setVersion} />
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
  if (compact) {
    return (
      <aside className="flex flex-col items-center border-r border-white/10 bg-[#080b0a] py-5">
        <Sparkles className="mb-7 h-5 w-5 text-white" />
        <nav className="flex flex-1 flex-col items-center gap-3">
          {views.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                title={item.label}
                className={`rounded-lg p-2.5 ${view === item.id ? 'bg-white/10 text-orange-300' : 'text-zinc-500 hover:text-zinc-200'}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </nav>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-xs font-bold">I</div>
      </aside>
    )
  }

  return (
    <aside className="flex min-h-0 flex-col border-r border-white/10 bg-[#080b0a] p-4">
      <Sparkles className="mb-7 h-5 w-5 text-white" />
      <nav className="space-y-2">
        {views.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm ${
                view === item.id ? 'bg-white/8 text-zinc-100' : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="mt-auto flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-xs font-bold">I</span>
        <span className="text-zinc-300">Isengard</span>
        <ChevronDown className="h-4 w-4 text-zinc-500" />
      </div>
    </aside>
  )
}

function ResourceBrowser({ mobile = false }) {
  return (
    <aside className={`${mobile ? 'border-b' : 'border-r'} border-white/10 bg-[#111513]/95`}>
      <div className="flex h-[72px] items-center gap-4 border-b border-white/10 px-5">
        <ArrowLeft className="h-5 w-5 text-zinc-300" />
        <div className="text-lg font-semibold">Production Environment</div>
      </div>
      <div className="border-b border-white/10 p-4">
        <label className="flex h-11 items-center gap-3 rounded-md border border-white/10 bg-black/30 px-3">
          <Search className="h-5 w-5 text-zinc-500" />
          <input className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500" placeholder="Search resources..." />
          <Activity className="h-4 w-4 text-zinc-500" />
        </label>
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <div className="text-sm font-semibold">Resources</div>
        <Layers className="h-5 w-5 text-zinc-500" />
      </div>
      <div className={`${mobile ? 'max-h-[330px]' : 'h-[calc(100%-190px)]'} overflow-y-auto px-4 pb-5`}>
        <ResourceTree items={resources} level={0} />
      </div>
    </aside>
  )
}

function EnvironmentCanvas({ version, setVersion, mobile = false }) {
  return (
    <section className="relative min-h-0 overflow-hidden bg-[#080b0a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_1px,transparent_1.5px)] bg-[length:26px_26px] opacity-30" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,184,166,0.06),transparent_22%)]" />

      <div className="absolute right-5 top-5 z-20 flex items-center gap-2">
        <a
          href="https://github.com/bshamloufard/aegisiac-demo-actions-wall/pull/1"
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300 hover:bg-white/10"
        >
          PR #1
        </a>
        <VersionSelect version={version} setVersion={setVersion} />
      </div>

      <div className={`${mobile ? 'h-[680px] min-w-[920px]' : 'h-full min-h-[680px] min-w-[1080px]'} relative p-10`}>
        <Boundary label="Tenant" className="inset-x-10 top-20 h-[540px] border-teal-300/60" icon={Home} />
        <Boundary label="Subscription" className="left-[90px] top-[145px] h-[420px] w-[420px] border-yellow-400/65" icon={Cloud} />
        <Boundary label="Account" className="left-[130px] top-[200px] h-[310px] w-[335px] border-fuchsia-500/65" icon={Activity} />
        <Boundary
          label="Virtual network"
          className="left-[170px] top-[255px] h-[185px] w-[250px] border-lime-300/55 border-dashed"
          icon={RadioTower}
        />

        <Boundary label="Subscription" className="left-[570px] top-[145px] h-[420px] w-[420px] border-yellow-400/65" icon={Cloud} />
        <Boundary label="Account" className="left-[610px] top-[200px] h-[310px] w-[335px] border-fuchsia-500/65" icon={Activity} />
        <Boundary
          label="Virtual network"
          className="left-[650px] top-[255px] h-[185px] w-[250px] border-lime-300/55 border-dashed"
          icon={RadioTower}
        />

        <ResourceNode label="Server" icon={Server} className="left-[245px] top-[310px]" />
        <ResourceNode label="Server" icon={Server} badge="2" className="left-[365px] top-[310px]" />
        <ResourceNode label="Server" icon={Server} badge="risk" selected className="left-[725px] top-[310px]" />
        <ResourceNode label="DNS VNet" icon={RadioTower} badge="risk" className="left-[785px] top-[470px]" />

        <InsightCallout />
        <CanvasToolbar />
        <ZoomControls />
      </div>
    </section>
  )
}

function Boundary({ label, icon: BoundaryIcon, className }) {
  return (
    <div className={`absolute rounded-sm border ${className}`}>
      <div className="-mt-3 ml-4 flex w-fit items-center gap-1.5 bg-[#080b0a] px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {createElement(BoundaryIcon, { className: 'h-3.5 w-3.5 text-orange-400' })}
        {label}
      </div>
    </div>
  )
}

function ResourceNode({ label, icon: NodeIcon, badge, selected, className }) {
  return (
    <button
      className={`absolute h-[104px] w-[120px] rounded-lg border bg-[#1d221e] p-4 text-left shadow-xl shadow-black/30 ${
        selected ? 'border-orange-400 ring-1 ring-orange-400/35' : 'border-white/10'
      } ${className}`}
    >
      {createElement(NodeIcon, { className: 'mb-8 h-5 w-5 text-orange-400' })}
      <span className="block text-sm font-medium text-zinc-200">{label}</span>
      {badge && (
        <span className="absolute right-2 top-2 rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-300">
          {badge === 'risk' ? '✦' : badge}
        </span>
      )}
    </button>
  )
}

function InsightCallout() {
  return (
    <div className="absolute left-[840px] top-[300px] z-20 w-[250px] rounded-lg border border-white/10 bg-[#363b35]/95 shadow-2xl">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <Activity className="h-5 w-5 text-orange-400" />
        <div className="text-sm font-semibold">Server misconfiguration</div>
      </div>
      <p className="px-5 py-4 text-sm leading-6 text-zinc-300">
        The server does not comply with defined security requirements. Review and update settings to reduce risk.
      </p>
      <div className="border-t border-white/10 p-4">
        <button className="h-10 w-full rounded-md bg-white/10 text-sm font-semibold text-zinc-200 hover:bg-white/15">View details</button>
      </div>
    </div>
  )
}

function CanvasToolbar() {
  return (
    <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-white/10 bg-[#1b201c]/95 p-2 shadow-xl">
      {[Sparkles, Activity, Wand2, X].map((Icon, index) => (
        <button key={index} className="rounded-md p-2 text-zinc-300 hover:bg-white/10">
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}

function ZoomControls() {
  return (
    <div className="absolute bottom-5 right-5 z-20 flex items-center rounded-lg border border-white/10 bg-[#1b201c]/95 shadow-xl">
      <button className="px-4 py-3 text-xl text-zinc-300">-</button>
      <button className="border-l border-white/10 px-4 py-3 text-xl text-zinc-300">+</button>
      <button className="border-l border-white/10 px-4 py-3 text-zinc-300">
        <Layers className="h-4 w-4" />
      </button>
    </div>
  )
}

function GeneratePanel({ mobile = false }) {
  return (
    <section className={`${mobile ? 'min-h-full' : ''} flex min-h-0 flex-col border-r border-white/10 bg-[#090c0b]`}>
      <div className="flex h-[64px] items-center justify-between border-b border-white/10 px-5">
        <div className="text-sm font-semibold">Generate</div>
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <button>New chat</button>
          <button className="flex items-center gap-1">
            <History className="h-3.5 w-3.5" />
            Chat history
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <Conversation />
      </div>
      <div className="border-t border-white/10 p-5">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <input className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600" placeholder="Reply..." />
          <div className="mt-4 flex items-center justify-between">
            <button className="rounded-md bg-white/5 px-3 py-2 text-xs text-zinc-400">Attach plan</button>
            <button className="rounded-md bg-orange-500 px-3 py-2 text-xs font-semibold text-black">Send</button>
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
      <div className="rounded-lg border border-orange-400/70 bg-orange-500/5 p-4">
        <div className="flex items-center gap-3">
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

function ChatBubble({ children, side }) {
  return (
    <div className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[74%] rounded-lg bg-white/[0.055] px-4 py-3 text-sm leading-6 text-zinc-200">{children}</div>
    </div>
  )
}

function DesignPreview({ version, setVersion }) {
  return (
    <section className="min-h-0 bg-[#080b0a] p-5">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-[#111513]">
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold">SQL Server</div>
            <VersionSelect version={version} setVersion={setVersion} />
          </div>
          <button className="rounded-md bg-orange-500 px-3 py-2 text-xs font-semibold text-black">Save as Design</button>
        </div>
        <EnvironmentCanvas version={version} setVersion={setVersion} />
      </div>
    </section>
  )
}

function InsightView({ mobile = false }) {
  return (
    <main className={`${mobile ? 'min-h-full p-4' : 'grid h-full grid-cols-[minmax(0,1fr)_360px] gap-8 p-8'} overflow-y-auto bg-[#090c0b]`}>
      <section className="mx-auto w-full max-w-[820px]">
        <div className="mb-8 text-sm text-zinc-500">
          Insights <span className="mx-2">›</span> <span className="text-orange-300">Workload misconfiguration</span> #5
        </div>
        <h1 className="mb-4 text-xl font-semibold">Description</h1>
        <p className="max-w-[760px] text-sm leading-7 text-zinc-400">{insights[0].description}</p>
        <div className="my-8 border-t border-white/10" />
        <h2 className="mb-6 text-lg font-semibold">Mitigation</h2>
        <div className="space-y-8">
          {mitigationSteps.map((step, index) => (
            <div key={step} className="grid grid-cols-[32px_minmax(0,1fr)] gap-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 text-xs text-zinc-500">
                {index + 1}
              </span>
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
        {['Security · Medium', 'Reliability · Medium', 'Cost · High', 'Performance · Low'].map((item) => (
          <div key={item} className="flex items-center justify-between py-2 text-sm text-zinc-400">
            <span>{item.split(' · ')[0]}</span>
            <span className="text-orange-300">{item.split(' · ')[1]}</span>
          </div>
        ))}
      </PropertyCard>
    </aside>
  )
}

function PropertyCard({ title, children }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
      <div className="mb-4 text-sm font-semibold">{title}</div>
      {children}
    </div>
  )
}

function Property({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-300">{value}</span>
    </div>
  )
}

function QuietListView({ view, mobile = false }) {
  const isActions = view === 'actions'
  return (
    <main className={`${mobile ? 'p-4' : 'h-full p-8'} bg-[#090c0b]`}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">{isActions ? 'GitHub Actions' : 'Compliance'}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {isActions ? 'Gate sequence for the current pull request.' : 'Workspace guardrails attached to this environment.'}
          </p>
        </div>
        <div className="space-y-3">
          {(isActions
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
          ).map(([label, state, meta]) => (
            <div key={label} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3">
              <span className="text-sm text-zinc-200">{label}</span>
              <span className="rounded bg-white/8 px-2 py-1 text-xs text-zinc-300">{state}</span>
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
    <div className="space-y-2">
      {items.map((item) => {
        const Icon = resourceIcons[item.icon] || Cloud
        return (
          <div key={item.id}>
            <div className="flex items-center gap-2 py-1.5 text-sm text-zinc-300" style={{ paddingLeft: level * 16 }}>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
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

function VersionSelect({ version, setVersion, compact = false }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className={`flex items-center justify-between gap-3 rounded-md border border-white/10 bg-[#111513] px-3 py-2 text-sm text-zinc-100 ${
          compact ? 'min-w-[100px]' : 'min-w-[132px]'
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
