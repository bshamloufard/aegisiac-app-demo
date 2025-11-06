import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { TabBar } from './components/TabBar'
import { DataPage } from './pages/DataPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { JournalPage } from './pages/JournalPage'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState('data')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [tabs, setTabs] = useState([{ id: 1, name: 'Data', type: 'data' }])
  const [activeTab, setActiveTab] = useState(1)

  // Handle navigation from sidebar - creates new tab if needed or switches to existing one
  const handleViewChange = (view) => {
    setActiveView(view)
    const existingTab = tabs.find(tab => tab.type === view)

    if (existingTab) {
      setActiveTab(existingTab.id)
    } else {
      const newTab = {
        id: Date.now(),
        name: view.charAt(0).toUpperCase() + view.slice(1),
        type: view
      }
      setTabs([...tabs, newTab])
      setActiveTab(newTab.id)
    }
  }

  // Switch between tabs
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    const tab = tabs.find(t => t.id === tabId)
    if (tab) {
      setActiveView(tab.type)
    }
  }

  // Close tab and switch to next available tab if needed
  const handleTabClose = (tabId) => {
    const newTabs = tabs.filter(t => t.id !== tabId)
    setTabs(newTabs)

    if (activeTab === tabId && newTabs.length > 0) {
      const lastTab = newTabs[newTabs.length - 1]
      setActiveTab(lastTab.id)
      setActiveView(lastTab.type)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeView={activeView}
        setActiveView={handleViewChange}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onTabClose={handleTabClose}
        />
        <main className="flex-1 overflow-y-auto bg-background">
          {activeView === 'data' && <DataPage />}
          {activeView === 'analytics' && <AnalyticsPage />}
          {activeView === 'journal' && <JournalPage />}
        </main>
      </div>
    </div>
  )
}

export default App
