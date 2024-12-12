"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Server, BarChartIcon as ChartBar, Cpu, Timer, ArrowUpDown } from 'lucide-react'
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Legend, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

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
    icon: Timer
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
  { time: "0000", llama: 1200, gpt4: 800, mixtral: 400 },
  { time: "0400", llama: 900, gpt4: 950, mixtral: 850 },
  { time: "0800", llama: 1400, gpt4: 1400, mixtral: 500 },
  { time: "1200", llama: 1600, gpt4: 1100, mixtral: 1600 },
  { time: "1600", llama: 1500, gpt4: 1500, mixtral: 1300 },
  { time: "2000", llama: 1100, gpt4: 1200, mixtral: 1100 },
  { time: "2359", llama: 1250, gpt4: 825, mixtral: 1000 },
]

const computeUnitsData = [
  { time: "0000", units: 280000 },
  { time: "0400", units: 320000 },
  { time: "0800", units: 450000 },
  { time: "1200", units: 520000 },
  { time: "1600", units: 480000 },
  { time: "2000", units: 380000 },
  { time: "2359", units: 350000 },
]

export function NodeStatusView() {
  return (
    <div className="space-y-8">
      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">{stat.title}</CardTitle>
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
          <div className="flex gap-2">
            <Button variant="outline" className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-gray-700">
              Advanced Search
            </Button>
            <Button variant="outline" className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-gray-700">
              Export Data
            </Button>
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
              className="h-[300px]"
            >
              <LineChart
                data={computeUnitsData}
                margin={{ top: 5, right: 30, bottom: 25, left: 40 }}
              >
                <Line
                  type="monotone"
                  dataKey="units"
                  stroke="var(--color-units)"
                  strokeWidth={2}
                />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(value) => value.replace(/(\d{2})(\d{2})/, '$1:$2')}
                  tick={{ fill: 'var(--purple-600)' }}
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
              className="h-[300px]"
            >
              <LineChart
                data={networkActivityData}
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
        <CardContent className="space-y-6">
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

          <ChartContainer
            config={{
              nodesRunning: {
                label: "Nodes Running",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <BarChart
              data={modelDistribution}
              margin={{ top: 5, right: 30, bottom: 25, left: 40 }}
            >
              <Bar
                dataKey="nodesRunning"
                fill="var(--color-nodesRunning)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Network Activity Section */}
      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-purple-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-purple-700 dark:text-purple-300">Geographic Distribution</CardTitle>
            <CardDescription className="text-purple-600 dark:text-purple-400">
              Node distribution across regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <img 
                src="/placeholder.svg?height=300&width=600" 
                alt="Global node distribution heatmap"
                className="w-full h-[300px] object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
              />
            </div>
            <ChartContainer
              config={{
                percentage: {
                  label: "Distribution",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[200px]"
            >
              <PieChart>
                <Pie
                  data={nodeDistribution}
                  dataKey="percentage"
                  nameKey="region"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="var(--color-percentage)"
                  label
                />
              </PieChart>
            </ChartContainer>
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

