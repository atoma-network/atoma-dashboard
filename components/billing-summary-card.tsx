"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function BillingSummaryCard() {
  // Use state to store formatted dates to avoid hydration mismatch
  const [billingPeriod, setBillingPeriod] = useState({
    start: "",
    end: "",
  });

  // Calculate dates after component mounts on client
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    setBillingPeriod({
      start: startOfMonth.toLocaleDateString(),
      end: endOfMonth.toLocaleDateString(),
    });
  }, []);

  return (
    <Card className="h-[280px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-primary">Billing Summary</CardTitle>
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
            <div className="text-lg font-semibold text-foreground">
              {billingPeriod.start ? `${billingPeriod.start} - ${billingPeriod.end}` : "Loading..."}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
