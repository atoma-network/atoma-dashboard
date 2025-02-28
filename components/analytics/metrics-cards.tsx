import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Network, Activity, Box, Cpu, Clock, ArrowUpRight } from "lucide-react"

const metrics = [
  {
    title: "Total Nodes",
    value: "30",
    description: "Across all networks",
    icon: Network,
    color: "text-purple-500",
    textColor: "text-purple-500",
  },
  {
    title: "Nodes Online",
    value: "2",
    description: "Currently active",
    icon: Activity,
    color: "text-purple-500",
    textColor: "text-purple-500",
  },
  {
    title: "Models",
    value: "4",
    description: "Different models available",
    icon: Box,
    color: "text-purple-500",
    textColor: "text-purple-500",
  },
  {
    title: "Tokens",
    value: "4.7M",
    description: "Processed on Atoma",
    icon: Cpu,
    color: "text-purple-500",
    textColor: "text-purple-500",
  },
  {
    title: "Performance",
    value: "0.27ms",
    description: "Past week",
    icon: Clock,
    color: "text-purple-500",
    textColor: "text-purple-500",
  },
  {
    title: "Throughput",
    value: "4.20",
    description: "Requests/minute",
    icon: ArrowUpRight,
    color: "text-purple-500",
    textColor: "text-purple-500",
  },
]

export function MetricsCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6">
      {metrics.map((metric) => (
        <Card key={metric.title} className="overflow-hidden" hideInfo>
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
  )
}

