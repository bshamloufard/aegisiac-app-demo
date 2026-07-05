import {
  Box,
  Cloud,
  Database,
  Download,
  Expand,
  Filter,
  Globe2,
  Layers,
  RadioTower,
  Server,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
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
  {
    id: 'api',
    label: 'API service',
    type: 'service',
    action: 'create',
    severity: 'high',
    className: 'left-[208px] top-[254px]',
  },
  {
    id: 'cache',
    label: 'Session cache',
    type: 'cache',
    action: 'update',
    severity: 'medium',
    className: 'left-[208px] top-[414px]',
  },
  {
    id: 'db',
    label: 'Primary database',
    type: 'db',
    action: 'replace',
    severity: 'critical',
    className: 'left-[492px] top-[254px]',
  },
  {
    id: 'dns',
    label: 'DNS VNet',
    type: 'dns',
    action: 'no-op',
    severity: 'low',
    className: 'left-[492px] top-[414px]',
  },
]

export function ArchitectureDiagram({ compact = false }) {
  const [selectedId, setSelectedId] = useState('api')
  const selected = nodes.find((node) => node.id === selectedId) || nodes[0]

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden border border-white/10 bg-[#080b0a]">
      <div className="flex h-12 items-center justify-between border-b border-white/10 px-4">
        <div>
          <div className="text-sm font-semibold text-zinc-100">Production Environment</div>
          <div className="text-xs text-zinc-500">plan 6fd9c93 · 4 changed resources · 3 dependency edges</div>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <ToolButton icon={Filter} label="Filter" />
          <ToolButton icon={ZoomOut} label="Zoom out" />
          <ToolButton icon={ZoomIn} label="Zoom in" />
          <ToolButton icon={Download} label="Export" />
          <ToolButton icon={Expand} label="Expand" />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(720px,1fr)_280px]">
        <div className="min-h-0 overflow-auto">
          <div className={cn('relative min-w-[850px] p-8', compact ? 'h-[560px]' : 'h-full min-h-[640px]')}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14)_1px,transparent_1.5px)] bg-[length:28px_28px] opacity-25" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_8%,rgba(34,197,164,0.12),transparent_30%)]" />

            <Boundary label="Tenant" className="inset-x-8 top-8 h-[560px] border-teal-300/60" icon={Box} />
            <Boundary label="Subscription" className="left-[84px] top-[104px] h-[430px] w-[700px] border-yellow-400/65" icon={Cloud} />
            <Boundary label="Account" className="left-[128px] top-[160px] h-[330px] w-[600px] border-fuchsia-500/65" icon={Globe2} />
            <Boundary
              label="Virtual network"
              className="left-[168px] top-[216px] h-[176px] w-[280px] border-lime-300/60 border-dashed"
              icon={RadioTower}
            />
            <Boundary
              label="Data subnet"
              className="left-[468px] top-[216px] h-[300px] w-[220px] border-lime-300/60 border-dashed"
              icon={RadioTower}
            />

            <Connector className="left-[330px] top-[308px] w-[215px]" />
            <Connector className="left-[306px] top-[354px] h-[124px] rotate-90" />
            <Connector className="left-[590px] top-[354px] h-[124px] rotate-90" />

            {nodes.map((node) => (
              <ResourceNode
                key={node.id}
                node={node}
                selected={selected.id === node.id}
                onClick={() => setSelectedId(node.id)}
              />
            ))}

            <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Changed subgraph focus
            </div>
          </div>
        </div>

        <aside className="border-t border-white/10 bg-[#101411] p-4 xl:border-l xl:border-t-0">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="text-xs uppercase text-zinc-500">Selected resource</div>
              <h3 className="mt-1 text-base font-semibold">{selected.label}</h3>
            </div>
            <SeverityBadge severity={selected.severity} />
          </div>
          <div className="space-y-3 text-sm">
            <DetailRow label="Action" value={selected.action} />
            <DetailRow label="Module" value="module.prod" />
            <DetailRow label="Provider" value="aws" />
            <DetailRow label="Approver" value={selected.severity === 'critical' ? 'Security' : 'Platform'} />
          </div>
          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="mb-3 text-xs uppercase text-zinc-500">Relations</div>
            <Relation icon={Database} label="Primary database" />
            <Relation icon={Server} label="API target group" />
            <Relation icon={Layers} label="Session cache" />
          </div>
          <div className="mt-5 rounded-md border border-orange-400/25 bg-orange-500/10 p-3">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-orange-100">
              <ShieldAlert className="h-4 w-4" />
              Review blocker
            </div>
            <p className="text-xs leading-5 text-orange-100/75">
              The current plan hash requires security approval before `isengard/plan-review` can turn green.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}

function ToolButton({ icon: Icon, label }) {
  return (
    <button className="rounded-md border border-white/10 bg-white/[0.03] p-2 hover:bg-white/10" title={label}>
      {createElement(Icon, { className: 'h-4 w-4' })}
    </button>
  )
}

function Boundary({ label, icon: BoundaryIcon, className }) {
  return (
    <div className={cn('absolute rounded-sm border', className)}>
      <div className="-mt-3 ml-4 flex w-fit items-center gap-1.5 bg-[#080b0a] px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
        {createElement(BoundaryIcon, { className: 'h-3.5 w-3.5 text-orange-400' })}
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
        'absolute h-[112px] w-[142px] rounded-lg border bg-[#1b1f1b] p-4 text-left text-zinc-200 shadow-xl shadow-black/30 transition hover:-translate-y-0.5 hover:border-orange-300',
        selected ? 'border-orange-400 ring-1 ring-orange-400/40' : 'border-white/10',
        destructive && 'border-red-400/80',
        node.className
      )}
    >
      <Icon className="mb-8 h-6 w-6 text-orange-400" />
      <span className="block text-sm font-semibold">{node.label}</span>
      <span
        className={cn(
          'absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
          node.action === 'create' && 'bg-emerald-500/15 text-emerald-300',
          node.action === 'update' && 'bg-blue-500/15 text-blue-300',
          node.action === 'replace' && 'bg-red-500/15 text-red-300',
          node.action === 'no-op' && 'bg-zinc-500/15 text-zinc-400'
        )}
      >
        {node.action}
      </span>
    </button>
  )
}

function Connector({ className }) {
  return (
    <div className={cn('absolute h-px bg-zinc-400/65', className)}>
      <span className="absolute -right-1 -top-[3px] h-2 w-2 rotate-45 border-r border-t border-zinc-400" />
      <span className="absolute -left-1 -top-[3px] h-2 w-2 rotate-45 border border-zinc-400 bg-[#080b0a]" />
    </div>
  )
}

function SeverityBadge({ severity }) {
  const tone =
    severity === 'critical'
      ? 'bg-red-500/15 text-red-300'
      : severity === 'high'
        ? 'bg-orange-500/15 text-orange-300'
        : severity === 'medium'
          ? 'bg-yellow-500/15 text-yellow-300'
          : 'bg-zinc-500/15 text-zinc-300'

  return <span className={cn('rounded px-2 py-1 text-xs font-semibold capitalize', tone)}>{severity}</span>
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium capitalize text-zinc-200">{value}</span>
    </div>
  )
}

function Relation({ icon: RelationIcon, label }) {
  return (
    <div className="mb-3 flex items-center gap-3 text-sm text-zinc-300">
      {createElement(RelationIcon, { className: 'h-4 w-4 text-zinc-400' })}
      {label}
    </div>
  )
}
