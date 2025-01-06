"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Server, BarChartIcon as ChartBar, Cpu, Timer, ArrowUpDown} from "lucide-react";
import { Line, LineChart, Pie, PieChart, Legend, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { useEffect, useState } from "react";
import {
  getComputeUnitsProcessed,
  getLatency,
  // getNodesDistribution,
  getSubscriptions,
  getTasks,
  type ComputedUnitsProcessedResponse,
  type LatencyResponse,
  type NodeSubscription,
  type Task,
} from "@/lib/atoma";
import Image from "next/image";

const nodeDistribution = [
  { region: "North America", nodes: 856, percentage: 32.6 },
  { region: "Europe", nodes: 743, percentage: 28.3 },
  { region: "Asia Pacific", nodes: 524, percentage: 20.0 },
  { region: "South America", nodes: 285, percentage: 10.9 },
  { region: "Africa", nodes: 215, percentage: 8.2 }
]


export function NodeStatusView() {
  const [stats, setStats] = useState([
    {
      title: "Total Nodes",
      value: "Loading...",
      description: "Across all networks",
      icon: Server,
    },
    {
      title: "Nodes Online",
      value: "Loading...",
      description: "Currently active",
      icon: Users,
    },
    {
      title: "Models Running",
      value: "Loading...",
      description: "Different model types",
      icon: ChartBar,
    },
    {
      title: "Compute Units",
      value: "Loading...",
      description: "Past week",
      icon: Cpu,
    },
    {
      title: "Avg Latency",
      value: "Loading...",
      description: "Past week",
      icon: Timer,
    },
    {
      title: "Throughput",
      value: "Loading...",
      description: "Requests/minute",
      icon: ArrowUpDown,
    },
  ]);
  const [subscriptions, setSubscriptions] = useState<NodeSubscription[] | undefined>();
  const [tasks, setTasks] = useState<Task[] | undefined>();
  // const [subscribers, setSubscribers] = useState<{ model_name: string; nodesRunning: number }[]>();
  const [computeUnitsData, setComputeUnitsData] = useState<{ time: string; units: number }[]>([]);
  const [activityModels, setActivityModels] = useState<{ model_name: string; color: string }[]>([]);
  const [networkActivityData, setNetworkActivityData] = useState<unknown[]>([]);
  const [modelDistribution, setModelDistruibution] = useState<{ model: string, nodesRunning: number }[]>([]);
  // const [statsStack, setStatsStacks] = useState<unknown[]>([]);
  // const [computeUnits, setComputeUnits] = useState<ComputedUnitsProcessedResponse[]>([]);
  // const [latency, setLatency] = useState<LatencyResponse[]>([]);
  useEffect(() => {
    // getStatsStacks().then((stacks) => {
    //   setStatsStacks(stacks.map((data: StatsStack) => ({
    //     time: new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    //     bought: data.num_compute_units,
    //     settled: data.settled_num_compute_units,
    //   })));
    // });
    getComputeUnitsProcessed().then((computeUnits: ComputedUnitsProcessedResponse[]) => {
      // setComputeUnits(computeUnits);
      const totalUnits = computeUnits.reduce((sum, data) => sum + data.amount, 0);
      const totalRequests = computeUnits.reduce((sum, data) => sum + data.requests, 0);
      const totalTime = computeUnits.reduce((sum, data) => sum + data.time, 0);
      console.log(computeUnits);
      setActivityModels(
        Array.from(new Set(computeUnits.map((data) => data.model_name))).map((model_name, i) => ({
          model_name: model_name,
          color: `hsl(var(--chart-${i + 1}))`,
        }))
      );
      const group_by_time = computeUnits.reduce((acc: { [key: string]: { [key: string]: number } }, data) => {
        if (!(data.timestamp in acc)) {
          acc[data.timestamp] = {};
        }
        acc[data.timestamp][data.model_name] = data.amount;
        return acc;
      }, {});
      console.log("group_by_time", group_by_time);
      const sortedGroupByTime = Object.keys(group_by_time)
        .sort()
        .map((key) => ({
          time: new Date(key).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          data: group_by_time[key],
        }));
      console.log("sortedGroupByTime", sortedGroupByTime);

      setNetworkActivityData(sortedGroupByTime);
      setComputeUnitsData(
        sortedGroupByTime.map((data) => ({
          time: data.time,
          units: Object.keys(data.data).reduce((sum, key) => sum + data.data[key] , 0),
        }))
      );
      setStats((prevStats) => [
        ...prevStats.slice(0, 3),
        {
          ...prevStats[3],
          value: totalUnits.toString(),
        },
        prevStats[4],
        {
          ...prevStats[5],
          value: totalTime?(totalRequests * ((1000 * 60) / totalTime)).toFixed(0):"-",
        },
        ...prevStats.slice(6),
      ]);
    });
    getLatency().then((latency: LatencyResponse[]) => {
      // setLatency(latency);
      const totalLatency = latency.reduce((sum, data) => sum + data.latency, 0);
      const totalRequests = latency.reduce((sum, data) => sum + data.requests, 0);
      setStats((prevStats) => [
        ...prevStats.slice(0, 4),
        {
          ...prevStats[4],
          value: totalRequests?`${(totalLatency / totalRequests).toFixed(2)}ms`:"- ms",
        },
        ...prevStats.slice(5),
      ]);
    });
    getSubscriptions().then((subscriptions) => {
      setSubscriptions(subscriptions);
      const nodes: { [key: string]: boolean } = {};
      for (const subscription of subscriptions) {
        if (subscription.node_small_id in nodes) {
          nodes[subscription.node_small_id] ||= subscription.valid;
        } else {
          nodes[subscription.node_small_id] = subscription.valid;
        }
      }
      setStats((prevStats) => [
        {
          ...prevStats[0],
          value: Object.keys(nodes).length.toString(),
        },
        {
          ...prevStats[1],
          value: Object.values(nodes)
            .filter((v) => v)
            .length.toString(),
        },
        ...prevStats.slice(2),
      ]);
    });
    getTasks().then((tasks_with_modalities) => {
      const tasks = tasks_with_modalities.map((task) => task[0]);
      console.log('tasks', tasks);
      const models: { [key: string]: boolean } = {};
      setTasks(tasks);
      for (const task of tasks) {
        if (!task.model_name) {
          continue;
        }
        if (task.model_name in models) {
          models[task.model_name] ||= !task.is_deprecated;
        } else {
          models[task.model_name] = task.is_deprecated;
        }
      }
      setStats((prevStats) => [
        ...prevStats.slice(0, 2),
        {
          ...prevStats[2],
          value: Object.keys(models).length.toString(),
        },
        ...prevStats.slice(3),
      ]);
    });
  }, []);
  useEffect(() => {
    if (!tasks || !subscriptions) {
      return;
    }
    const subscribers: { [key: string]: number } = {};
    for (const task of tasks) {
      if (!task.model_name) {
        continue;
      }
      if (!(task.model_name in subscribers)) {
        subscribers[task.model_name] = 0;
      }
      subscribers[task.model_name] += subscriptions.filter(
        (subscription) => subscription.task_small_id === task.task_small_id && subscription.valid
      ).length;
    }
    // setSubscribers(Object.entries(subscribers).map(([model_name, nodesRunning]) => ({ model_name, nodesRunning })));
    setModelDistruibution(Object.entries(subscribers).map(([model, nodesRunning]) => ({ model, nodesRunning })));
  }, [tasks, subscriptions]);
  return (
    <div className="space-y-8">
      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {stat.title}
                {/* {stat.tooltip && (
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 ml-1 inline-block text-purple-400 dark:text-purple-300 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-64 text-sm">{stat.tooltip}</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                )} */}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">{stat.value}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Network Activity and Compute Units Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Compute Units Section */}
        <Card className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Compute Units Processed</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Processing activity over the past 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                units: {
                  label: "Compute Units",
                  color: "hsl(271, 91%, 65%)", // Bright purple
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
                          <p className="text-purple-600 dark:text-purple-400">{`Units: ${payload?.[0]?.value?.toLocaleString()}`}</p>
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
        <Card className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Network Activity</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Model-wise activity distribution over 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={activityModels.reduce((acc: { [key: string]: { label: string; color: string } }, model) => {
                acc[model.model_name] = {
                  label: model.model_name,
                  color: model.color,
                };
                return acc;
              }, {})}
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
                  dataKey={"data"}
                  tick={{ fill: 'var(--purple-600)' }}
                  tickFormatter={(value) => {
                    console.log(value)
                  return  `${value / 1000}k`
                  }
                  }
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-2 border border-purple-200 dark:border-gray-700 rounded shadow">
                          <p className="text-purple-700 dark:text-purple-300">{`Time: ${label}`}</p>
                          {payload.map((entry, index) => (
                            <p key={index} style={{ color: entry.color }}>{`${entry.name}: ${entry?.value?.toLocaleString()}`}</p>
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
                {activityModels.map((model) => {
                  return (
                    <Line
                      key={model.model_name}
                      type="monotone"
                      dataKey={model.model_name}
                      stroke={model.color}
                      strokeWidth={2}
                    />
                  )
                })}
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        {/* Stacks Bought/Settled Section */}
        {/* <Card className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Stacks Activity</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Stacks activity  over 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ bought: { label: "Bought", color:"hsl(var(--chart-1))" },settled: { label: "Settled", color:"hsl(var(--chart-2))" } }}
              className="h-[300px] w-full"
            >
              <LineChart
                data={statsStack}
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
                            <p key={index} style={{ color: entry.color }}>{`${entry.name}: ${entry?.value?.toLocaleString()}`}</p>
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
                    key={"bought"}
                    type="monotone"
                    dataKey={"bought"}
                    stroke={"hsl(var(--chart-1))"}
                    strokeWidth={2}
                  />
                  <Line
                    key={"settled"}
                    type="monotone"
                    dataKey={"settled"}
                    stroke={"hsl(var(--chart-2))"}
                    strokeWidth={2}
                  />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card> */}
      </div>

      {/* Models Running Section */}
      <Card className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30 shadow-sm">
  <CardHeader>
    <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Models Running</CardTitle>
    <CardDescription className="text-gray-500 dark:text-gray-400">
      Distribution of nodes across different models
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <Table>
          <TableHeader>
            <TableRow className="border-purple-200 dark:border-purple-800/30">
              <TableHead className="text-purple-600 dark:text-purple-300">Model</TableHead>
              <TableHead className="text-purple-600 dark:text-purple-300">Nodes Running</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modelDistribution.map((item) => (
              <TableRow key={item.model} className="border-purple-200 dark:border-purple-800/30">
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
        <Card className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Geographic Distribution</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Node distribution across regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[400px] relative overflow-hidden rounded-lg">
              <Image 
                src="/world.svg" 
                alt="Global node distribution map"
                layout="fill"
                objectFit="cover"
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

        <Card className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Regional Distribution Details</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Detailed breakdown of node distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-purple-200 dark:border-purple-800/30">
                  <TableHead className="text-purple-600 dark:text-purple-300">Region</TableHead>
                  <TableHead className="text-purple-600 dark:text-purple-300">Nodes</TableHead>
                  <TableHead className="text-purple-600 dark:text-purple-300">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nodeDistribution.map((item) => (
                  <TableRow key={item.region} className="border-purple-200 dark:border-purple-800/30">
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

