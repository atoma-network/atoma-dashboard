"use client"

import { useEffect, useState } from "react";
import { AreaCharts } from "@/components/analytics/area-charts";
import { ModelCharts } from "@/components/analytics/model-charts";
import { UsageHistory } from "@/components/analytics/usage-history";
import { BackgroundGrid } from "@/components/background-grid";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { listApiKeys, Token } from "@/lib/atoma";

const timeFrames = [
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

const apiKeys = [
  { value: "key1", label: "API Key 1 - Production" },
  { value: "key2", label: "API Key 2 - Development" },
  { value: "key3", label: "API Key 3 - Testing" },
];

export default function AnalyticsPage() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("24h");
  const [selectedApiKey, setSelectedApiKey] = useState("key1");
  const [apiKeys, setApiKeys] = useState<Token[]>([]);

  useEffect(() => {
    (async () => {
      const keys = await listApiKeys();
      setApiKeys(keys);
    })();
  }, []);

  return (
    <div className="relative min-h-screen w-full">
      <BackgroundGrid />
      {/* Content */}
      <div className="relative z-10">
        <div className="space-y-6 p-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold text-primary">Account Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Track your API usage, performance metrics, and model distribution across your applications.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Select value={selectedApiKey} onValueChange={setSelectedApiKey}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select API Key" />
              </SelectTrigger>
              <SelectContent>
                {apiKeys.map((key) => (
                  <SelectItem key={key.id} value={`${key.id}`}>
                    {key.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ToggleGroup
              type="single"
              value={selectedTimeFrame}
              onValueChange={(value) => {
                if (value) setSelectedTimeFrame(value);
              }}
              className="justify-start"
            >
              {timeFrames.map((timeFrame) => (
                <ToggleGroupItem
                  key={timeFrame.value}
                  value={timeFrame.value}
                  aria-label={`Toggle ${timeFrame.label}`}
                  className="px-3"
                >
                  {timeFrame.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <AreaCharts />
          <ModelCharts />
          <UsageHistory />
        </div>
      </div>
    </div>
  );
}

