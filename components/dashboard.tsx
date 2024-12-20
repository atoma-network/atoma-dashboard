"use client"

import { useState } from "react"
import { Activity, Cloud, Home } from 'lucide-react'
import { NodeStatusView } from "@/components/node-status-view"
import { MyNodeView } from "@/components/my-node-view"
import { CloudView } from "@/components/cloud-view"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeProvider } from "next-themes"
import { AskUtopia } from "@/components/ask-utopia"
import { LoginRegisterButton } from "@/components/login-register-button"

type TabType = 'node-status' | 'cloud' | 'my-node';

const mainTabs = [
{ id: 'node-status', icon: Activity, label: 'Network Status' },
{ id: 'cloud', icon: Cloud, label: 'Developer Portal' },
{ id: 'my-node', icon: Home, label: 'MyNode' },
] as const;

export default function Dashboard() {
const [activeTab, setActiveTab] = useState<TabType>('node-status')

return (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <div className="flex flex-col h-screen bg-white dark:bg-[#1A1C23]">
      <header className="bg-white dark:bg-[#1A1C23] border-b border-purple-100 dark:border-purple-800/30 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Atoma Platform</h1>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {activeTab === 'cloud' && <LoginRegisterButton />}
          </div>
        </div>
        <nav className="mt-4">
          <ul className="flex space-x-4">
            {mainTabs.map(({ id, icon: Icon, label }) => (
              <li key={id}>
                <button
                  onClick={() => setActiveTab(id as TabType)}
                  className={`flex items-center px-3 py-2 rounded-md ${
                    activeTab === id
                      ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-500/10'
                  }`}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-[#1A1C23]">
        {activeTab === 'node-status' && <NodeStatusView />}
        {activeTab === 'cloud' && <CloudView />}
        {activeTab === 'my-node' && <MyNodeView />}
      </main>

      <AskUtopia />
    </div>
  </ThemeProvider>
)
}

