"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bell, ClipboardList, PlusCircle, Settings, BarChart3, Search, Book, ChevronRight, ArrowLeft, Clock, AlertTriangle, Activity, History } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, BarChart, Line, LineChart, Legend, XAxis } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { Label } from "@/components/ui/label"

type ViewType = 'choice' | 'manage';
type TabType = 'rewards' | 'notifications' | 'tasks' | 'register' | 'optimization' | 'disputes' | 'history';
type NotificationType = 'model_request' | 'system' | 'alert';

const tabs = [
  { id: 'rewards', icon: BarChart3, label: 'Rewards' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'tasks', icon: ClipboardList, label: 'Task Management' },
  { id: 'register', icon: PlusCircle, label: 'Register Node' },
  { id: 'optimization', icon: Settings, label: 'Optimization' },
  { id: 'disputes', icon: AlertTriangle, label: 'Dispute Management' },
  { id: 'history', icon: History, label: 'History' },
] as const;

const recentTasks = [
  { id: 1, type: "Inference", status: "Completed", reward: "0.05 TOMA", timestamp: "2024-01-20 14:30", epoch: "156", tokensProcessed: 1500 },
  { id: 2, type: "Training", status: "In Progress", reward: "0.08 TOMA", timestamp: "2024-01-20 14:15", epoch: "156", tokensProcessed: 2000 },
  { id: 3, type: "Inference", status: "Completed", reward: "0.03 TOMA", timestamp: "2024-01-20 14:00", epoch: "156", tokensProcessed: 1000 },
]

const rewardHistory = [
  { id: 1, amount: "0.15 TOMA", timestamp: "2024-01-20", epoch: "156", reason: "Daily rewards" },
  { id: 2, amount: "0.22 TOMA", timestamp: "2024-01-19", epoch: "155", reason: "Task completion bonus" },
  { id: 3, amount: "0.18 TOMA", timestamp: "2024-01-18", epoch: "154", reason: "Daily rewards" },
]

const notifications = [
  {
    id: 1,
    type: 'model_request' as NotificationType,
    title: 'New Model Request',
    message: 'User1234 has requested the Qwen 2 model at a rate of $0.02/1000 tokens',
    timestamp: '2 minutes ago',
    status: 'pending'
  },
  {
    id: 2,
    type: 'system' as NotificationType,
    title: 'System Update',
    message: 'Platform maintenance scheduled for tomorrow at 02:00 UTC',
    timestamp: '1 hour ago',
    status: 'info'
  },
  {
    id: 3,
    type: 'alert' as NotificationType,
    title: 'High Usage Alert',
    message: 'Node CPU utilization exceeded 90% threshold',
    timestamp: '3 hours ago',
    status: 'warning'
  }
]

const modelDemand = [
  { time: "0000", llama405B: 523, llama3B: 789, gpt4: 312, bert: 156, t5: 245 },
  { time: "0400", llama405B: 610, llama3B: 820, gpt4: 280, bert: 190, t5: 300 },
  { time: "0800", llama405B: 580, llama3B: 750, gpt4: 420, bert: 210, t5: 280 },
  { time: "1200", llama405B: 680, llama3B: 890, gpt4: 380, bert: 170, t5: 320 },
  { time: "1600", llama405B: 720, llama3B: 920, gpt4: 350, bert: 220, t5: 290 },
  { time: "2000", llama405B: 550, llama3B: 780, gpt4: 290, bert: 180, t5: 260 },
  { time: "2359", llama405B: 523, llama3B: 789, gpt4: 312, bert: 156, t5: 245 },
]

const hardwareModelMapping = {
  "H100": ["Llama 3.1 405B", "GPT-4", "Mixtral 8x7B"],
  "A100": ["Llama 3.1 405B", "Llama 3.2 3B", "GPT-4", "Mixtral 8x7B"],
  "A6000": ["Llama 3.2 3B", "BERT-Large", "T5-Base"],
  "RTX 4090": ["Llama 3.2 3B", "T5-Base"],
  "RTX 3090": ["T5-Base", "BERT-Base"]
}

