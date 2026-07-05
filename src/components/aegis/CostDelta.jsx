import { ArrowDownRight, ArrowUpRight, DollarSign } from 'lucide-react'
import { costItems } from './reviewData'

export function CostDelta() {
  const total = costItems.reduce((sum, item) => sum + item.delta, 0)
  const max = Math.max(...costItems.map((item) => Math.abs(item.delta)))

  return (
    <section className="rounded-md border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950">Cost Delta</h2>
          <p className="text-xs text-zinc-500">Projected monthly run-rate impact.</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-1 text-sm font-semibold text-rose-700">
          <DollarSign className="h-4 w-4" />
          +{total.toFixed(2)}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {costItems.map((item) => {
          const width = `${Math.max(14, (Math.abs(item.delta) / max) * 100)}%`
          const positive = item.delta > 0
          const Icon = positive ? ArrowUpRight : ArrowDownRight
          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-800">{item.label}</span>
                <span className={positive ? 'text-rose-700' : 'text-emerald-700'}>
                  {positive ? '+' : ''}
                  {item.delta.toFixed(2)}
                </span>
              </div>
              <div className="flex h-2 overflow-hidden rounded-full bg-zinc-100">
                <div className={positive ? 'bg-rose-500' : 'bg-emerald-500'} style={{ width }} />
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                <Icon className="h-3.5 w-3.5" />
                {positive ? 'new spend' : 'offset'}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
