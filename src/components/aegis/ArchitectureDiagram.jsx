import {
  Box,
  Cloud,
  Database,
  Download,
  Expand,
  Globe2,
  Layers,
  MousePointer2,
  RadioTower,
  Server,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { createElement } from 'react'
import { cn } from '../../lib/utils'

const nodeIcons = {
  cache: Layers,
  db: Database,
  dns: RadioTower,
  service: Globe2,
  server: Server,
}

export function ArchitectureDiagram({ compact = false }) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-lg border border-white/10 bg-[#080b0a] shadow-2xl shadow-black/40',
        compact ? 'min-h-[500px]' : 'min-h-[680px]'
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12)_1px,transparent_1.5px)] bg-[length:26px_26px] opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,197,164,0.16),transparent_34%),radial-gradient(circle_at_95%_80%,rgba(249,115,22,0.10),transparent_32%)]" />

      <div className="relative flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-100">Production Environment</span>
          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-500">plan 6fd9c93</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-white/10 bg-white/5 p-2 text-zinc-300">
            <Download className="h-4 w-4" />
          </button>
          <button className="rounded-md border border-white/10 bg-white/5 p-2 text-zinc-300">
            <Expand className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative h-[610px] min-w-[760px] p-8">
        <Boundary label="Tenant" className="inset-x-8 top-8 h-[540px] border-teal-300/60" icon={Box} />
        <Boundary label="Subscription" className="left-[80px] top-[96px] h-[420px] w-[620px] border-yellow-400/70" icon={Cloud} />
        <Boundary label="Account" className="left-[120px] top-[150px] h-[320px] w-[520px] border-fuchsia-500/70" icon={Globe2} />
        <Boundary
          label="Virtual network"
          className="left-[160px] top-[204px] h-[160px] w-[250px] border-lime-300/60 border-dashed"
          icon={RadioTower}
        />
        <Boundary
          label="Virtual network"
          className="left-[430px] top-[204px] h-[230px] w-[170px] border-lime-300/60 border-dashed"
          icon={RadioTower}
        />

        <Connector className="left-[304px] top-[289px] w-[196px]" />
        <Connector className="left-[278px] top-[326px] h-[154px] rotate-90" />
        <Connector className="left-[500px] top-[354px] h-[92px] rotate-90" />

        <ResourceNode id="service" label="API service" type="service" className="left-[205px] top-[250px]" selected />
        <ResourceNode id="cache" label="Session cache" type="cache" className="left-[205px] top-[405px]" />
        <ResourceNode id="db" label="Database" type="db" className="left-[480px] top-[250px]" severity="critical" />
        <ResourceNode id="dns" label="DNS VNet" type="dns" className="left-[480px] top-[380px]" severity="high" />

        <div className="absolute left-[328px] top-[290px] rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-950/40">
          Architect
        </div>
        <div className="absolute left-[598px] top-[484px] rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-950/40">
          Engineer
        </div>
        <MousePointer2 className="absolute left-[307px] top-[250px] h-9 w-9 rotate-[-20deg] fill-white text-white drop-shadow-lg" />
        <MousePointer2 className="absolute left-[583px] top-[455px] h-8 w-8 rotate-[-35deg] fill-teal-400 text-teal-400 drop-shadow-lg" />

        <RelationsCard className={compact ? 'left-[398px] top-[78px]' : 'left-[548px] top-[118px]'} />

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-white/10 bg-zinc-900/95 p-2 text-zinc-300 shadow-xl">
          {[MousePointer2, Sparkles, ZoomOut, ZoomIn].map((Icon, index) => (
            <button key={index} className="rounded-md p-2 hover:bg-white/10">
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    </section>
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

function ResourceNode({ label, type, className, selected, severity }) {
  const Icon = nodeIcons[type] || Server
  return (
    <button
      className={cn(
        'absolute h-[104px] w-[122px] rounded-lg border bg-[#1b1f1b] p-4 text-left text-zinc-200 shadow-xl shadow-black/30',
        selected ? 'border-orange-400 ring-1 ring-orange-400/40' : 'border-white/10',
        severity === 'critical' && 'border-red-400/80',
        severity === 'high' && 'border-orange-400/70',
        className
      )}
    >
      <Icon className="mb-8 h-6 w-6 text-orange-400" />
      <span className="block text-sm font-medium">{label}</span>
      {severity && (
        <span className="absolute right-2 top-2 rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-300">
          {severity === 'critical' ? '2' : 'risk'}
        </span>
      )}
    </button>
  )
}

function Connector({ className }) {
  return (
    <div className={cn('absolute h-px bg-zinc-400/70', className)}>
      <span className="absolute -right-1 -top-[3px] h-2 w-2 rotate-45 border-r border-t border-zinc-400" />
      <span className="absolute -left-1 -top-[3px] h-2 w-2 rotate-45 border border-zinc-400 bg-[#080b0a]" />
    </div>
  )
}

function RelationsCard({ className }) {
  return (
    <div className={cn('absolute w-[235px] rounded-2xl border border-white/10 bg-[#333a34]/95 p-5 text-zinc-100 shadow-2xl', className)}>
      <h3 className="text-lg font-semibold">Relations</h3>
      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="mb-3 text-sm text-zinc-400">Incoming</div>
        <Relation icon={Database} label="Database" />
        <Relation icon={Server} label="Server" />
      </div>
      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="mb-3 text-sm text-zinc-400">Outgoing</div>
        <Relation icon={Layers} label="Cache" />
      </div>
    </div>
  )
}

function Relation({ icon: RelationIcon, label }) {
  return (
    <div className="mb-3 flex items-center gap-3 text-sm text-zinc-200">
      {createElement(RelationIcon, { className: 'h-5 w-5 text-zinc-200' })}
      {label}
    </div>
  )
}
