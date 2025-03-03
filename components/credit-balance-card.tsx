import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import api, { ALL_STACKS, BALANCE } from "@/lib/api";

export function CreditBalanceCard() {
  const [balance, setBalance] = useState("-");
  useEffect(() => {
    (async () => {
      try {
        const balancePromise = api.get(BALANCE).catch(() => null);
        const allStacksPromise = api.get(ALL_STACKS).catch(() => null);
        const [balanceRes, allStacksRes] = await Promise.all([balancePromise, allStacksPromise]);
        let partialBalance = allStacksRes?.data.reduce(
          (acc: number, [stack]: any) =>
            acc + (stack.already_computed_units / stack.num_compute_units) * stack.price_per_one_million_compute_units,
          0
        );
        setBalance(((balanceRes?.data + partialBalance) / 1000000).toFixed(2));
      } catch (error) {
        console.error("Failed to fetch balance", error);
      }
    })();
  }, []);
  return (
    <Card className="h-[280px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-purple-600">Credit Balance</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="text-5xl font-bold text-foreground">${balance}</div>
          <div className="text-sm text-muted-foreground mt-2">Available Credits</div>
        </div>
        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-base">Add Funds</Button>
      </CardContent>
    </Card>
  );
}
