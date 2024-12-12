"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Server, BarChartIcon as ChartBar, Cpu, Timer, ArrowUpDown, Info } from 'lucide-react'
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Legend, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const stats = [
  {
    title: "Total Nodes",
    value: "2,623",
    description: "Across all networks",
    icon: Server
  },
  {
    title: "Nodes Online",
    value: "1,351",
    description: "Currently active",
    icon: Users
  },
  {
    title: "Models Running",
    value: "12",
    description: "Different model types",
    icon: ChartBar
  },
  {
    title: "Compute Units",
    value: "8.2M",
    description: "Past 24 hours",
    icon: Cpu
  },
  {
    title: "Avg Latency",
    value: "42ms",
    description: "Last 5 minutes",
    icon: Timer,
    tooltip: "Average time taken to receive the first token of a response in the last 5 minutes."
  },
{
    title: "Throughput",
    value: "850K",
    description: "Requests/minute",
    icon: ArrowUpDown
}
]

const modelDistribution = [
  { model: "Llama 3.1 405B", nodesRunning: 523 },
  { model: "Llama 3.2 3B", nodesRunning: 789 },
  { model: "GPT-4", nodesRunning: 312 },
  { model: "BERT-Large", nodesRunning: 156 },
  { model: "T5-Base", nodesRunning: 245 }
]

const nodeDistribution = [
  { region: "North America", nodes: 856, percentage: 32.6 },
  { region: "Europe", nodes: 743, percentage: 28.3 },
  { region: "Asia Pacific", nodes: 524, percentage: 20.0 },
  { region: "South America", nodes: 285, percentage: 10.9 },
  { region: "Africa", nodes: 215, percentage: 8.2 }
]

const networkActivityData = [
  { time: "00:00", llama: 1200, gpt4: 800, mixtral: 400 },
  { time: "02:00", llama: 1050, gpt4: 850, mixtral: 600 },
  { time: "04:00", llama: 900, gpt4: 950, mixtral: 850 },
  { time: "06:00", llama: 1100, gpt4: 1100, mixtral: 700 },
  { time: "08:00", llama: 1400, gpt4: 1400, mixtral: 500 },
  { time: "10:00", llama: 1500, gpt4: 1300, mixtral: 900 },
  { time: "12:00", llama: 1600, gpt4: 1100, mixtral: 1600 },
  { time: "14:00", llama: 1550, gpt4: 1300, mixtral: 1500 },
  { time: "16:00", llama: 1500, gpt4: 1500, mixtral: 1300 },
  { time: "18:00", llama: 1300, gpt4: 1350, mixtral: 1200 },
  { time: "20:00", llama: 1100, gpt4: 1200, mixtral: 1100 },
  { time: "22:00", llama: 1200, gpt4: 1000, mixtral: 1050 },
]

const computeUnitsData = [
  { time: "00:00", units: 280000 },
  { time: "02:00", units: 300000 },
  { time: "04:00", units: 320000 },
  { time: "06:00", units: 380000 },
  { time: "08:00", units: 450000 },
  { time: "10:00", units: 500000 },
  { time: "12:00", units: 520000 },
  { time: "14:00", units: 510000 },
  { time: "16:00", units: 480000 },
  { time: "18:00", units: 420000 },
  { time: "20:00", units: 380000 },
  { time: "22:00", units: 360000 },
]

