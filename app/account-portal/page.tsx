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
  useAccounts,
  ConnectButton,
} from "@mysten/dapp-kit";
import type { WalletAccount } from "@mysten/wallet-standard";
import { getFullnodeUrl } from "@mysten/sui/client";
import { ArrowRight } from "lucide-react";
import "@mysten/dapp-kit/dist/index.css";
import { payUSDC } from "@/lib/utils";
import { useSettings } from "@/contexts/settings-context";
import ZkLogin from "@/lib/zklogin";
import { getSuiAddress, proofRequest, usdcPayment } from "@/lib/api";
import { Label } from "@/components/ui/label";
import LoadingCircle from "@/components/LoadingCircle";
import { useAppState } from "@/contexts/app-state";

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

type FundsStep = "choose" | "amount" | "wallet" | "sending" | "result";

export default function DashboardPage() {
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [fundsStep, setFundsStep] = useState<FundsStep>("choose");
  const [amount, setAmount] = useState<number>(10);
  const [walletConfirmed, setWalletConfirmed] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { connectionStatus } = useCurrentWallet();
  const account = useCurrentAccount();
  const [handlingPayment, setHandlingPayment] = useState<boolean>(false);
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { settings, updateSettings, updateZkLoginSettings } = useSettings();
  const { updateState } = useAppState();
  const accounts = useAccounts();
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(null);

  useEffect(() => {
    (async () => {
      if (!settings.loggedIn) {
        return;
      }
      const suiAddress = await getSuiAddress();
      setWalletConfirmed(suiAddress.data != null && suiAddress.data == account?.address);
    })();
  }, [account]);

  useEffect(() => {
    console.log("Available accounts:", accounts);
  }, [accounts]);

  const handleAddFunds = () => {
    setShowAddFunds(true);
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
      setFundsStep("sending");
      const zkLogin = new ZkLogin();
      await zkLogin.initialize(settings, updateSettings, updateZkLoginSettings);
      zkLogin
        .payUSDC(amount * 1000000, suiClient)
        .then(res => {
          const txDigest = res.digest;
          zkLogin.signMessage(txDigest).then(proofSignature => {
            setTimeout(() => {
              usdcPayment(txDigest, proofSignature)
                .then(() => {
                  updateState({ refreshBalance: true });
                  setFundsStep("result");
                })
                .catch((error: Response) => {
                  console.error(error);
                  setError("Failed to process payment. Please try again.");
                });
            }, 1000);
          });
        })
        .catch(error => {
          console.error(error);
          setError("Failed to process payment. Please try again.");
        });
      setHandlingPayment(false);
      return;
    }

    try {
      setFundsStep("sending");
      const suiAddress = await getSuiAddress();
      if (suiAddress.data == null || suiAddress.data != selectedAccount?.address) {
        throw new Error("SUI address not found or not matching");
      }
      let res = await payUSDC(amount * 1000000, suiClient, signAndExecuteTransaction, selectedAccount);
      const txDigest = (res as { digest: string }).digest;
      await usdcPayment(txDigest);
      updateState({ refreshBalance: true });
      setFundsStep("result");
    } catch (error) {
      console.error(error);
      setError("Failed to process payment. Please try again.");
      setFundsStep("amount"); // Go back to amount step on error
    } finally {
      setHandlingPayment(false);
    }
  };

  const handleConfirmWallet = async () => {
    if (!selectedAccount) {
      return;
    }
    setError(null);
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

    try {
      const res = await signPersonalMessage({
        account: selectedAccount,
        message: new TextEncoder().encode(
          `Sign this message to prove you are the owner of this wallet. User ID: ${user_id}`
        ),
      });

      await proofRequest(res.signature, selectedAccount.address);
      setWalletConfirmed(true);
      // Only proceed to amount step if not already there
      if (fundsStep === "wallet") {
        setFundsStep("amount");
      }
    } catch (error: any) {
      console.error("Wallet error:", error);
      if (error.message?.includes("User rejected")) {
        setError("You rejected the wallet request. Please try again.");
      } else {
        setError("Failed to confirm wallet. Please try again.");
      }
    }
  };

  const renderAccountSelection = () => {
    console.log("Rendering accounts:", accounts);
    if (!accounts || accounts.length === 0) {
      return (
        <div className="text-center py-4">
          <div className="text-gray-500 dark:text-gray-400">No accounts detected</div>
          <div className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Please make sure your wallet is connected and has accounts
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 h-full overflow-hidden">
        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label className="text-lg font-semibold">Select Account</Label>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {accounts.map(acc => (
              <div
                key={acc.address}
                onClick={() => {
                  if (selectedAccount?.address === acc.address) {
                    setSelectedAccount(null);
                  } else {
                    setSelectedAccount(acc);
                  }
                  setError(null);
                }}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedAccount?.address === acc.address
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-medium">{acc.address.slice(0, 1).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        Account {acc.address.slice(0, 6)}...{acc.address.slice(-4)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{acc.address}</div>
                    </div>
                  </div>
                  {selectedAccount?.address === acc.address && (
                    <div className="text-primary flex-shrink-0 ml-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Button
          onClick={handleConfirmWallet}
          className="w-full bg-primary hover:bg-primary/90 text-white"
          disabled={!selectedAccount}
        >
          Confirm Account
        </Button>
      </div>
    );
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
              onChange={e => {
                const value = parseInt(e.target.value) || 0;
                e.target.value = value.toString();
                setAmount(value);
              }}
              className="border-primary dark:border-primary"
            />
            <Button
              onClick={() => {
                if (!walletConfirmed) {
                  setFundsStep("wallet");
                } else {
                  handleUSDCPayment(amount);
                }
              }}
              className="w-full bg-primary hover:bg-primary text-white"
              disabled={amount <= 0}
            >
              {walletConfirmed ? "Pay Now" : "Continue"}
            </Button>
          </div>
        );
      case "wallet":
        if (connectionStatus === "connected") {
          return renderAccountSelection();
        } else {
          return (
            <div className="space-y-4">
              <ConnectModal
                trigger={
                  <Button className="w-full justify-start bg-white dark:bg-darkMode text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                    Connect sui wallet
                  </Button>
                }
              />
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Make sure your wallet is connected to testnet
              </div>
            </div>
          );
        }
      case "sending":
        return (
          <div className="flex items-center justify-center">
            <div className="w-20 h-20">
              <LoadingCircle isSpinning={true} />
            </div>
          </div>
        );
      case "result":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Label>Your account has been successfully funded with ${amount.toFixed(2)}</Label>
            </div>
            <Button
              onClick={() => {
                setShowAddFunds(false);
                setFundsStep("choose");
                setWalletConfirmed(false);
                setSelectedAccount(null);
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              Close
            </Button>
          </div>
        );
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
      <Dialog
        open={showAddFunds}
        onOpenChange={show => {
          setShowAddFunds(show);
          setFundsStep("choose");
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>{description()}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 overflow-hidden">
            <div className="space-y-2 overflow-hidden">{body()}</div>
          </div>
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
