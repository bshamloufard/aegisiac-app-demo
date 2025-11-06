import { cn } from '../lib/utils'
import { Database, BarChart3, Menu, BookOpen } from 'lucide-react'
import { Button } from './ui/button'

export function Sidebar({ activeView, setActiveView, isOpen, onToggle }) {
  const navItems = [
    { id: 'data', label: 'Data', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'journal', label: 'Notebook', icon: BookOpen },
  ]

  return (
    <div
      className={cn(
        'h-screen border-r bg-card flex flex-col transition-all duration-300 ease-in-out',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="h-12 border-b flex items-center px-4 gap-2">
        <Button variant="ghost" size="icon" onClick={onToggle} className="flex-shrink-0">
          <Menu className="w-5 h-5" />
        </Button>
        {isOpen && <h1 className="text-base font-bold whitespace-nowrap">Isengard</h1>}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg transition-colors',
                isOpen ? 'px-4 py-3 justify-start' : 'px-3 py-3 justify-center',
                activeView === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
              title={!isOpen ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

