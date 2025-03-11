"use client";

import { CreditBalanceCard } from "@/components/credit-balance-card";
import { BillingSummaryCard } from "@/components/billing-summary-card";
import { ApiKeyCard } from "@/components/api-key-card";
import { ApiDocumentation } from "@/components/api-documentation";
import { BackgroundGrid } from "@/components/background-grid";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  ConnectModal,
  createNetworkConfig,
  SuiClientProvider,
  useCurrentAccount,
  useCurrentWallet,
  useSignAndExecuteTransaction,
  useSignPersonalMessage,
  useSuiClient,
  WalletProvider,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { ArrowRight } from "lucide-react";
import "@mysten/dapp-kit/dist/index.css";
import { payUSDC } from "@/lib/utils";
import { useSettings } from "@/contexts/settings-context";
import ZkLogin from "@/lib/zklogin";
import { getSuiAddress, proofRequest, usdcPayment } from "@/lib/api";

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

type FundsStep = "choose" | "amount" | "wallet" | "result";

export default function DashboardPage() {
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [fundsStep, setFundsStep] = useState<FundsStep>("choose");
  const [amount, setAmount] = useState<number>(10);
  const [walletConfirmed, setWalletConfirmed] = useState<boolean>(false);
  const { connectionStatus } = useCurrentWallet();
  const account = useCurrentAccount();
  const [handlingPayment, setHandlingPayment] = useState<boolean>(false);
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { settings, updateSettings, updateZkLoginSettings } = useSettings();

  useEffect(() => {
    (async () => {
      if (!settings.loggedIn) {
        return;
      }
      const suiAddress = await getSuiAddress();
      setWalletConfirmed(suiAddress.data != null && suiAddress.data == account?.address);
    })();
  }, [account]);

  const handleAddFunds = () => {
    setShowAddFunds(true);
  };

  const closeAuthForm = () => {
    setShowAddFunds(false);
  };

  const description = () => {
    switch (fundsStep) {
      case "choose":
        return "Choose a payment method to add funds to your account.";
      case "amount":
        return "Choose USDC amount.";
      case "wallet":
        return "Connect your wallet to add funds to your account.";
    }
  };

  const handleUSDCPayment = async (amount: number) => {
    setHandlingPayment(true);
    if (settings.zkLogin.isEnabled) {
      const zkLogin = new ZkLogin();
      await zkLogin.initialize(settings, updateSettings, updateZkLoginSettings);
      zkLogin
        .payUSDC(amount * 1000000, suiClient)
        .then((res) => {
          const txDigest = res.digest;
          // const txDigest = "ASp9K5Ms1HS1sKW2H4oa4Q9q6Zz3kBqKUn3x9JbZcGsw";
          zkLogin.signMessage(txDigest).then((proofSignature) => {
            setTimeout(() => {
              usdcPayment(txDigest, proofSignature)
                .then(() => {
                  setFundsStep("result");
                })
                .catch((error: Response) => {
                  // setError(`${error.status} : ${error.statusText}`);
                  console.error(error);
                });
            }, 1000);
          });
        })
        .catch((error) => {
          console.error(error);
          // setError(`${error}`);
        });
      setHandlingPayment(false);
      return;
    }
    if (account == null) {
      setHandlingPayment(false);
      return;
    }

    try {
      setShowAddFunds(false);
      const suiAddress = await getSuiAddress();
      if (suiAddress.data == null || suiAddress.data != account?.address) {
        // We haven't proven the SUI address yet
        throw new Error("SUI address not found or not matching");
      }
      let res = await payUSDC(amount * 1000000, suiClient, signAndExecuteTransaction, account);
      const txDigest = (res as { digest: string }).digest;
      await usdcPayment(txDigest);
      setFundsStep("result");
    } catch (error) {
      console.error(error);
      // handleConfirmWallet();
    } finally {
      setHandlingPayment(false);
    }
  };

  const handleConfirmWallet = async () => {
    if (account == null) {
      return;
    }
    const access_token = settings.accessToken;
    let user_id;
    if (access_token) {
      const base64Url = access_token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      const token_json = JSON.parse(jsonPayload);
      user_id = token_json.user_id;
    }

    signPersonalMessage({
      account,
      message: new TextEncoder().encode(
        `Sign this message to prove you are the owner of this wallet. User ID: ${user_id}`
      ),
    }).then((res) => {
      proofRequest(res.signature, account.address)
        .then(() => {
          setFundsStep("amount");
          setWalletConfirmed(true);
        })
        .catch((error: Response) => {
          console.error(error);
        });
    });
  };

  const body = () => {
    switch (fundsStep) {
      case "choose":
        return (
          <Button
            onClick={() => setFundsStep("amount")}
            className="w-full justify-start bg-white dark:bg-darkMode text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-darkMode"
          >
            <Image src="/usdc.svg" alt="USDC" width={24} height={24} className="mr-2" />
            Pay with USDC
          </Button>
        );
      case "amount":
        return (
          <div className="space-y-4">
            <Input
              id="computeUnits"
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                e.target.value = value.toString();
                setAmount(value);
              }}
              className="border-purple-200 dark:border-purple-800/30"
            />
            <Button
              onClick={() =>
                (connectionStatus == "connected" && walletConfirmed) || settings.zkLogin.isEnabled
                  ? handleUSDCPayment(amount)
                  : setFundsStep("wallet")
              }
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={false}
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
          </div>
        );
      case "wallet":
        if (connectionStatus == "connected") {
          return (
            <Button
              onClick={() => (walletConfirmed ? handleUSDCPayment(amount) : handleConfirmWallet())}
              className="w-full justify-start bg-white dark:bg-darkMode text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
              disabled={false}
            >
              {walletConfirmed ? "Pay with USDC" : "Confirm Account"}
            </Button>
          );
        } else {
          return (
            <ConnectModal
              trigger={
                <Button className="w-full justify-start bg-white dark:bg-darkMode text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                  Connect sui wallet
                </Button>
              }
            />
          );
        }
      case "confirm account":
        return <div />;
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      <BackgroundGrid />
      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto p-6 space-y-8">
          {/* Top Section - 3 Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CreditBalanceCard handleAddFunds={handleAddFunds} />
            <BillingSummaryCard />
            <ApiDocumentation />
          </div>

          {/* Bottom Section - Full Width */}
          <div className="w-full">
            <ApiKeyCard />
          </div>
        </div>
      </div>
      <Dialog open={showAddFunds} onOpenChange={setShowAddFunds}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>{description()}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">{body()}</div>
          </div>
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
