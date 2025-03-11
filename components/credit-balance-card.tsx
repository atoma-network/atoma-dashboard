import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getAllStacks, getBalance } from "@/lib/api";
import { useSettings } from "@/contexts/settings-context";

export function CreditBalanceCard({ handleAddFunds }: { handleAddFunds: () => void }) {
  const [balance, setBalance] = useState("-");
  const [loggedIn, setLoggedIn] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    const updateBalance = async () => {
      setLoggedIn(settings.loggedIn);
      if (!settings.loggedIn) {
        setBalance("-");
        return;
      }
      try {
        const balancePromise = getBalance();
        const allStacksPromise = getAllStacks();
        const [balanceRes, allStacksRes] = await Promise.all([balancePromise, allStacksPromise]);
        let partialBalance = allStacksRes?.data.reduce(
          (acc: number, [stack]: any) =>
            acc + (stack.already_computed_units / stack.num_compute_units) * stack.price_per_one_million_compute_units,
          0
        );
        let balance = (balanceRes?.data + partialBalance) / 1000000;
        setBalance(isNaN(balance) ? "0" : balance.toFixed(2));
      } catch (error) {
        console.error("Failed to fetch balance", error);
      }
    };
    updateBalance();
  }, [settings.loggedIn]);
  return (
    <Card className="h-[280px] flex flex-col">
      <CardHeader>
        <CardTitle className="bg-primary-foreground dark:bg-darkMode">Credit Balance</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="text-5xl font-bold text-foreground">${balance}</div>
          <div className="text-sm text-muted-foreground mt-2">Available Credits</div>
        </div>
        <Button
          className="w-full bg-primary hover:bg-secondary-foreground text-base"
          disabled={!loggedIn}
          onClick={handleAddFunds}
        >
          Add Funds
        </Button>
      </CardContent>
    </Card>
  );
}
