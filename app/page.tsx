"use client";

import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { MetricsCards } from "@/components/analytics/metrics-cards";
import { NetworkCharts } from "@/components/network/network-charts";
import { BackgroundGrid } from "@/components/background-grid";
import { useEffect, useState } from "react";
import { getGraphData, getGraphs } from "@/lib/api";
import LoadingCircle from "@/components/LoadingCircle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider, TooltipTrigger, TooltipContent, Tooltip as ShadTooltip } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { formatNumber } from "@/lib/utils";

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
};

const readableModelName = (modelName: string) => {
  switch (modelName) {
    case "Qwen/QwQ-32B":
      return "QWQ 32B";
    case "neuralmagic/DeepSeek-R1-Distill-Llama-70B-FP8-dynamic":
      return "DeepSeek: R1 Distill Llama 70B";
    case "neuralmagic/Qwen2-72B-Instruct-FP8":
      return "Qwen2 72B";
    case "meta-llama/Llama-3.1-8B-Instruct":
      return "Llama 3.1 8B";
    default:
      const match = modelName?.match(/\/([^\/]*\d+B)/);
      if (match) {
        return match[1].replace(/-/g, " ");
      }
      return modelName;
  }
};

function AreaPanel({
  series,
  tickFormatter,
  timeFilter,
  valueFormatter,
  labelsArray,
  fillOpacity,
  stackingGroup,
}: {
  series: {
    time: string;
    data: Record<string, string>;
  }[];
  tickFormatter: (value: string) => string;
  timeFilter: (date: Date) => boolean;
  valueFormatter: (value: number) => string;
  labelsArray: string[];
  fillOpacity?: number;
  stackingGroup?: string;
}) {
  const wholeHourTicks = series.map(({ time }) => time).filter(timeStr => timeFilter(new Date(timeStr)));
  const percentToHex = (percent: number): string => {
    const clampedPercent = Math.max(0, Math.min(100, percent));
    const decimalValue = Math.round((clampedPercent / 100) * 255);
    return decimalValue.toString(16).padStart(2, "0").toUpperCase();
  };
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={series} margin={{ top: 0, right: 0, bottom: 0 }}>
        <CartesianGrid
          horizontal={true}
          vertical={false}
          stroke="hsl(var(--border))"
          strokeDasharray="4 4"
          strokeWidth={1}
          opacity={0.6}
        />
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#888888", fontSize: 12 }}
          tickFormatter={tickFormatter}
          ticks={wholeHourTicks}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#888888", fontSize: 12 }}
          width={80}
          tickFormatter={valueFormatter}
        />
        <Tooltip
          content={props => {
            const { payload, label } = props;
            const combinedPayload = payload?.map((entry, index) => ({
              ...entry,
              color:
                typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                  ? Object.values(colors.dark)[index]
                  : Object.values(colors.lightText)[index],
            }));
            if (stackingGroup) {
              combinedPayload?.reverse();
            } else {
              combinedPayload?.sort((a, b) => Number(b.value) - Number(a.value));
            }
            const formattedLabel = new Date(label).toLocaleDateString();
            return (
              <div
                style={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  fontWeight: "bold",
                  color: "var(--card-foreground)",
                  padding: "8px",
                }}
              >
                <div>{formattedLabel}</div>

                {combinedPayload?.map((entry, index) => {
                  return (
                    <div key={index}>
                      <span
                        style={{ color: entry.color }}
                      >{`${readableModelName(entry.name!.toString())}: ${valueFormatter(Number(entry.value))}`}</span>
                    </div>
                  );
                })}
              </div>
            );
          }}
        />
        {labelsArray.map((label, index) => {
          const color =
            typeof window !== "undefined" && document.documentElement.classList.contains("dark")
              ? Object.values(colors.dark)[index]
              : Object.values(colors.light)[index];
          return (
            <Area
              key={index}
              name={label}
              type="monotone"
              dataKey={data => data.data[label] || 0}
              stroke={color}
              strokeWidth={2}
              fill={color}
              fillOpacity={fillOpacity ? fillOpacity / 100 : 0}
              stackId={stackingGroup}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function BarGaugePanel({
  series,
  tickFormatter,
  timeFilter,
  valueFormatter,
  labelsArray,
  fillOpacity,
  stackingGroup,
}: {
  series: {
    time: string;
    data: Record<string, string>;
  }[];
  tickFormatter: (value: string) => string;
  timeFilter: (date: Date) => boolean;
  valueFormatter: (value: number) => string;
  labelsArray: string[];
  fillOpacity?: number;
  stackingGroup?: string;
}) {
  const barData = labelsArray.map(label => ({
    name: label,
    Tokens: Number(series[series.length - 1].data[label] || 0),
  }));
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
        <CartesianGrid
          horizontal={true}
          vertical={false}
          stroke="hsl(var(--border))"
          strokeDasharray="4 4"
          strokeWidth={1}
          opacity={0.6}
        />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#888888", fontSize: 12 }}
          tickFormatter={valueFormatter}
        />
        <YAxis
          dataKey="name"
          type="category"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#888888", fontSize: 12 }}
          tickFormatter={readableModelName}
        />
        <Tooltip
          content={props => {
            const { payload, label } = props;
            return (
              <div
                style={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  fontWeight: "bold",
                  color: "var(--card-foreground)",
                  padding: "8px",
                }}
              >
                <div>{readableModelName(label)}</div>
                <div
                  key={`${payload?.[0]?.name}-value`}
                  style={{
                    color:
                      typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                        ? Object.values(colors.dark)[labelsArray.indexOf(label)]
                        : Object.values(colors.lightText)[labelsArray.indexOf(label)],
                  }}
                >
                  {`${payload?.[0]?.name}: ${valueFormatter(Number(payload?.[0]?.value))}`}
                </div>
              </div>
            );
          }}
        />
        <Bar dataKey="Tokens" radius={[0, 4, 4, 0]} barSize={20}>
          {labelsArray.map((entry, index) => {
            const color =
              typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                ? Object.values(colors.dark)[index]
                : Object.values(colors.light)[index];
            return <Cell key={`cell-${index}`} fill={color} fillOpacity={0.6} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function PanelData({
  data,
  fieldConfig,
  timeFilter,
  tickFormatter,
  type,
}: {
  data: any;
  fieldConfig: any;
  timeFilter: (date: Date) => boolean;
  tickFormatter: (value: string) => string;
  type: string;
}) {
  const unit = fieldConfig?.defaults?.unit;
  const valueFormatter = (value: number) => (value ? `${formatNumber(value)}${unit ? ` ${unit}` : ""}` : "");
  const graphData: Record<number, Record<string, string>> = {};
  const stackingGroup =
    fieldConfig?.defaults?.custom?.stacking?.mode != "none" && fieldConfig?.defaults?.custom?.stacking?.group;
  const fillOpacity = fieldConfig?.defaults?.custom?.fillOpacity;
  let labels: Set<string> = new Set();
  Object.keys(data["results"]).forEach(ref => {
    data["results"][ref]["frames"].forEach((frame: any) => {
      const timeId = frame.schema.fields.findIndex((field: any) => field.type === "time");
      const schema = frame.schema.fields.map((field: any) => {
        return field.type == "time"
          ? "time"
          : field?.config?.displayNameFromDS || Object.values(field?.labels)?.[0] || field.name;
      });
      labels = new Set([...labels, ...schema.filter((_: any, index: number) => index !== timeId)]);
      if (frame.data.values.length === 0) {
        return;
      }
      for (let i = 0; i < frame.data.values[0].length; i++) {
        const time = new Date(frame.data.values[timeId][i]).getTime();
        if (!(time in graphData)) {
          graphData[time] = {};
        }
        for (let j = 0; j < frame.data.values.length; ++j) {
          if (j == timeId) {
            continue;
          }
          graphData[time][schema[j]] = frame.data.values[j][i];
        }
      }
    });
  });
  const series = Object.entries(graphData)
    .sort()
    .map(([time, value]) => {
      return {
        time: new Date(Number(time)).toLocaleString(),
        data: value,
      };
    });
  if (Object.keys(graphData).length === 0) {
    return <div className="flex justify-center items-center h-2/3">No data available</div>;
  }

  const labelsArray = Array.from(labels).sort();
  switch (type) {
    case "timeseries":
      return (
        <AreaPanel
          series={series}
          tickFormatter={tickFormatter}
          timeFilter={timeFilter}
          valueFormatter={valueFormatter}
          labelsArray={labelsArray}
          fillOpacity={fillOpacity}
          stackingGroup={stackingGroup}
        />
      );
    case "bargauge":
      return (
        <BarGaugePanel
          series={series}
          tickFormatter={tickFormatter}
          timeFilter={timeFilter}
          valueFormatter={valueFormatter}
          labelsArray={labelsArray}
          fillOpacity={fillOpacity}
          stackingGroup={stackingGroup}
        />
      );
    default:
      return null;
  }
}

function Panel({
  title,
  description,
  fieldConfig,
  type,
  data,
  timeFilter,
  tickFormatter,
}: {
  title: string;
  description?: string;
  fieldConfig: any;
  type: string;
  data: any;
  timeFilter: (date: Date) => boolean;
  tickFormatter: (value: string) => string;
}) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        {description && (
          <TooltipProvider>
            <ShadTooltip>
              <TooltipTrigger asChild>
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-500">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Information</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-foreground/90 dark:text-foreground/90 font-medium">{description}</p>
              </TooltipContent>
            </ShadTooltip>
          </TooltipProvider>
        )}
        {data ? (
          <PanelData
            data={data.data}
            type={type}
            fieldConfig={fieldConfig}
            timeFilter={timeFilter}
            tickFormatter={tickFormatter}
          />
        ) : (
          <div className="flex justify-center items-center">
            <LoadingCircle isSpinning={true} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Dashboard({
  title,
  panels,
}: {
  title: string;
  panels: { title: string; description?: string; fieldConfig: any; data: any; type: string; query: { from: string } }[];
}) {
  return (
    <>
      {panels.map(({ title, description, fieldConfig, data, query, type }) => {
        const from: string = query["from"];
        const regex = /now-(\d+)([dmh])/;
        const match = from.match(regex);
        const range = match ? parseInt(match[1], 10) : null;
        const timeUnit = match ? match[2] : null;
        const timeFilter = (timestamp: Date) => {
          if (!range || !timeUnit) return true;
          const unixTimestamp = timestamp.getTime() / 1000;
          switch (timeUnit) {
            case "d":
              return unixTimestamp % (60 * 60 * 24) === 0;
            case "h":
              return unixTimestamp % (60 * 60) === 0;
            case "m":
              return unixTimestamp % 60 === 0;
            default:
              return true;
          }
        };
        const tickFormatter = (value: string) => {
          if (!range || !timeUnit) return new Date(value).toLocaleString();
          const date = new Date(value);
          switch (timeUnit) {
            case "d":
              return date.toLocaleDateString(undefined, { weekday: "short" });
            default:
              return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
          }
        };
        return (
          <Panel
            key={title}
            title={title}
            description={description}
            fieldConfig={fieldConfig}
            data={data}
            type={type}
            timeFilter={timeFilter}
            tickFormatter={tickFormatter}
          />
        );
      })}
    </>
  );
}

export default function NetworkStatusPage() {
  const [graphs, setGraphs] = useState<
    | {
        title: string;
        panels: { title: string; description?: string; fieldConfig: any; query: any; data: any; type: string }[];
      }[]
    | null
  >(null);
  useEffect(() => {
    (async () => {
      let graphs = await getGraphs();
      setGraphs(
        graphs.data.map(({ title, panels }) => ({
          title: title,
          panels: panels.map(({ title, description, field_config, query, type }) => ({
            title,
            description,
            query,
            fieldConfig: field_config,
            data: null,
            type,
          })),
        }))
      );
      graphs.data.forEach(({ title, panels }, dashboardIndex) => {
        panels.forEach(async ({ query, interval }, panelIndex) => {
          query.queries.forEach((q: any) => {
            q.interval = interval;
          });
          let panelData = await getGraphData(query);
          setGraphs(graphs => {
            const updatedGraphs = [...graphs!];
            updatedGraphs[dashboardIndex].panels[panelIndex].data = panelData;
            return updatedGraphs;
          });
        });
      });
    })();
  }, []);
  return (
    <div className="relative min-h-screen w-full">
      <BackgroundGrid />
      {/* Content */}
      <div className="relative z-10">
        <div className="space-y-4 p-6">
          <MetricsCards />
          {graphs && graphs.every(graph => graph.panels.every(panel => panel.data)) ? (
            <div className="grid md:grid-cols-2 gap-6">
              {graphs.map(({ title, panels }) => (
                <Dashboard key={title} title={title} panels={panels} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center pt-5">
              <LoadingCircle isSpinning={true} size="lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
