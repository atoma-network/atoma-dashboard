import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function BillingSummaryCard() {
  return (
    <Card className="h-[280px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-purple-600">Billing Summary</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Total Usage</div>
            <div className="text-lg font-semibold">0 tokens</div>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Total API Calls</div>
            <div className="text-lg font-semibold">0</div>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Billing Period</div>
            <div className="text-lg font-semibold text-foreground">March 1 - March 31</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
