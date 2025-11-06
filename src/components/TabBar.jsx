import { X } from 'lucide-react'
import { cn } from '../lib/utils'

export function TabBar({ tabs, activeTab, onTabChange, onTabClose }) {
  return (
    <div className="flex items-center h-12 bg-card border-b overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex items-center gap-2 px-4 h-full border-r cursor-pointer group relative",
            "hover:bg-accent transition-colors min-w-[120px] max-w-[200px]",
            activeTab === tab.id ? "bg-background" : "bg-card"
          )}
        >
          <span className="flex-1 truncate text-sm">
            {tab.name}
          </span>
          {tabs.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTabClose(tab.id)
              }}
              className="hover:bg-accent rounded p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

