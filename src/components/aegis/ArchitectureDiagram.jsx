import { Box, Cloud, Database, Download, Expand, Filter, Globe2, Layers, RadioTower, Server, ZoomIn, ZoomOut } from 'lucide-react'
import { createElement, useState } from 'react'
import { cn } from '../../lib/utils'

const nodeIcons = {
  cache: Layers,
  db: Database,
  dns: RadioTower,
  service: Globe2,
  server: Server,
}

const nodes = [
  { id: 'api', label: 'API service', type: 'service', action: 'create', className: 'left-[205px] top-[240px]' },
  { id: 'cache', label: 'Session cache', type: 'cache', action: 'update', className: 'left-[205px] top-[390px]' },
  { id: 'db', label: 'Primary database', type: 'db', action: 'replace', className: 'left-[480px] top-[240px]' },
  { id: 'dns', label: 'DNS VNet', type: 'dns', action: 'no-op', className: 'left-[480px] top-[390px]' },
]

export function ArchitectureDiagram({ compact = false }) {
  const [selectedId, setSelectedId] = useState('api')

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#080b0a]">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <div>
          <div className="text-sm font-semibold text-zinc-100">Infrastructure review</div>
          <div className="text-xs text-zinc-500">Changed subgraph</div>
        </div>
        <div className="flex items-center gap-2 text-zinc-500">
          <ToolButton icon={Filter} label="Filter" />
          <ToolButton icon={ZoomOut} label="Zoom out" />
          <ToolButton icon={ZoomIn} label="Zoom in" />
          <ToolButton icon={Download} label="Export" />
          <ToolButton icon={Expand} label="Expand" />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className={cn('relative min-w-[780px] p-8', compact ? 'h-[540px]' : 'h-full min-h-[620px]')}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.10)_1px,transparent_1.5px)] bg-[length:28px_28px] opacity-25" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_8%,rgba(20,184,166,0.10),transparent_30%)]" />

          <Boundary label="Tenant" className="inset-x-8 top-8 h-[535px] border-teal-300/50" icon={Box} />
          <Boundary label="Subscription" className="left-[80px] top-[98px] h-[415px] w-[665px] border-yellow-400/50" icon={Cloud} />
          <Boundary label="Account" className="left-[120px] top-[150px] h-[320px] w-[575px] border-fuchsia-500/50" icon={Globe2} />
          <Boundary
            label="Virtual network"
            className="left-[160px] top-[205px] h-[170px] w-[280px] border-lime-300/45 border-dashed"
            icon={RadioTower}
          />
          <Boundary
            label="Data subnet"
            className="left-[455px] top-[205px] h-[270px] w-[210px] border-lime-300/45 border-dashed"
            icon={RadioTower}
          />

          <Connector className="left-[330px] top-[294px] w-[205px]" />
          <Connector className="left-[300px] top-[340px] h-[112px] rotate-90" />
          <Connector className="left-[575px] top-[340px] h-[112px] rotate-90" />

          {nodes.map((node) => (
            <ResourceNode key={node.id} node={node} selected={selectedId === node.id} onClick={() => setSelectedId(node.id)} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ToolButton({ icon: Icon, label }) {
  return (
    <button className="rounded-md border border-white/10 bg-white/[0.025] p-2 hover:bg-white/[0.07]" title={label}>
      {createElement(Icon, { className: 'h-4 w-4' })}
    </button>
  )
}

function Boundary({ label, icon: BoundaryIcon, className }) {
  return (
    <div className={cn('absolute rounded-sm border', className)}>
      <div className="-mt-3 ml-4 flex w-fit items-center gap-1.5 bg-[#080b0a] px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {createElement(BoundaryIcon, { className: 'h-3.5 w-3.5 text-orange-400/80' })}
        {label}
      </div>
    </div>
  )
}

function ResourceNode({ node, selected, onClick }) {
  const Icon = nodeIcons[node.type] || Server
  const destructive = node.action === 'replace'

  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute h-[112px] w-[142px] rounded-lg border bg-[#1b1f1b] p-4 text-left text-zinc-200 shadow-lg shadow-black/25 transition hover:border-orange-300/80',
        selected ? 'border-orange-400 ring-1 ring-orange-400/30' : 'border-white/10',
        destructive && 'border-red-400/60',
        node.className
      )}
    >
      <Icon className="mb-8 h-6 w-6 text-orange-400/90" />
      <span className="block text-sm font-semibold">{node.label}</span>
      <ActionPill action={node.action} />
    </button>
  )
}

function ActionPill({ action }) {
  const tone =
    action === 'create'
      ? 'bg-emerald-500/15 text-emerald-300'
      : action === 'update'
        ? 'bg-blue-500/15 text-blue-300'
        : action === 'replace'
          ? 'bg-red-500/15 text-red-300'
          : 'bg-zinc-500/15 text-zinc-400'

  return <span className={cn('absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase', tone)}>{action}</span>
}

function Connector({ className }) {
  return (
    <div className={cn('absolute h-px bg-zinc-500/70', className)}>
      <span className="absolute -right-1 -top-[3px] h-2 w-2 rotate-45 border-r border-t border-zinc-500" />
      <span className="absolute -left-1 -top-[3px] h-2 w-2 rotate-45 border border-zinc-500 bg-[#080b0a]" />
    </div>
  )
}
