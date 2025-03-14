"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Cell,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TooltipProvider, TooltipTrigger, TooltipContent, Tooltip as ShadTooltip } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const days = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"];
const models = ["Llama", "DeepSeek", "Qwen", "FLUXL", "Mistral"];

const colors = {
  light: {
    blue: "#42A5F5",
    green: "#66BB6A",
    yellow: "#FFEB3B",
    red: "#E57373",
    purple: "#9575CD",
  },
  dark: {
    blue: "#1E88E5",
    green: "#43A047",
    yellow: "#FDD835",
    red: "#D32F2F",
    purple: "#7E57C2",
  },
};

type ColorKey = keyof typeof colors.light;
const colorKeys = Object.keys(colors.light) as ColorKey[];

const generateModelData = (baseRange: [number, number], variance: number) => {
  const baseValue = baseRange[0] + Math.random() * (baseRange[1] - baseRange[0]);
  return days.map(() => {
    return Math.round(baseValue + (Math.random() - 0.5) * variance);
  });
};

const requestsPerModel = days.map((day, dayIndex) => {
  const data: Record<string, any> = { name: day };
  models.forEach((model, index) => {
    const modelData = generateModelData([3000, 5000], 1000);
    data[model] = modelData[dayIndex];
  });
  return data;
});

const generateLatencyData = (baseRanges: Record<string, [number, number]>, variance: number) => {
  return days.map(day => {
    const dayData: Record<string, any> = { name: day };
    models.forEach(model => {
      const modelData = generateModelData(baseRanges[model], variance);
      dayData[model] = modelData[days.indexOf(day)];
    });
    return dayData;
  });
};

const ttftData = generateLatencyData(
  {
    Llama: [80, 120],
    DeepSeek: [60, 100],
    Qwen: [90, 130],
    FLUXL: [70, 110],
    Mistral: [100, 140],
  },
  15
);

const itlData = generateLatencyData(
  {
    Llama: [30, 50],
    DeepSeek: [25, 45],
    Qwen: [35, 55],
    FLUXL: [20, 40],
    Mistral: [40, 60],
  },
  8
);

// Data for the bar chart
const tokensPerModel = [
  { name: "Llama", value: 5702 },
  { name: "DeepSeek", value: 4200 },
  { name: "Qwen", value: 3728 },
  { name: "FLUXL", value: 2500 },
  { name: "Mistral", value: 1800 },
].map((item, index) => ({
  ...item,
  color:
    typeof window !== "undefined" && document.documentElement.classList.contains("dark")
      ? Object.values(colors.dark)[index]
      : Object.values(colors.light)[index],
}));
const formatNumber = (value: number) => value.toLocaleString();
const chartConfigs = [
  {
    title: "Requests Per Model",
    special: "stacked",
    id: "requests-per-model",
    tooltip: "Requests processed across different models",
    data: requestsPerModel,
    colors: colors,
    valueFormatter: (value: number) => value.toLocaleString(),
  },
  {
    title: "Tokens Per Model",
    special: "bar",
    id: "tokens-per-model",
    tooltip: "Tokens generated across models",
    valueFormatter: formatNumber,
  },
  {
    title: "Time To First Token (TTFT)",
    special: "latency",
    data: ttftData,
    id: "ttft",
    tooltip: "Time to first token, latency before first token generation",
    colors: colors,
    valueFormatter: (value: number) => `${value}ms`,
  },
  {
    title: "Inter Token Latency (ITL)",
    special: "latency",
    data: itlData,
    id: "itl",
    tooltip: "Inter-token latency, time between token generations",
    colors: colors,
    valueFormatter: (value: number) => `${value}ms`,
  },
];

function NetworkChartCard({ config }: { config: (typeof chartConfigs)[0] }) {
  if (config.special === "stacked") {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <ShadTooltip>
              <TooltipTrigger asChild>
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-500">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Information</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{config.tooltip}</p>
              </TooltipContent>
            </ShadTooltip>
          </TooltipProvider>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={config.data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#888888", fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888888", fontSize: 12 }}
                width={60}
                tickFormatter={config.valueFormatter}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  fontWeight: "bold",
                  color: "var(--card-foreground)",
                }}
                formatter={(value: number, name: string) => [
                  <span
                    key={`${name}-value`}
                    style={{
                      color:
                        typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                          ? colors.dark[colorKeys[models.indexOf(name) % colorKeys.length]]
                          : colors.light[colorKeys[models.indexOf(name) % colorKeys.length]],
                    }}
                  >
                    {config.valueFormatter(value)}
                  </span>,
                  name,
                ]}
              />
              {models.map((model, index) => (
                <Area
                  key={model}
                  type="monotone"
                  dataKey={model}
                  stackId="1"
                  stroke={
                    typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                      ? colors.dark[colorKeys[index % colorKeys.length]]
                      : colors.light[colorKeys[index % colorKeys.length]]
                  }
                  fill={
                    typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                      ? colors.dark[colorKeys[index % colorKeys.length]]
                      : colors.light[colorKeys[index % colorKeys.length]]
                  }
                  strokeWidth={0}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  if (config.special === "latency") {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <ShadTooltip>
              <TooltipTrigger asChild>
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-500">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Information</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{config.tooltip}</p>
              </TooltipContent>
            </ShadTooltip>
          </TooltipProvider>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={config.data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid
                horizontal={true}
                vertical={false}
                stroke="hsl(var(--border))"
                strokeDasharray="4 4"
                strokeWidth={1}
                opacity={0.6}
              />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#888888", fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888888", fontSize: 12 }}
                width={60}
                tickFormatter={config.valueFormatter}
                ticks={config.id === "ttft" ? [35, 70, 105, 140] : [15, 30, 45, 60]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  fontWeight: "bold",
                  color: "var(--card-foreground)",
                }}
                formatter={(value: number, name: string) => [
                  <span
                    key={`${name}-value`}
                    style={{
                      color:
                        typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                          ? colors.dark[colorKeys[models.indexOf(name) % colorKeys.length]]
                          : colors.light[colorKeys[models.indexOf(name) % colorKeys.length]],
                    }}
                  >
                    {config.valueFormatter(value)}
                  </span>,
                  name,
                ]}
              />
              {models.map((model, index) => {
                const color =
                  typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                    ? colors.dark[colorKeys[index % colorKeys.length]]
                    : colors.light[colorKeys[index % colorKeys.length]];
                return (
                  <Area key={model} type="monotone" dataKey={model} stroke={color} strokeWidth={2} fill="transparent" />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  if (config.special === "bar") {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <ShadTooltip>
              <TooltipTrigger asChild>
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-500">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Information</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{config.tooltip}</p>
              </TooltipContent>
            </ShadTooltip>
          </TooltipProvider>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tokensPerModel} layout="vertical" margin={{ left: 16, right: 16, top: 0, bottom: 0 }}>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#888888", fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888888", fontSize: 12 }}
                width={60}
                tickFormatter={value => value.split(" ")[0]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  fontWeight: "bold",
                  color: "var(--card-foreground)",
                }}
                formatter={(value: number, name: string, props: any) => {
                  const model = tokensPerModel.find(m => m.name === props.payload.name);
                  return [
                    <span key={`${name}-value`} style={{ color: model?.color }}>
                      {value.toLocaleString()}
                    </span>,
                    "",
                  ];
                }}
                labelFormatter={(name: string) => name}
                separator=""
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {tokensPerModel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.6} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  return null;
}

export function NetworkCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      {chartConfigs.map(config => (
        <NetworkChartCard key={config.id} config={config} />
      ))}
    </div>
  );
}
