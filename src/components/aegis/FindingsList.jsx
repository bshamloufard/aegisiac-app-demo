import { AlertTriangle, BadgeCheck, CircleDot, Filter } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { findings } from './reviewData'

const severityClasses = {
  critical: 'bg-rose-100 text-rose-800 ring-rose-200',
  high: 'bg-orange-100 text-orange-800 ring-orange-200',
  medium: 'bg-amber-100 text-amber-800 ring-amber-200',
}

export function FindingsList({ activeFindingId, onSelectFinding, onSelectResource }) {
  const activeFinding = findings.find((finding) => finding.id === activeFindingId) || findings[0]

  return (
    <section className="rounded-md border border-zinc-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950">Findings</h2>
          <p className="text-xs text-zinc-500">Policy, exposure, cost, and drift signals.</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-md px-2 text-xs">
          <Filter className="h-3.5 w-3.5" />
          Open
        </Button>
      </div>

      <div className="divide-y divide-zinc-100">
        {findings.map((finding) => {
          const active = finding.id === activeFinding.id
          return (
            <button
              key={finding.id}
              onClick={() => {
                onSelectFinding(finding.id)
                onSelectResource(finding.resourceId)
              }}
              className={cn(
                'block w-full px-4 py-3 text-left transition hover:bg-zinc-50',
                active && 'bg-teal-50/70'
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  {finding.severity === 'critical' ? (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  ) : (
                    <CircleDot className="h-4 w-4 shrink-0 text-amber-600" />
                  )}
                  <span className="truncate text-sm font-semibold text-zinc-950">{finding.title}</span>
                </span>
                <span className={cn('rounded px-1.5 py-0.5 text-[11px] font-semibold ring-1', severityClasses[finding.severity])}>
                  {finding.severity}
                </span>
              </div>
              <div className="mb-2 line-clamp-2 text-sm leading-5 text-zinc-600">{finding.detail}</div>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{finding.id} / {finding.signal}</span>
                <span className="flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {finding.owner}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
