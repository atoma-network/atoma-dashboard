import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function CreditBalanceCard() {
  return (
    <Card className="h-[280px] flex flex-col" hideInfo>
      <CardHeader>
        <CardTitle className="text-purple-600">Credit Balance</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="text-5xl font-bold text-foreground">$0.00</div>
          <div className="text-sm text-muted-foreground mt-2">Available Credits</div>
        </div>
        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-base">Add Funds</Button>
      </CardContent>
    </Card>
  )
}