export function NodeStatusView() {
  return (
    <div className="space-y-8">
      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">
                {stat.title}
                {stat.tooltip && (
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 ml-1 inline-block text-purple-400 dark:text-purple-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-64 text-sm">{stat.tooltip}</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                )}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stat.value}</div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Node Explorer */}
      <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-purple-700 dark:text-purple-300">Node Explorer</CardTitle>
          <CardDescription className="text-purple-600 dark:text-purple-400">
            Search and view detailed node information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input 
              type="text" 
              placeholder="Enter node address or identifier" 
              className="w-full border-purple-200 dark:border-gray-700 text-purple-900 dark:text-purple-100 placeholder-purple-400 dark:placeholder-purple-500 dark:bg-gray-800"
            />
          </div>
        </CardContent>
      </Card>

      {/* Network Activity and Compute Units Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Compute Units Section */}
        <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-purple-700 dark:text-purple-300">Compute Units Processed</CardTitle>
            <CardDescription className="text-purple-600 dark:text-purple-400">
              Processing activity over the past 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                units: {
                  label: "Compute Units",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px] w-full"
            >
              <LineChart
                data={computeUnitsData}
                margin={{ top: 5, right: 0, bottom: 25, left: 20 }}
              >
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: 'var(--purple-600)' }}
                  scale="point"
                  interval={2}
                  padding={{ left: 10, right: 30 }}
                />
                <YAxis
                  tick={{ fill: 'var(--purple-600)' }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-2 border border-purple-200 dark:border-gray-700 rounded shadow">
                          <p className="text-purple-700 dark:text-purple-300">{`Time: ${label}`}</p>
                          <p className="text-purple-600 dark:text-purple-400">{`Units: ${payload[0].value.toLocaleString()}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="units"
                  stroke="var(--color-units)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--color-units)" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Network Activity Section */}
        <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-purple-700 dark:text-purple-300">Network Activity</CardTitle>
            <CardDescription className="text-purple-600 dark:text-purple-400">
              Model-wise activity distribution over 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                llama: {
                  label: "Llama Models",
                  color: "hsl(var(--chart-1))",
                },
                gpt4: {
                  label: "GPT-4",
                  color: "hsl(var(--chart-2))",
                },
                mixtral: {
                  label: "Mixtral",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px] w-full"
            >
              <LineChart
                data={networkActivityData}
                margin={{ top: 5, right: 0, bottom: 25, left: 20 }}
              >
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: 'var(--purple-600)' }}
                  scale="point"
                  interval={2}
                  padding={{ left: 10, right: 30 }}
                />
                <YAxis
                  tick={{ fill: 'var(--purple-600)' }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-2 border border-purple-200 dark:border-gray-700 rounded shadow">
                          <p className="text-purple-700 dark:text-purple-300">{`Time: ${label}`}</p>
                          {payload.map((entry, index) => (
                            <p key={index} style={{ color: entry.color }}>{`${entry.name}: ${entry.value.toLocaleString()}`}</p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  wrapperStyle={{ paddingBottom: "20px" }}
                />
                <Line
                  type="monotone"
                  dataKey="llama"
                  name="Llama Models"
                  stroke="var(--color-llama)"
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
                  dataKey="mixtral"
                  name="Mixtral"
                  stroke="var(--color-mixtral)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Models Running Section */}
      <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
  <CardHeader>
    <CardTitle className="text-lg font-medium text-purple-700 dark:text-purple-300">Models Running</CardTitle>
    <CardDescription className="text-purple-600 dark:text-purple-400">
      Distribution of nodes across different models
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <Table>
          <TableHeader>
            <TableRow className="border-purple-200 dark:border-gray-700">
              <TableHead className="text-purple-600 dark:text-purple-400">Model</TableHead>
              <TableHead className="text-purple-600 dark:text-purple-400">Nodes Running</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modelDistribution.map((item) => (
              <TableRow key={item.model} className="border-purple-200 dark:border-gray-700">
                <TableCell className="font-medium text-purple-700 dark:text-purple-300">{item.model}</TableCell>
                <TableCell className="text-purple-600 dark:text-purple-400">{item.nodesRunning}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-center">
        <ChartContainer
          config={{
            llama405b: {
              label: "Llama 3.1 405B",
              color: "hsl(var(--chart-1))",
            },
            llama3b: {
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
          className="h-[300px] w-full"
        >
          <PieChart>
            <Pie
              data={modelDistribution}
              dataKey="nodesRunning"
              nameKey="model"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => entry.model}
            >
              {modelDistribution.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`hsl(var(--chart-${index + 1}))`}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  </CardContent>
</Card>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-purple-700 dark:text-purple-300">Geographic Distribution</CardTitle>
            <CardDescription className="text-purple-600 dark:text-purple-400">
              Node distribution across regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[400px] relative overflow-hidden rounded-lg">
              <img 
                src="/placeholder.svg?height=400&width=600" 
                alt="Global node distribution map"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-sm font-medium">Node distribution across major regions</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {nodeDistribution.map((item) => (
                    <div key={item.region} className="flex items-center justify-between">
                      <span className="text-xs">{item.region}</span>
                      <span className="text-xs font-bold">{item.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-purple-700 dark:text-purple-300">Regional Distribution Details</CardTitle>
            <CardDescription className="text-purple-600 dark:text-purple-400">
              Detailed breakdown of node distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-purple-200 dark:border-gray-700">
                  <TableHead className="text-purple-600 dark:text-purple-400">Region</TableHead>
                  <TableHead className="text-purple-600 dark:text-purple-400">Nodes</TableHead>
                  <TableHead className="text-purple-600 dark:text-purple-400">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nodeDistribution.map((item) => (
                  <TableRow key={item.region} className="border-purple-200 dark:border-gray-700">
                    <TableCell className="font-medium text-purple-700 dark:text-purple-300">{item.region}</TableCell>
                    <TableCell className="text-purple-600 dark:text-purple-400">{item.nodes}</TableCell>
                    <TableCell className="text-purple-600 dark:text-purple-400">{item.percentage.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

