"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Area, AreaChart, Cell, Tooltip } from "recharts";
import { TooltipProvider, TooltipTrigger, TooltipContent, Tooltip as ShadTooltip } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const days = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"];

// Generate smooth curves that match the image
const generateSmoothData = (min: number, max: number, trend: "stable" | "decreasing" | "variable") => {
  let lastValue = (min + max) / 2;
  return days.map(day => {
    let change;
    switch (trend) {
      case "decreasing":
        change = Math.random() * (max - min) * 0.1 - (max - min) * 0.05;
        break;
      case "variable":
        change = Math.random() * (max - min) * 0.2 - (max - min) * 0.1;
        break;
      default:
        change = Math.random() * (max - min) * 0.15 - (max - min) * 0.075;
    }
    lastValue = Math.max(min, Math.min(max, lastValue + change));
    return {
      name: day,
      value: Math.round(lastValue),
    };
  });
};

const models = ["Model1", "Model2", "Model3", "Model4", "Model5"];
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

// Generate smooth stacked area data for requests per model
const requestsPerModel = days.map(day => {
  const baseValues = models.map(() => Math.floor(Math.random() * 5000 + 3000));
  return {
    name: day,
    ...models.reduce(
      (acc, model, index) => ({
        ...acc,
        [model]: baseValues[index],
      }),
      {}
    ),
  };
});

const tokensPerModel = [
  {
    name: "Llama",
    value: 5702,
    color:
      typeof window !== "undefined" && document.documentElement.classList.contains("dark")
        ? colors.dark.red
        : colors.light.red,
  },
  {
    name: "DeepSeek",
    value: 4200,
    color:
      typeof window !== "undefined" && document.documentElement.classList.contains("dark")
        ? colors.dark.yellow
        : colors.light.yellow,
  },
  {
    name: "Qwen",
    value: 3728,
    color:
      typeof window !== "undefined" && document.documentElement.classList.contains("dark")
        ? colors.dark.green
        : colors.light.green,
  },
  {
    name: "FLUXL",
    value: 2500,
    color:
      typeof window !== "undefined" && document.documentElement.classList.contains("dark")
        ? colors.dark.blue
        : colors.light.blue,
  },
  {
    name: "Mistral",
    value: 1800,
    color:
      typeof window !== "undefined" && document.documentElement.classList.contains("dark")
        ? colors.dark.purple
        : colors.light.purple,
  },
];

const chartConfigs = [
  {
    title: "Requests Per Model",
    special: "stacked",
    id: "requests-per-model",
    tooltip: "Requests processed across different models",
  },
  {
    title: "Tokens Per Model",
    special: "bar",
    id: "tokens-per-model",
    tooltip: "Tokens generated across models",
  },
];

function AreaChartCard({ config }: { config: (typeof chartConfigs)[0] }) {
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
            <AreaChart data={requestsPerModel} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#888888", fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#888888", fontSize: 12 }}
                tickFormatter={value => value.toLocaleString()}
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
                          ? Object.values(colors.dark)[models.indexOf(name)]
                          : Object.values(colors.light)[models.indexOf(name)],
                    }}
                  >
                    {value.toLocaleString()}
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
                      ? Object.values(colors.dark)[index]
                      : Object.values(colors.light)[index]
                  }
                  fill={
                    typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                      ? Object.values(colors.dark)[index]
                      : Object.values(colors.light)[index]
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
                //itemSeparator=""
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} style={{ opacity: 1 }}>
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

export function AreaCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      {chartConfigs.map(config => (
        <AreaChartCard key={config.id} config={config} />
      ))}
    </div>
  );
}
