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

// Colors for different chart types
const colors = {
  light: {
    blue: "#BAE6FD",
    green: "#D1FAE5",
    yellow: "#FFF3C9",
    red: "#FFC9C9",
    purple: "#E9D5FF",
  },
  lightText: {
    // Add this new object for tooltip text colors
    blue: "#2563eb",
    green: "#059669",
    yellow: "#b45309",
    red: "#dc2626",
    purple: "#7c3aed",
  },
  dark: {
    blue: "#1e3a8a",
    green: "#064e3b",
    yellow: "#713f12",
    red: "#7f1d1d",
    purple: "#581c87",
  },
  cursor: {
    // Add cursor colors
    light: "#d97706", // Darker pale orange
    dark: "#d97706",  // Same darker pale orange for dark mode
  }
};

// Generate consistent data for each model
const generateModelData = (baseRange: [number, number], variance: number) => {
  const baseValue = baseRange[0] + Math.random() * (baseRange[1] - baseRange[0]);
  return days.map(() => {
    return Math.round(baseValue + (Math.random() - 0.5) * variance);
  });
};

// Generate data for requests
const requestsPerModel = days.map((day, dayIndex) => {
  const data: Record<string, any> = { name: day };
  models.forEach((model, index) => {
    const modelData = generateModelData([3000, 5000], 1000);
    data[model] = modelData[dayIndex];
  });
  return data;
});

// Generate data for TTFT and ITL with separate model lines
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

// Different base ranges for each model to show variation
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
  colorLight: colors.light[Object.keys(colors.light)[index]],
  colorDark: colors.dark[Object.keys(colors.dark)[index]],
}));

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
                <p className="text-foreground/90 dark:text-foreground/90 font-medium">{config.tooltip}</p>
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
                  fontWeight: "bold",
                  color: "var(--card-foreground)",
                }}
                cursor={{ stroke: typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? colors.cursor.dark : colors.cursor.light, strokeWidth: 1 }}
                formatter={(value: number, name: string) => [
                  <div
                    key={`${name}-value`}
                    style={{
                      color:
                        typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                          ? colors.dark[Object.keys(colors.dark)[models.indexOf(name)]]
                          : colors.lightText[Object.keys(colors.lightText)[models.indexOf(name)]],
                    }}
                  >
                    {`${name}: ${config.valueFormatter(value)}`}
                  </div>,
                  null,
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
                      ? colors.dark[Object.keys(colors.dark)[index]]
                      : colors.light[Object.keys(colors.light)[index]]
                  }
                  fill={
                    typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                      ? colors.dark[Object.keys(colors.dark)[index]]
                      : colors.light[Object.keys(colors.light)[index]]
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
                <p className="text-foreground/90 dark:text-foreground/90 font-medium">{config.tooltip}</p>
              </TooltipContent>
            </ShadTooltip>
          </TooltipProvider>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={config.data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid
                horizontal={true}
                vertical={false}
                stroke="hsl(var(--border))"
                strokeDasharray="2 2"
                strokeWidth={0.5}
                opacity={0.2}
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
                cursor={{ stroke: typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? colors.cursor.dark : colors.cursor.light, strokeWidth: 1 }}
                formatter={(value: number, name: string) => [
                  <div
                    key={`${name}-value`}
                    style={{
                      color:
                        typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                          ? colors.dark[Object.keys(colors.dark)[models.indexOf(name)]]
                          : colors.lightText[Object.keys(colors.lightText)[models.indexOf(name)]],
                    }}
                  >
                    {`${name}: ${config.valueFormatter(value)}`}
                  </div>,
                  null,
                ]}
              />
              {models.map((model, index) => {
                const color =
                  typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                    ? colors.dark[Object.keys(colors.dark)[index]]
                    : colors.light[Object.keys(colors.light)[index]];
                return (
                  <Area key={model} type="monotone" dataKey={model} stroke={color} strokeWidth={2} fill="none" />
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
                <p className="text-foreground/90 dark:text-foreground/90 font-medium">{config.tooltip}</p>
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
                cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                formatter={(value: number, name: string, props: any) => {
                  const model = tokensPerModel.find(m => m.name === props.payload.name);
                  const colorIndex = tokensPerModel.indexOf(model as any);
                  return [
                    <div
                      key={`${name}-value`}
                      style={{
                        color: (() => {
                          const isDarkMode =
                            typeof window !== "undefined" && document.documentElement.classList.contains("dark");
                          const themeColors = isDarkMode ? colors.dark : colors.lightText;

                          const colorKeys = Object.keys(themeColors) as Array<keyof typeof themeColors>;
                          const safeIndex = Math.max(0, Math.min(colorIndex, colorKeys.length - 1)); // Ensure within bounds
                          const colorKey = colorKeys[safeIndex];

                          return themeColors[colorKey]; // Safe color retrieval
                        })(),
                      }}
                    >
                      {`${value.toLocaleString()} Tokens`}
                    </div>,

                    null,
                  ];
                }}
                labelFormatter={(name: string) => name}
                separator=""
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {tokensPerModel.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                        ? entry.colorDark
                        : entry.colorLight
                    }
                    fillOpacity={0.6}
                  />
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
