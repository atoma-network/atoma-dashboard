"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ChevronRight, Plus, Book, Settings } from 'lucide-react'

// Mock data for nodes
const nodeData = [
  { id: 1, nodeName: "GPT-4", modelName: "Base", buildId: "2", subscriptionTime: "2024-01-20T08:30:45Z" },
  { id: 2, nodeName: "BERT-Large", modelName: "Pro", buildId: "3", subscriptionTime: "2024-01-20T09:15:30Z" },
  { id: 3, nodeName: "T5-Base", modelName: "Standard", buildId: "1", subscriptionTime: "2024-01-19T14:20:15Z" },
  { id: 4, nodeName: "LLaMA-2", modelName: "Pro", buildId: "2", subscriptionTime: "2024-01-18T16:45:22Z" },
  { id: 5, nodeName: "Claude-3", modelName: "Enterprise", buildId: "4", subscriptionTime: "2024-01-18T11:10:05Z" },
  { id: 6, nodeName: "Mistral-7B", modelName: "Base", buildId: "1", subscriptionTime: "2024-01-17T22:05:33Z" },
]

export default function MyNodeView() {
  const [view, setView] = useState<'choice' | 'manage'>('choice')
  
  if (view === 'choice') {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white border-purple-200 hover:border-purple-400 transition-colors cursor-pointer"
              onClick={() => window.open('/docs/node-registration', '_blank')}>
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700">
              <Book className="mr-2 h-5 w-5" />
              Register a New Node
            </CardTitle>
            <CardDescription className="text-purple-600">
              Learn how to set up and register your node with our documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <p className="text-sm text-purple-600">Get started with node registration</p>
            <ChevronRight className="h-5 w-5 text-purple-400" />
          </CardContent>
        </Card>

        <Card className="bg-white border-purple-200 hover:border-purple-400 transition-colors cursor-pointer"
              onClick={() => setView('manage')}>
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700">
              <Settings className="mr-2 h-5 w-5" />
              Manage Existing Nodes
            </CardTitle>
            <CardDescription className="text-purple-600">
              View and manage your registered nodes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <p className="text-sm text-purple-600">Access node management dashboard</p>
            <ChevronRight className="h-5 w-5 text-purple-400" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          className="text-purple-600 hover:text-purple-700"
          onClick={() => setView('choice')}
        >
          ← Back to Options
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add New Node
        </Button>
      </div>

      <Card className="bg-white border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-700">Node Management</CardTitle>
          <CardDescription className="text-purple-600">
            View and manage your registered nodes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" className="text-purple-600 border-purple-200">
                Register Node
              </Button>
              <Button variant="outline" className="text-purple-600 border-purple-200">
                Stack Events
              </Button>
              <Button variant="outline" className="text-purple-600 border-purple-200">
                View Tasks
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="border-purple-200">
                  <TableHead className="text-purple-600">Node Name</TableHead>
                  <TableHead className="text-purple-600">Model Name</TableHead>
                  <TableHead className="text-purple-600">Build ID</TableHead>
                  <TableHead className="text-purple-600">Subscription Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nodeData.map((node) => (
                  <TableRow key={node.id} className="border-purple-200">
                    <TableCell className="font-medium text-purple-700">{node.nodeName}</TableCell>
                    <TableCell>{node.modelName}</TableCell>
                    <TableCell>{node.buildId}</TableCell>
                    <TableCell>
                      {new Date(node.subscriptionTime).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

