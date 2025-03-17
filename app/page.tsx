"use client";

import { ResponsiveContainer, XAxis, YAxis, Area, AreaChart, Tooltip, CartesianGrid } from "recharts";
import { MetricsCards } from "@/components/analytics/metrics-cards";
import { NetworkCharts } from "@/components/network/network-charts";
import { BackgroundGrid } from "@/components/background-grid";
import { useEffect, useState } from "react";
import { getGraphData, getGraphs } from "@/lib/api";
import LoadingCircle from "@/components/LoadingCircle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider, TooltipTrigger, TooltipContent, Tooltip as ShadTooltip } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

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

function PanelData({
  data,
  timeFilter,
  tickFormatter,
}: {
  data: any;
  timeFilter: (date: Date) => boolean;
  tickFormatter: (value: string) => string;
}) {
  const valueFormatter = (value: number) => `${value}ms`;
  const graphData: Record<string, Record<string, string>> = {};
  let labels: Set<string> = new Set();
  Object.keys(data["results"]).forEach(ref => {
    data["results"][ref]["frames"].forEach((frame: any) => {
      const timeId = frame.schema.fields.findIndex((field: any) => field.type === "time");
      const schema = frame.schema.fields.map((field: any) =>
        field.type == "time" ? "time" : field?.config?.displayNameFromDS || field.name
      );
      labels = new Set([...labels, ...schema.filter((_: any, index: number) => index !== timeId)]);
      if (frame.data.values.length === 0) {
        return;
      }
      for (let i = 0; i < frame.data.values[0].length; i++) {
        const time = new Date(frame.data.values[timeId][i]).toLocaleString();
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
  const series = Object.keys(graphData)
    .sort()
    .map(time => {
      return {
        time,
        data: graphData[time],
      };
    });
  if (Object.keys(graphData).length === 0) {
    return <div className="flex justify-center items-center h-2/3">No data available</div>;
  }
  const labelsArray = Array.from(labels).sort();
  const wholeHourTicks = series.map(({ time }) => time).filter(timeStr => timeFilter(new Date(timeStr)));
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={series} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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
          width={60}
          tickFormatter={valueFormatter}
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
          formatter={(value: number, time: string) => [
            <div
              key={`${time}-value`}
              style={{
                color:
                  typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                    ? colors.dark[Object.keys(colors.dark)[labelsArray.indexOf(time)]]
                    : colors.lightText[Object.keys(colors.lightText)[labelsArray.indexOf(time)]],
              }}
            >
              {`${time}: ${valueFormatter(value)}`}
            </div>,
            null,
          ]}
        />
        {labelsArray.map((label, index) => {
          const color =
            typeof window !== "undefined" && document.documentElement.classList.contains("dark")
              ? colors.dark[Object.keys(colors.dark)[index]]
              : colors.light[Object.keys(colors.light)[index]];
          return (
            <Area
              key={index}
              name={label}
              type="monotone"
              dataKey={data => data.data[label] || 0}
              stroke={color}
              strokeWidth={2}
              fill="transparent"
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function Panel({
  title,
  description,
  data,
  timeFilter,
  tickFormatter,
}: {
  title: string;
  description: string;
  data: any;
  timeFilter: (date: Date) => boolean;
  tickFormatter: (value: string) => string;
}) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
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
        {data ? (
          <PanelData data={data.data} timeFilter={timeFilter} tickFormatter={tickFormatter} />
        ) : (
          <div className="flex  justify-center items-center">
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
  panels: { title: string; description: string; data: any; query: { from: string } }[];
}) {
  return (
    <>
      {panels.map(({ title, description, data, query }) => {
        const from: string = query["from"];
        const regex = /now-(\d+)([dmh])/;
        const match = from.match(regex);
        const range = match ? parseInt(match[1], 10) : null;
        const unit = match ? match[2] : null;
        const timeFilter = (timestamp: Date) => {
          if (!range || !unit) return true;
          const unixTimestamp = timestamp.getTime() / 1000;
          switch (unit) {
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
          if (!range || !unit) return new Date(value).toLocaleString();
          const date = new Date(value);
          switch (unit) {
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
            data={data}
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
    { title: string; panels: { title: string; description: string; query: any; data: any }[] }[] | null
  >(null);
  useEffect(() => {
    (async () => {
      let graphs = await getGraphs();
      console.log("graphs", graphs);
      setGraphs(
        graphs.data.map(([title, dashboard]) => ({
          title: title,
          panels: dashboard.map(([panelTitle, panelDescription, panelData]) => ({
            title: panelTitle,
            description: panelDescription,
            query: panelData,
            data: null,
          })),
        }))
      );
      graphs.data.forEach(([, dashboard], dashboardIndex) => {
        dashboard.forEach(([, , panelQuery], panelIndex) => {
          getGraphData(panelQuery).then(panelData => {
            console.log("panel data", panelData);
            setGraphs(graphs => {
              const updatedGraphs = [...graphs!];
              updatedGraphs[dashboardIndex].panels[panelIndex].data = panelData;
              return updatedGraphs;
            });
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
          {graphs ? (
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
