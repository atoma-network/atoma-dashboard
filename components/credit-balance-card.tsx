import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import api, { ALL_STACKS, BALANCE } from "@/lib/api";
import { loggedIn } from "@/lib/atoma";

export function CreditBalanceCard({ handleAddFunds }: { handleAddFunds: () => void }) {
  const [balance, setBalance] = useState("-");

  useEffect(() => {
    const updateBalance = async () => {
      if (!loggedIn()) {
        setBalance("-");
        return;
      }
      try {
        const balancePromise = api.get(BALANCE).catch(() => null);
        const allStacksPromise = api.get(ALL_STACKS).catch(() => null);
        const [balanceRes, allStacksRes] = await Promise.all([balancePromise, allStacksPromise]);
        let partialBalance = allStacksRes?.data.reduce(
          (acc: number, [stack]: any) =>
            acc + (stack.already_computed_units / stack.num_compute_units) * stack.price_per_one_million_compute_units,
          0
        );
        let balance = (balanceRes?.data + partialBalance) / 1000000;
        console.log("balance", balanceRes?.data);
        console.log("partialBalance", partialBalance);
        setBalance(isNaN(balance) ? "0" : balance.toFixed(2));
      } catch (error) {
        console.error("Failed to fetch balance", error);
      }
    };
    updateBalance();
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
        <Button
          className="w-full bg-purple-600 hover:bg-purple-700 text-base"
          disabled={!loggedIn()}
          onClick={handleAddFunds}
        >
          Add Funds
        </Button>
      </CardContent>
    </Card>
  );
}
