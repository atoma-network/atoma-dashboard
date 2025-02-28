import { CreditBalanceCard } from "@/components/credit-balance-card"
import { BillingSummaryCard } from "@/components/billing-summary-card"
import { ApiKeyCard } from "@/components/api-key-card"
import { ApiDocumentation } from "@/components/api-documentation"
import { BackgroundGrid } from "@/components/background-grid"

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen w-full">
      <BackgroundGrid />
      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto p-6 space-y-8">
          {/* Top Section - 3 Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CreditBalanceCard />
            <BillingSummaryCard />
            <ApiDocumentation />
          </div>

          {/* Bottom Section - Full Width */}
          <div className="w-full">
            <ApiKeyCard />
          </div>
        </div>
      </div>
    </div>
  )
}