export function MyNodeView() {
  const [view, setView] = useState<ViewType>('choice')
  const [activeTab, setActiveTab] = useState<TabType>('notifications')
  const [historyView, setHistoryView] = useState<'rewards' | 'tasks'>('rewards')
  const [selectedHardware, setSelectedHardware] = useState<string>("")

  const ChoiceView = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-400 transition-colors cursor-pointer"
            onClick={() => window.open('/docs/node-registration', '_blank')}>
        <CardHeader>
          <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
            <Book className="mr-2 h-5 w-5" />
            Register a New Node
          </CardTitle>
          <CardDescription className="text-purple-600 dark:text-purple-400">
            Learn how to set up and register your node with our documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <p className="text-sm text-purple-600 dark:text-purple-400">Get started with node registration</p>
          <ChevronRight className="h-5 w-5 text-purple-400 dark:text-purple-500" />
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-400 transition-colors cursor-pointer"
            onClick={() => setView('manage')}>
        <CardHeader>
          <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
            <Settings className="mr-2 h-5 w-5" />
            Manage Existing Nodes
          </CardTitle>
          <CardDescription className="text-purple-600 dark:text-purple-400">
            View and manage your registered nodes
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <p className="text-sm text-purple-600 dark:text-purple-400">Access node management dashboard</p>
          <ChevronRight className="h-5 w-5 text-purple-400 dark:text-purple-500" />
        </CardContent>
      </Card>
    </div>
  )

  const ManageView = () => (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        className="mb-4 text-purple-600 hover:text-purple-700"
        onClick={() => setView('choice')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Options
      </Button>

      <div className="flex space-x-4 mb-6">
        {tabs.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant={activeTab === id ? 'default' : 'outline'}
            className={cn(
              "bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700",
              activeTab === id && "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
            )}
            onClick={() => setActiveTab(id as TabType)}
          >
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-purple-700 dark:text-purple-300">Notifications</CardTitle>
              <CardDescription className="text-purple-600 dark:text-purple-400">
                Recent updates and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={cn(
                      "border-l-4",
                      {
                        'border-l-blue-500': notification.type === 'model_request',
                        'border-l-purple-500': notification.type === 'system',
                        'border-l-yellow-500': notification.type === 'alert'
                      }
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium text-purple-700 dark:text-purple-300">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-purple-600 dark:text-purple-400">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {notification.timestamp}
                          </p>
                        </div>
                        {notification.type === 'model_request' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="space-y-6">
          {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <Input 
                  className="pl-10 bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700" 
                  placeholder="Search transactions..."
                />
              </div>

              {/* Rewards Overview */}
              <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-purple-700 dark:text-purple-300">5.23 TOMA</CardTitle>
                  <CardDescription className="text-purple-600 dark:text-purple-400">
                    Total Earnings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-purple-600 dark:text-purple-400">Available to claim:</span>
                      <span className="ml-2 font-medium text-purple-700 dark:text-purple-300">3.75 TOMA</span>
                    </div>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      size="sm"
                    >
                      Claim TOMA
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Node Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Node Uptime */}
                <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
                        <Clock className="mr-2 h-5 w-5" />
                        Node Uptime
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-green-600 dark:text-green-400">Online</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-600 dark:text-purple-400">Current uptime:</span>
                      <span className="font-medium text-purple-700 dark:text-purple-300">14 days, 6 hours</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-600 dark:text-purple-400">Uptime this month:</span>
                        <span className="text-purple-700 dark:text-purple-300">99.8%</span>
                      </div>
                      <Progress value={99.8} className="h-2 bg-purple-200 dark:bg-purple-900" />
                    </div>
                  </CardContent>
                </Card>

                {/* Node Utilization Rate */}
                <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
                      <Activity className="mr-2 h-5 w-5" />
                      Node Utilization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-600 dark:text-purple-400">Current utilization:</span>
                      <span className="font-medium text-purple-700 dark:text-purple-300">78%</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-600 dark:text-purple-400">Average this month:</span>
                        <span className="text-purple-700 dark:text-purple-300">82%</span>
                      </div>
                      <Progress value={82} className="h-2 bg-purple-200 dark:bg-purple-900" />
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">
                      Total tokens processed: <span className="font-medium text-purple-700 dark:text-purple-300">1,234,567</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-purple-700 dark:text-purple-300">Recent Activity</CardTitle>
                  <CardDescription className="text-purple-600 dark:text-purple-400">
                    Your latest completed and ongoing tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-purple-200 dark:border-gray-700">
                        <TableHead className="text-purple-600 dark:text-purple-400">Task Type</TableHead>
                        <TableHead className="text-purple-600 dark:text-purple-400">Status</TableHead>
                        <TableHead className="text-purple-600 dark:text-purple-400">Reward</TableHead>
                        <TableHead className="text-purple-600 dark:text-purple-400">Epoch</TableHead>
                        <TableHead className="text-purple-600 dark:text-purple-400">Tokens Processed</TableHead>
                        <TableHead className="text-purple-600 dark:text-purple-400">Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTasks.map((task) => (
                        <TableRow key={task.id} className="border-purple-200 dark:border-gray-700">
                          <TableCell className="text-gray-900 dark:text-gray-100">{task.type}</TableCell>
                          <TableCell>
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              task.status === "Completed" 
                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300" 
                                : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300"
                            )}>
                              {task.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">{task.reward}</TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">{task.epoch}</TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">{task.tokensProcessed.toLocaleString()}</TableCell>
                          <TableCell className="text-gray-900 dark:text-gray-100">{task.timestamp}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

      {activeTab === 'disputes' && (
        <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-purple-700 dark:text-purple-300">Dispute Management</CardTitle>
            <CardDescription className="text-purple-600 dark:text-purple-400">
              Handle and resolve disputes related to your node operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-purple-600 dark:text-purple-400">No active disputes at this time.</p>
            <Button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white">
              Open New Dispute
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
              <div className="flex space-x-4">
                <Button
                  variant={historyView === 'rewards' ? 'default' : 'outline'}
                  onClick={() => setHistoryView('rewards')}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Reward History
                </Button>
                <Button
                  variant={historyView === 'tasks' ? 'default' : 'outline'}
                  onClick={() => setHistoryView('tasks')}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Task History
                </Button>
              </div>

              {historyView === 'rewards' && (
                <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-purple-700 dark:text-purple-300">Reward History</CardTitle>
                    <CardDescription className="text-purple-600 dark:text-purple-400">
                      Your recent TOMA rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-purple-200 dark:border-gray-700">
                          <TableHead className="text-purple-600 dark:text-purple-400">Amount</TableHead>
                          <TableHead className="text-purple-600 dark:text-purple-400">Date</TableHead>
                          <TableHead className="text-purple-600 dark:text-purple-400">Epoch</TableHead>
                          <TableHead className="text-purple-600 dark:text-purple-400">Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rewardHistory.map((reward) => (
                          <TableRow key={reward.id} className="border-purple-200 dark:border-gray-700">
                            <TableCell className="font-medium text-gray-900 dark:text-gray-100">{reward.amount}</TableCell>
                            <TableCell className="text-gray-900 dark:text-gray-100">{reward.timestamp}</TableCell>
                            <TableCell className="text-gray-900 dark:text-gray-100">{reward.epoch}</TableCell>
                            <TableCell className="text-gray-900 dark:text-gray-100">{reward.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {historyView === 'tasks' && (
                <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-purple-700 dark:text-purple-300">Task History</CardTitle>
                    <CardDescription className="text-purple-600 dark:text-purple-400">
                      Your recent completed tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-purple-200 dark:border-gray-700">
                          <TableHead className="text-purple-600 dark:text-purple-400">Task Type</TableHead>
                          <TableHead className="text-purple-600 dark:text-purple-400">Reward</TableHead>
                          <TableHead className="text-purple-600 dark:text-purple-400">Epoch</TableHead>
                          <TableHead className="text-purple-600 dark:text-purple-400">Tokens Processed</TableHead>
                          <TableHead className="text-purple-600 dark:text-purple-400">Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTasks.map((task) => (
                          <TableRow key={task.id} className="border-purple-200 dark:border-gray-700">
                            <TableCell className="text-gray-900 dark:text-gray-100">{task.type}</TableCell>
                            <TableCell className="text-gray-900 dark:text-gray-100">{task.reward}</TableCell>
                            <TableCell className="text-gray-900 dark:text-gray-100">{task.epoch}</TableCell>
                            <TableCell className="text-gray-900 dark:text-gray-100">{task.tokensProcessed.toLocaleString()}</TableCell>
                            <TableCell className="text-gray-900 dark:text-gray-100">{task.timestamp}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

      {(activeTab === 'tasks') && (
  <div className="space-y-6">
    <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-purple-700 dark:text-purple-300">Model Demand</CardTitle>
        <CardDescription className="text-purple-600 dark:text-purple-400">
          Current demand for different models across the network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            llama405B: {
              label: "Llama 3.1 405B",
              color: "hsl(var(--chart-1))",
            },
            llama3B: {
              label: "Llama 3.2 3B",
              color: "hsl(var(--chart-2))",
            },
            gpt4: {
              label: "GPT-4",
              color: "hsl(var(--chart-3))",
            },
            bert: {
              label: "BERT-Large",
              color: "hsl(var(--chart-4))",
            },
            t5: {
              label: "T5-Base",
              color: "hsl(var(--chart-5))",
            },
          }}
          className="h-[300px]"
        >
          <LineChart
            data={modelDemand}
            margin={{ top: 5, right: 30, bottom: 25, left: 40 }}
          >
            <Legend 
              verticalAlign="top" 
              align="right"
              wrapperStyle={{ paddingBottom: "20px" }}
            />
            <XAxis 
              dataKey="time" 
              tickFormatter={(value) => value.replace(/(\d{2})(\d{2})/, '$1:$2')}
              tick={{ fill: 'var(--purple-600)' }}
            />
            <Line
              type="monotone"
              dataKey="llama405B"
              name="Llama 3.1 405B"
              stroke="var(--color-llama405B)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="llama3B"
              name="Llama 3.2 3B"
              stroke="var(--color-llama3B)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="gpt4"
              name="GPT-4"
              stroke="var(--color-gpt4)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="bert"
              name="BERT-Large"
              stroke="var(--color-bert)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="t5"
              name="T5-Base"
              stroke="var(--color-t5)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>

    <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-purple-700 dark:text-purple-300">Hardware Matchmaking</CardTitle>
        <CardDescription className="text-purple-600 dark:text-purple-400">
          Find compatible models for your hardware
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-purple-700 dark:text-purple-300">Select Your Hardware</Label>
          <Select
            value={selectedHardware}
            onValueChange={setSelectedHardware}
          >
            <SelectTrigger className="w-full border-purple-200 dark:border-gray-700">
              <SelectValue placeholder="Choose your GPU" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(hardwareModelMapping).map((hardware) => (
                <SelectItem key={hardware} value={hardware}>
                  {hardware}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedHardware && (
          <div className="space-y-4">
            <h4 className="font-medium text-purple-700 dark:text-purple-300">Compatible Models:</h4>
            <div className="grid gap-2">
              {hardwareModelMapping[selectedHardware].map((model) => (
                <div 
                  key={model}
                  className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-800"
                >
                  <span className="text-purple-700 dark:text-purple-300">{model}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
)}

      {(activeTab !== 'rewards' && activeTab !== 'disputes' && activeTab !== 'history' && activeTab !== 'notifications' && activeTab !== 'tasks') && (
        <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-purple-700 dark:text-purple-300">{tabs.find(tab => tab.id === activeTab)?.label}</CardTitle>
            <CardDescription className="text-purple-600 dark:text-purple-400">
              This section is under development.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-purple-600 dark:text-purple-400">Content for {tabs.find(tab => tab.id === activeTab)?.label} will be available soon.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div>
      {view === 'choice' ? <ChoiceView /> : <ManageView />}
    </div>
  )
}

