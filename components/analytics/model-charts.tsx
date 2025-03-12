"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from "recharts"
import { TooltipProvider, Tooltip as ShadTooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

const days = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"]

// Generate smooth data for requests processed and tokens processed
const requestsData = days.map((day) => ({
  name: day,
  value: Math.floor(Math.random() * 30000 + 15000),
}))

const tokensData = days.map((day) => ({
  name: day,
  value: Math.floor(Math.random() * 40000 + 20000),
}))

export function ModelCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Requests Processed</CardTitle>
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
                <p>Total requests processed across the network</p>
              </TooltipContent>
            </ShadTooltip>
          </TooltipProvider>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={requestsData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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
                formatter={(value: number) => [
                  <div key="value" style={{ 
                    color: typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                      ? "#1e3a8a" // dark blue
                      : "#2563eb" // lighter blue but still readable
                  }}>
                    {`${value.toLocaleString()} Requests`}
                  </div>,
                  null
                ]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? "#1e3a8a" : "#BAE6FD"}
                fill={typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? "#1e3a8a" : "#BAE6FD"}
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Tokens Processed</CardTitle>
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
                <p>Total tokens processed across the network</p>
              </TooltipContent>
            </ShadTooltip>
          </TooltipProvider>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={tokensData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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
                formatter={(value: number) => [
                  <div key="value" style={{ 
                    color: typeof window !== "undefined" && document.documentElement.classList.contains("dark")
                      ? "#7f1d1d" // dark red
                      : "#dc2626" // lighter red but still readable
                  }}>
                    {`${value.toLocaleString()} Tokens`}
                  </div>,
                  null
                ]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? "#7f1d1d" : "#FFC9C9"}
                fill={typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? "#7f1d1d" : "#FFC9C9"}
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

