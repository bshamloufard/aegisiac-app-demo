import { Check, Clock3, GitMerge, ShieldAlert, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { approvalSteps } from './reviewData'

const stateConfig = {
  complete: { icon: Check, className: 'bg-emerald-100 text-emerald-800 ring-emerald-200' },
  waiting: { icon: Clock3, className: 'bg-sky-100 text-sky-800 ring-sky-200' },
  blocked: { icon: ShieldAlert, className: 'bg-rose-100 text-rose-800 ring-rose-200' },
}

export function ApprovalBar() {
  const [decision, setDecision] = useState('pending')
  const blocked = approvalSteps.filter((step) => step.state === 'blocked').length
  const label = useMemo(() => {
    if (decision === 'approved') return 'Local reviewer approval recorded'
    if (decision === 'rejected') return 'Changes requested by local reviewer'
    return `${blocked} blocking checks before merge`
  }, [blocked, decision])

  return (
    <section className="border-t border-zinc-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {approvalSteps.map((step) => {
            const config = stateConfig[step.state]
            const Icon = config.icon
            return (
              <span
                key={step.label}
                className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1', config.className)}
              >
                <Icon className="h-3.5 w-3.5" />
                {step.label}
              </span>
            )
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between xl:justify-end">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <GitMerge className="h-4 w-4" />
            {label}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-md border-rose-200 px-3 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
              onClick={() => setDecision('rejected')}
            >
              <X className="h-4 w-4" />
              Request changes
            </Button>
            <Button
              size="sm"
              className="h-9 gap-1.5 rounded-md bg-emerald-700 px-3 text-white hover:bg-emerald-800"
              onClick={() => setDecision('approved')}
            >
              <Check className="h-4 w-4" />
              Approve
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
