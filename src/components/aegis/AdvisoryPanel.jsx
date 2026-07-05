import { Bot, CheckCircle2, Sparkles } from 'lucide-react'
import { advisoryNotes } from './reviewData'

export function AdvisoryPanel() {
  return (
    <section className="rounded-md border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950">AI Advisory</h2>
          <p className="text-xs text-zinc-500">Review guidance generated from plan, policy, and drift context.</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-50 text-teal-700">
          <Bot className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-3 p-4">
        {advisoryNotes.map((note, index) => (
          <div key={note.title} className="rounded-md border border-zinc-200 p-3">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-zinc-950">
              {index === 0 ? <Sparkles className="h-4 w-4 text-teal-600" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              {note.title}
            </div>
            <p className="text-sm leading-5 text-zinc-600">{note.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
