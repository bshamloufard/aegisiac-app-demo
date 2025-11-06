import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { TabBar } from './components/TabBar'
import { DataPage } from './pages/DataPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { JournalPage } from './pages/JournalPage'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [tabs, setTabs] = useState([])
  const [activeTab, setActiveTab] = useState(null)

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
    
    if (activeTab === tabId) {
      if (newTabs.length > 0) {
        const lastTab = newTabs[newTabs.length - 1]
        setActiveTab(lastTab.id)
        setActiveView(lastTab.type)
      } else {
        setActiveTab(null)
        setActiveView(null)
      }
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
        {tabs.length > 0 && (
          <TabBar 
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onTabClose={handleTabClose}
          />
        )}
        <main className="flex-1 overflow-y-auto bg-background">
          {!activeView && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 max-w-md px-6">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-2xl font-semibold text-foreground">
                  Your workspace is empty
                </h2>
                <p className="text-muted-foreground">
                  Get started by selecting an option from the navigation panel on the left to create or view your content.
                </p>
              </div>
            </div>
          )}
          {activeView === 'data' && <DataPage />}
          {activeView === 'analytics' && <AnalyticsPage />}
          {activeView === 'journal' && <JournalPage />}
        </main>
      </div>
    </div>
  )
}

export default App
