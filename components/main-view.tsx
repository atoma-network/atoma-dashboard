"use client"

import { useState } from "react"
import { Cloud, Database, Key, CreditCard, BookOpen, Settings, ChevronRight, Search, Home, Activity } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { MyNodeView } from "./my-node-view"
import { CloudView } from "./cloud-view"

type TabType = 'node-status' | 'my-node' | 'cloud';

const mainTabs = [
  { id: 'node-status', icon: Activity, label: 'Network Status' },
  { id: 'cloud', icon: Cloud, label: 'Developer Portal' },
  { id: 'my-node', icon: Home, label: 'MyNode' },
] as const;

export function MainView() {
  const [activeTab, setActiveTab] = useState<TabType>('node-status')

  const NodeStatusTab = () => (
    <div className="space-y-6">
      <Card className="bg-white border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-700">Network Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-purple-600">Total Nodes</p>
              <p className="text-2xl font-bold text-purple-700">1,234</p>
            </div>
            <div>
              <p className="text-sm text-purple-600">Network Uptime</p>
              <p className="text-2xl font-bold text-purple-700">99.99%</p>
            </div>
            <div>
              <p className="text-sm text-purple-600">Total Compute Power</p>
              <p className="text-2xl font-bold text-purple-700">10.5 PetaFLOPS</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-700">Recent Network Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>New Node Joined</TableCell>
                <TableCell>2 minutes ago</TableCell>
                <TableCell><Badge>Completed</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Large Compute Task</TableCell>
                <TableCell>15 minutes ago</TableCell>
                <TableCell><Badge variant="secondary">In Progress</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Network Upgrade</TableCell>
                <TableCell>1 hour ago</TableCell>
                <TableCell><Badge>Completed</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar className="w-64" collapsible="icon">
          <SidebarHeader className="border-b border-purple-200 p-4">
            <h2 className="text-lg font-semibold text-purple-700">Atoma Platform</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainTabs.map(({ id, icon: Icon, label }) => (
                    <SidebarMenuItem key={id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(id as TabType)}
                        isActive={activeTab === id}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6 bg-purple-50">
          {activeTab === 'node-status' && <NodeStatusTab />}
          {activeTab === 'my-node' && <MyNodeView />}
          {activeTab === 'cloud' && <CloudView />}
        </div>
      </div>
    </SidebarProvider>
  )
}

