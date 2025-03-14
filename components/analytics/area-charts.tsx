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
    blue: "#BAE6FD",
    green: "#D1FAE5",
    yellow: "#FFF3C9",
    red: "#FFC9C9",
    purple: "#E9D5FF", // Reverted back to purple
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
    purple: "#581c87", // Reverted back to dark purple
  },
} as const;

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
    colorLight: colors.light.red,
    colorDark: colors.dark.red,
  },
  {
    name: "DeepSeek",
    value: 4200,
    colorLight: colors.light.yellow,
    colorDark: colors.dark.yellow,
  },
  {
    name: "Qwen",
    value: 3728,
    colorLight: colors.light.green,
    colorDark: colors.dark.green,
  },
  {
    name: "FLUXL",
    value: 2500,
    colorLight: colors.light.blue,
    colorDark: colors.dark.blue,
  },
  {
    name: "Mistral",
    value: 1800,
    colorLight: colors.light.purple,
    colorDark: colors.dark.purple,
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
                <p className="text-foreground/90 dark:text-foreground/90 font-medium">{config.tooltip}</p>
              </TooltipContent>
            </ShadTooltip>
          </TooltipProvider>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={requestsPerModel} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#888888", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#888888", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  fontWeight: "bold",
                  color: "var(--card-foreground)",
                }}
                formatter={(value: number, name: string) => {
                  const modelIndex = models.indexOf(name);
                  if (modelIndex === -1) return [null, null];
                  const isDarkMode =
                    typeof window !== "undefined" && document.documentElement.classList.contains("dark");
                  const colorKey = Object.keys(isDarkMode ? colors.dark : colors.lightText)[modelIndex];
                  return [
                    <div
                      key={`${name}-value`}
                      style={{
                        color: (isDarkMode ? colors.dark : colors.lightText)[colorKey as keyof typeof colors.dark],
                      }}
                    >
                      {`${name}: ${value.toLocaleString()}`}
                    </div>,
                    null,
                  ];
                }}
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
                formatter={(value: number, name: string, props: any) => {
                  const model = tokensPerModel.find(m => m.name === props.payload.name);
                  if (!model) return [null, null]; // Avoid issues if model is not found

                  const colorIndex = tokensPerModel.indexOf(model);
                  const isDarkMode =
                    typeof window !== "undefined" && document.documentElement.classList.contains("dark");
                  const themeColors = isDarkMode ? colors.dark : colors.lightText;
                  const colorKeys = Object.keys(themeColors) as Array<keyof typeof themeColors>;
                  const colorKey = colorKeys[colorIndex] ?? colorKeys[0]; // Default to first key if index is invalid

                  return [
                    <div key={`${name}-value`} style={{ color: themeColors[colorKey] }}>
                      {`${value.toLocaleString()} Tokens`}
                    </div>,
                    null,
                  ];
                }}
                labelFormatter={(name: string) => name}
                separator=""
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {tokensPerModel.map((entry, index) => {
                  const colorKey = Object.keys(colors.light)[index];
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                          ? colors.dark[colorKey as keyof typeof colors.dark] || colors.dark
                          : colors.light[colorKey as keyof typeof colors.light] || colors.light
                      }
                      fillOpacity={0.6}
                    />
                  );
                })}
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
