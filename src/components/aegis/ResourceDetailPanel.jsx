import { ArrowRight, Copy, ExternalLink } from 'lucide-react'
import { Button } from '../ui/button'
import { graphNodes } from './reviewData'

export function ResourceDetailPanel({ selectedId }) {
  const resource = graphNodes.find((node) => node.id === selectedId) || graphNodes[0]

  return (
    <section className="rounded-md border border-zinc-200 bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-zinc-950">{resource.name}</h2>
          <p className="truncate text-xs text-zinc-500">{resource.address}</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 rounded-md px-2 text-xs">
          <ExternalLink className="h-3.5 w-3.5" />
          Trace
        </Button>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Meta label="Provider" value={resource.provider} />
          <Meta label="Region" value={resource.region} />
          <Meta label="Owner" value={resource.owner} />
          <Meta label="Status" value={resource.status} tone={resource.status} />
        </div>

        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Change Summary</div>
          <p className="text-sm leading-5 text-zinc-700">{resource.change}</p>
        </div>

        <div className="rounded-md border border-zinc-200">
          <div className="grid grid-cols-[1fr_auto_1fr] items-stretch text-sm">
            <div className="p-3">
              <div className="mb-1 text-xs font-semibold text-zinc-500">Before</div>
              <div className="text-zinc-900">{resource.before}</div>
            </div>
            <div className="flex items-center border-x border-zinc-200 px-2 text-zinc-400">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="p-3">
              <div className="mb-1 text-xs font-semibold text-zinc-500">After</div>
              <div className="text-zinc-900">{resource.after}</div>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-zinc-50 p-3">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <Copy className="h-3.5 w-3.5" />
            Blast Radius
          </div>
          <div className="text-sm text-zinc-800">{resource.blastRadius}</div>
        </div>
      </div>
    </section>
  )
}

function Meta({ label, value, tone }) {
  const toneClass = {
    created: 'text-emerald-700',
    modified: 'text-amber-700',
    unchanged: 'text-zinc-600',
  }[tone]

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={`mt-1 truncate text-sm font-medium ${toneClass || 'text-zinc-900'}`}>{value}</div>
    </div>
  )
}
