import {
  Bell,
  CloudCog,
  GitPullRequest,
  History,
  Layers3,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { workspaces } from './reviewData'

const navItems = [
  { label: 'Reviews', icon: GitPullRequest, active: true, count: 6 },
  { label: 'Resources', icon: Layers3, count: 142 },
  { label: 'Policies', icon: ShieldCheck, count: 31 },
  { label: 'Runs', icon: History, count: 18 },
  { label: 'Settings', icon: Settings },
]

export function WorkspaceNav() {
  return (
    <aside className="hidden h-screen w-[248px] shrink-0 border-r border-zinc-200 bg-zinc-50/90 lg:flex lg:flex-col">
      <div className="border-b border-zinc-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-950 text-white">
            <CloudCog className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-950">AegisIaC</div>
            <div className="truncate text-xs text-zinc-500">PR review control plane</div>
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-200 p-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            className="h-9 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
            placeholder="Search reviews"
          />
        </label>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        <div>
          <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Workspace</div>
          <div className="space-y-1">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                className={cn(
                  'flex h-9 w-full items-center justify-between rounded-md px-2 text-sm transition',
                  workspace.active
                    ? 'bg-white font-medium text-zinc-950 shadow-sm ring-1 ring-zinc-200'
                    : 'text-zinc-600 hover:bg-white hover:text-zinc-950'
                )}
              >
                <span className="truncate">{workspace.label}</span>
                {workspace.active && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Review Ops</div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  className={cn(
                    'flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm transition',
                    item.active ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:bg-white hover:text-zinc-950'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count && (
                    <span className={cn('text-xs', item.active ? 'text-zinc-300' : 'text-zinc-400')}>{item.count}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      <div className="border-t border-zinc-200 p-3">
        <div className="rounded-md border border-zinc-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Automation</div>
            <Bell className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-900">
            <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
            Guardrails active
          </div>
        </div>
      </div>
    </aside>
  )
}
