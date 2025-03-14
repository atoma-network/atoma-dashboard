import { MetricsCards } from "@/components/analytics/metrics-cards"
import { NetworkCharts } from "@/components/network/network-charts"
import { ModelCharts } from "@/components/analytics/model-charts"
import { BackgroundGrid } from "@/components/background-grid"

export default function NetworkStatusPage() {
  return (
    <div className="relative min-h-screen w-full">
      <BackgroundGrid />
      {/* Content */}
      <div className="relative z-10">
        <div className="space-y-4 p-6">
          <MetricsCards />
          <NetworkCharts />
          <ModelCharts />
        </div>
      </div>
    </div>
  )
}

