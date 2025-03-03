"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, Activity, Box, Cpu, Clock, ArrowUpRight } from "lucide-react";
import React from "react";
import api, {
  COMPUTE_UNITS_PROCESSED_168,
  GET_NODES_DISTRIBUTION,
  LATENCY_168,
  SUBSCRIPTIONS,
  TASKS,
  type ModelModality,
} from "@/lib/api";
import { formatNumber } from "@/lib/utils";

export function MetricsCards() {
  const [metricsData, setMetricsData] = React.useState({
    totalNodes: "-",
    nodesOnline: "-",
    models: "-",
    tokens: "-",
    latency: "-",
    throughPut: "-",
  });

  React.useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const tasksPromise = api.get(TASKS).catch(() => null);
        const nodesPromise = api.get(GET_NODES_DISTRIBUTION).catch(() => null);
        const latencyPromise = api.get(LATENCY_168).catch(() => null);
        const subscriptionsPromise = api.get(SUBSCRIPTIONS).catch(() => null);
        const computeUnitsPromise = await api.get(COMPUTE_UNITS_PROCESSED_168).catch(() => null);

        const [tasksRes, nodesRes, latencyRes, subscriptionsRes, computeUnitsRes] = await Promise.all([
          tasksPromise,
          nodesPromise,
          latencyPromise,
          subscriptionsPromise,
          computeUnitsPromise,
        ]);

        // Total nodes
        const totalNodes =
          nodesRes?.data?.reduce((sum: number, node: { count: number }) => sum + (+node.count || 0), 0) || 0;

        // Nodes online
        const nodesOnline = new Set<string>(
          subscriptionsRes?.data
            ?.filter(({ valid }: { valid: boolean }) => valid)
            .map(({ node_small_id }: { node_small_id: number }) => node_small_id)
        ).size;

        // Models
        const modelCount = new Set<string>(
          tasksRes?.data
            .filter(
              (task: [{ model_name: string; is_deprecated: boolean }, ModelModality[]]) =>
                task[0].model_name && !task[0].is_deprecated && task[1].length !== 0
            )
            .map((task: { model_name: string }[]) => task[0].model_name)
        ).size;

        // Tokens
        const totalUnits =
          computeUnitsRes?.data.reduce((sum: number, data: { amount: number }) => sum + data.amount, 0) || 0;

        // Performance
        const latency = latencyRes?.data
          ? latencyRes.data.reduce(
              (acc: any, item: any) => {
                acc.totalLatency += item.latency;
                acc.totalRequests += item.requests;
                return acc;
              },
              { totalLatency: 0, totalRequests: 0 }
            )
          : null;

        const averageLatency = latency?.totalLatency / latency?.totalRequests;

        // Throughput
        const averageThroughPut = latency?.totalRequests / 168;
        setMetricsData((prevData) => ({
          totalNodes: formatNumber(totalNodes),
          nodesOnline: formatNumber(nodesOnline),
          models: formatNumber(modelCount),
          tokens: formatNumber(totalUnits),
          latency: `${isFinite(averageLatency) ? averageLatency.toFixed(2).toString() : "-"}ms`,
          throughPut: averageThroughPut.toFixed(2).toString(),
        }));
      } catch (err) {
        console.error("Failed to fetch metrics", err);
      }
    };

    fetchMetrics();
  }, []);

  const metrics = [
    {
      title: "Total Nodes",
      value: metricsData.totalNodes,
      description: "Across all networks",
      icon: Network,
      color: "text-purple-500",
      textColor: "text-purple-500",
    },
    {
      title: "Nodes Online",
      value: metricsData.nodesOnline,
      description: "Currently active",
      icon: Activity,
      color: "text-purple-500",
      textColor: "text-purple-500",
    },
    {
      title: "Models",
      value: metricsData.models,
      description: "Different models available",
      icon: Box,
      color: "text-purple-500",
      textColor: "text-purple-500",
    },
    {
      title: "Tokens",
      value: metricsData.tokens,
      description: "Processed on Atoma",
      icon: Cpu,
      color: "text-purple-500",
      textColor: "text-purple-500",
    },
    {
      title: "Performance",
      value: metricsData.latency,
      description: "Past week",
      icon: Clock,
      color: "text-purple-500",
      textColor: "text-purple-500",
    },
    {
      title: "Throughput",
      value: metricsData.throughPut,
      description: "Requests/hour",
      icon: ArrowUpRight,
      color: "text-purple-500",
      textColor: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
      {metrics.map((metric) => (
        <Card key={metric.title} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metric.textColor}`}>{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
