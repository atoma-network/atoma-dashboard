"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cloud, Key, CreditCardIcon, BookOpen, Calculator, Info, Copy, CheckCircle2, ArrowRight } from "lucide-react";
import { Delete } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider";
import { LoginRegisterModal } from "./login-register-modal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ComputeUnitsPayment } from "./compute-units-payment";
import {
  generateApiKey,
  getAllStacks,
  getBalance,
  getSubscriptions,
  getSuiAddress,
  getTasks,
  listApiKeys,
  ModelModality,
  payUSDC,
  proofRequest,
  revokeApiToken,
  usdcPayment,
  type NodeSubscription,
  type Task,
  type Token,
} from "@/lib/atoma";
import { useGlobalState } from "@/app/GlobalStateContext";
import {
  ConnectModal,
  useCurrentAccount,
  useCurrentWallet,
  useSignAndExecuteTransaction,
  useSignPersonalMessage,
  useSuiClient,
} from "@mysten/dapp-kit";
import { GetApiSample } from "@/components/ui/GetApiSample";
import Image from "next/image";
import { formatNumber, simplifyModelName } from "@/lib/utils";
import { LOCAL_STORAGE_ACCESS_TOKEN } from "@/lib/local_storage_consts";

type TabType = "compute" | "models" | "api" | "billing" | "docs" | "calculator";

const tabs = [
  { id: "compute", icon: Cloud, label: "Models" },
  { id: "api", icon: Key, label: "API Access" },
  { id: "billing", icon: CreditCardIcon, label: "Billing" },
  { id: "docs", icon: BookOpen, label: "Documentation" },
  { id: "calculator", icon: Calculator, label: "Cost Calculator" },
] as const;

interface IUsageHistory {
  id: string;
  date: Date;
  tokens: number;
  used_tokens: number;
  cost: number;
  model: string;
}

const apiEndpoints = [
  {
    name: "Chat Completions",
    endpoint: "/v1/chat/completions",
    method: "POST",
    example: <GetApiSample modality={ModelModality.ChatCompletions} />,
  },
  {
    name: "Images Generations",
    endpoint: "/v1/images/generations",
    method: "POST",
    example: <GetApiSample modality={ModelModality.ImagesGenerations} />,
  },
  {
    name: "Embeddings",
    endpoint: "/v1/embeddings",
    method: "POST",
    example: <GetApiSample modality={ModelModality.Embeddings} />,
  },
];

interface IModelOptions {
  id: string;
  name: string;
  modality: ModelModality[];
  features: string[];
  pricePer1MTokens: number;
  status: string;
}

const modalityToFeatureName = (modality: ModelModality): string => {
  switch (modality) {
    case ModelModality.ChatCompletions:
      return "Chat Completion";
    case ModelModality.ImagesGenerations:
      return "Image Generation";
    case ModelModality.Embeddings:
      return "Embeddings";
    default:
      return modality;
  }
};

export function CloudView() {
  const [activeTab, setActiveTab] = useState<TabType>("compute");
  // const [privacyEnabled, setPrivacyEnabled] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isComputeUnitsModalOpen, setIsComputeUnitsModalOpen] = useState(false);
  const [selectedModelForPayment, setSelectedModelForPayment] = useState<IModelOptions | null>(null);
  const [apiKeys, setApiKeys] = useState<Token[] | undefined>();
  const [subscribers, setSubscribers] = useState<NodeSubscription[] | undefined>();
  const [tasks, setTasks] = useState<Task[] | undefined>();
  const [modelOptions, setModelOptions] = useState<IModelOptions[]>([]);
  const [balance, setBalance] = useState<number | undefined>(undefined);
  const [usageHistory, setUsageHistory] = useState<IUsageHistory[]>([]);
  const [exampleUsage, setExampleUsage] = useState(apiEndpoints[0].example);
  const [modelModalities, setModelModalities] = useState<Map<string, ModelModality[]>>(new Map());
  const [partialBalance, setPartialBalance] = useState<number | undefined>();
  const { logState, setLogState } = useGlobalState();
  const [newToken, setNewToken] = useState<string>("");
  const [showNewToken, setShowNewToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    getTasks()
      .then((tasks_with_modalities) => {
        const tasks = tasks_with_modalities.map((task) => task[0]);
        setModelModalities(
          new Map(
            tasks_with_modalities
              .filter(([task]) => task.model_name !== undefined)
              .map(([task, modalities]) => [task.model_name!, modalities])
          )
        );
        // setExampleModels(apiEndpoints.map((endpoint) => tasks_with_modalities.find(([task, modalities])=> modalities.includes(endpoint.name as ModelModality) && task.model_name)?.[0].model_name || "$MODEL_NAME"));
        if (logState === "loggedIn") {
          getAllStacks()
            .then((stacks) => {
              let partialBalance = 0;
              stacks.forEach(([stack]) => {
                partialBalance +=
                  (stack.already_computed_units / stack.num_compute_units) * stack.price_per_one_million_compute_units;
              });
              setPartialBalance(partialBalance);
              setUsageHistory(
                stacks.map(([stack, timestamp]) => {
                  return {
                    id: stack.stack_id,
                    date: new Date(timestamp),
                    tokens: stack.num_compute_units,
                    used_tokens: stack.already_computed_units,
                    cost: (stack.num_compute_units / 1000000) * (stack.price_per_one_million_compute_units / 1000000),
                    model: tasks.find((task) => task.task_small_id === stack.task_small_id)?.model_name || "Unknown",
                  };
                })
              );
            })
            .catch(() => {
              setLogState("loggedOut");
            });
        }
      })
      .catch((err: Response) => {
        console.error(err);
      });
    getSubscriptions().then((subscriptions) => {
      setSubscribers(subscriptions);
    });
    getTasks().then((tasks_with_modalities) => {
      const tasks = tasks_with_modalities.map((task) => task[0]);
      setTasks(tasks);
    });
  }, [logState, setLogState]);

  useEffect(() => {
    if (logState !== "loggedIn") {
      return;
    }
    getBalance()
      .then((balance) => {
        setBalance(balance);
      })
      .catch(() => {
        setBalance(0);
      });
    listApiKeys()
      .then((keys) => setApiKeys(keys))
      .catch(() => {
        setLogState("loggedOut");
      });
  }, [logState, setLogState]);

  useEffect(() => {
    if (!subscribers || !tasks) return;
    const availableModels: Record<string, NodeSubscription> = {};
    for (const task of tasks) {
      if (!task.model_name || task.is_deprecated) {
        continue;
      }
      const subs_for_this_task = subscribers.filter(
        (subscription) => subscription.task_small_id === task.task_small_id && subscription.valid
      );
      if (subs_for_this_task.length === 0) {
        // No valid subscriptions for this task
        continue;
      }
      if (task.model_name in availableModels) {
        availableModels[task.model_name] = subs_for_this_task.reduce(
          (min, item) =>
            item.price_per_one_million_compute_units < min.price_per_one_million_compute_units ? item : min,
          availableModels[task.model_name]
        );
      } else {
        availableModels[task.model_name] = subs_for_this_task.reduce(
          (min, item) =>
            item.price_per_one_million_compute_units < min.price_per_one_million_compute_units ? item : min,
          subs_for_this_task[0]
        );
      }
    }
    setModelOptions(
      Object.keys(availableModels).map((model) => ({
        id: model,
        name: model,
        modality: modelModalities.get(model) || [],
        features: modelModalities?.get(model)?.map((modality) => modalityToFeatureName(modality)) || [],
        pricePer1MTokens: availableModels[model].price_per_one_million_compute_units,
        status: "Available",
      }))
    );
  }, [subscribers, tasks, modelModalities]);

  const addApiKey = async () => {
    const newToken = await generateApiKey("token");
    setNewToken(newToken);
    setShowNewToken(true);
    const keys = await listApiKeys();
    setApiKeys(keys);
  };

  const revokeToken = (token: number) => {
    revokeApiToken(token).then(() => listApiKeys().then((keys) => setApiKeys(keys)));
  };

  const getAdjustedPrice = (pricePerMillion: number) => {
    return pricePerMillion / 1000000; // Convert from USDC (6 decimals) to USD
    // return (privacyEnabled ? pricePerMillion * 1.05 : pricePerMillion) / 1000000 // Convert from USDC (6 decimals) to USD
  };

  const handleStartUsing = (model: IModelOptions) => {
    setSelectedModelForPayment(model);
    setIsComputeUnitsModalOpen(true);
  };

  const ComputeTab = () => (
    <div className="space-y-6">
      {/* <div className="flex items-center justify-end space-x-2 mb-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="privacy-mode"
            checked={privacyEnabled}
            onCheckedChange={setPrivacyEnabled}
          />
          <label
            htmlFor="privacy-mode"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-purple-700 dark:text-purple-300"
          >
            Privacy Mode
          </label>
        </div>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modelOptions.map((model) => (
          <Card
            key={model.id}
            className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30 shadow-sm"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg font-medium text-gray-900 dark:text-white">
                <div className="flex flex-col">
                  <span>{simplifyModelName(model.name)}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400"> {model.name}</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="sr-only">Model Information</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="w-80 p-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Features & Modalities</h4>
                        <ul className="text-sm space-y-1">
                          {model.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-green-500 dark:text-green-400 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        {/* <div className="pt-2">
                          <p className="text-sm font-medium">Technical Specs:</p>
                          <div className="text-sm space-y-1 mt-1">
                            <p>• {model.ram}</p>
                            <p>• {model.cores}</p>
                            <p>• {model.storage}</p>
                          </div>
                        </div> */}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              {/* <CardDescription className="text-gray-500 dark:text-gray-400">{model.type} Model</CardDescription> */}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {/* <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{model.description}</p> */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Price:</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${getAdjustedPrice(model.pricePer1MTokens).toFixed(2)} / 1M {model.id === "flux1" ? "MP" : "tokens"}
                  </span>
                </div>
              </div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="features">
                  <AccordionTrigger className="text-gray-900 dark:text-white">Features</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1">
                      {model.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-800 dark:hover:bg-purple-900"
                onClick={() => {
                  handleStartUsing(model);
                }}
              >
                Start Using
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* <ApiExampleModal
        isOpen={isApiExampleModalOpen}
        onClose={() => setIsApiExampleModalOpen(false)}
        model={selectedModel}
        privacyEnabled={privacyEnabled}
      /> */}
    </div>
  );

  const ApiTab = () => (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">API Access</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Integrate our AI models into your applications using our RESTful API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">API Key</h3>
            {logState === "loggedIn" ? (
              Array.isArray(apiKeys) ? (
                <>
                  {apiKeys.map((apiKey) => {
                    return (
                      <div className="flex items-center space-x-2" key={apiKey.id}>
                        <input
                          className="flex-grow font-mono bg-gray-100 dark:bg-[#1A1C23] border-purple-200 dark:border-purple-800/30 text-gray-900 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600"
                          value={`Last 4 chars of the token "${apiKey.token_last_4}"`}
                          readOnly
                        >
                          {/* Last 4 chars of api token {apiKey.token_last_4} */}
                        </input>
                        <Button variant="outline" onClick={() => revokeToken(apiKey.id)}>
                          <Delete className="mr-2 h-4 w-4" />
                          Revoke
                        </Button>
                      </div>
                    );
                  })}
                  {apiKeys.length === 0 && (
                    <>
                      <div>No API key generated yet</div>
                      <Button variant="outline" className="flex justify-start items-center" onClick={addApiKey}>
                        Generate API Token
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <div>Loading</div>
              )
            ) : logState === "loggingIn" ? (
              "..."
            ) : (
              "N/A"
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Available Endpoints</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-600 dark:text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Endpoint</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiEndpoints.map((endpoint) => (
                  <TableRow key={endpoint.name} onClick={() => setExampleUsage(endpoint.example)}>
                    <TableCell className="text-gray-900 dark:text-gray-300">{endpoint.name}</TableCell>
                    <TableCell className="text-gray-900 dark:text-gray-300">{endpoint.endpoint}</TableCell>
                    <TableCell className="text-gray-900 dark:text-gray-300">{endpoint.method}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Example Usage</h3>
            <pre className="bg-gray-100 dark:bg-[#1A1C23] p-4 rounded-md overflow-x-auto">{exampleUsage}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const BillingTab = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const totalUsedTokens =
      logState === "loggedIn"
        ? usageHistory.reduce((sum, item) => sum + (item.date >= startOfMonth ? item.used_tokens : 0), 0)
        : 0;
    // const totalUsage = isLoggedIn
    //   ? usageHistory.reduce((sum, item) => sum + (item.date >= startOfMonth ? item.tokens : 0), 0)
    //   : 0;
    // const totalCost = isLoggedIn ? usageHistory.reduce((sum, item) => sum + item.cost, 0) : 0;
    // const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false)
    // const [isAutoReloadEnabled, setIsAutoReloadEnabled] = useState(false)
    const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
    // const [cardNumber, setCardNumber] = useState<string | null>(null);

    const AddFundsModal = () => {
      const [amount, setAmount] = useState<number>(10);
      const [step, setStep] = useState<"payment" | "amount" | "wallet" | "result" | "confirmed">("payment");
      const [walletConfirmed, setWalletConfirmed] = useState<boolean>(false);
      const [handlingPayment, setHandlingPayment] = useState<boolean>(false);
      const { connectionStatus } = useCurrentWallet();
      const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
      const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
      const { setError, zkLogin } = useGlobalState();
      const suiClient = useSuiClient();
      const account = useCurrentAccount();

      useEffect(() => {
        if (logState !== "loggedIn") {
          return;
        }
        getSuiAddress().then((suiAddress) => {
          setWalletConfirmed(suiAddress != null && suiAddress == account?.address);
        });
      }, [account]);

      const handleConfirmWallet = async () => {
        if (account == null) {
          return;
        }
        const access_token = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN);
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
              setStep("confirmed");
              setWalletConfirmed(true);
            })
            .catch((error: Response) => {
              setError(`${error.status} : ${error.statusText}`);
              console.error(error);
            });
        });
      };

      const handleUSDCPayment = async (amount: number) => {
        setHandlingPayment(true);
        if (zkLogin.isEnabled) {
          zkLogin
            .payUSDC(amount * 1000000, suiClient)
            .then((res) => {
              const txDigest = res.digest;
              // const txDigest = "ASp9K5Ms1HS1sKW2H4oa4Q9q6Zz3kBqKUn3x9JbZcGsw";
              zkLogin.signMessage(txDigest).then((proofSignature) => {
                setTimeout(() => {
                  usdcPayment(txDigest, proofSignature)
                    .then(() => {
                      setStep("result");
                    })
                    .catch((error: Response) => {
                      setError(`${error.status} : ${error.statusText}`);
                      console.error(error);
                    });
                }, 1000);
              });
            })
            .catch((error) => {
              console.error(error);
              setError(`${error}`);
            });
          setHandlingPayment(false);
          return;
        }
        if (account == null) {
          setHandlingPayment(false);
          return;
        }

        try {
          const suiAddress = await getSuiAddress();
          if (suiAddress == null || suiAddress != account?.address) {
            // We haven't proven the SUI address yet
            throw new Error("SUI address not found or not matching");
          }
          payUSDC(amount * 1000000, suiClient, signAndExecuteTransaction, account)
            .then((res: unknown) => {
              const txDigest = (res as { digest: string }).digest;
              setTimeout(() => {
                usdcPayment(txDigest)
                  .then(() => {
                    setStep("result");
                  })
                  .catch((error: Response) => {
                    setError(`${error.status} : ${error.statusText}`);
                    console.error(error);
                  });
              }, 1000);
            })
            .catch((error) => {
              console.error(error);
              setError(`${error}`);
            });
        } catch {
          handleConfirmWallet();
        } finally {
          setHandlingPayment(false);
        }
      };
      return (
        <Dialog
          open={isAddFundsModalOpen}
          onOpenChange={(change) => {
            if (step === "result") {
              getBalance()
                .then((balance) => {
                  setBalance(balance);
                })
                .catch(() => {
                  setBalance(0);
                });
            }
            setIsAddFundsModalOpen(change);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Funds</DialogTitle>
              <DialogDescription>
                {step === "payment" && "Choose a payment method to add funds to your account."}
                {step === "amount" && "Choose USDC amount."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 py-4">
              {step === "payment" && (
                <Button
                  onClick={() => setStep("amount")}
                  className="w-full justify-start bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Image src="/usdc.svg" alt="USDC" width={24} height={24} className="mr-2" />
                  Pay with USDC
                </Button>
              )}
              {step === "amount" && (
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
                      (connectionStatus == "connected" && walletConfirmed) || zkLogin.isEnabled
                        ? handleUSDCPayment(amount)
                        : setStep("wallet")
                    }
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={handlingPayment}
                  >
                    <ArrowRight className="h-6 w-6" />
                  </Button>
                </div>
              )}
              {step === "wallet" &&
                (connectionStatus == "connected" ? (
                  <Button
                    onClick={() => (walletConfirmed ? handleUSDCPayment(amount) : handleConfirmWallet())}
                    className="w-full justify-start bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                    disabled={handlingPayment}
                  >
                    {walletConfirmed ? "Pay with USDC" : "Confirm Account"}
                  </Button>
                ) : (
                  <ConnectModal
                    trigger={
                      <Button className="w-full justify-start bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                        Connect sui wallet
                      </Button>
                    }
                  />
                ))}
              {step === "confirmed" && (
                <>
                  <Label>Wallet was confirmed</Label>
                  <Button
                    onClick={() => (walletConfirmed ? handleUSDCPayment(amount) : handleConfirmWallet())}
                    className="w-full justify-start bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                    disabled={handlingPayment}
                  >
                    {"Pay with USDC"}
                  </Button>
                </>
              )}
              {step === "result" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Label>Your account has been successfully funded with ${amount.toFixed(2)}</Label>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      );
    };

    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Credit Balance</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Your credit balance will be consumed with API usage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {logState === "loggedIn"
                      ? `$${
                          balance !== undefined && partialBalance !== undefined
                            ? ((balance + partialBalance) / 1000000).toFixed(2)
                            : "Loading"
                        }`
                      : logState === "loggingIn"
                      ? "..."
                      : "N/A"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Remaining Balance</p>
                </div>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => (logState === "loggedIn" ? setIsAddFundsModalOpen(true) : setIsLoginModalOpen(true))}
                  disabled={logState === "loggingIn"}
                >
                  {logState === "loggedIn" ? "Add Funds" : logState === "loggingIn" ? "..." : "Login or Register"}
                </Button>
              </div>
              {/* <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCardIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {cardNumber ? `Mastercard •••• ${cardNumber.slice(-4)}` : 'No card on file'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsNewCardModalOpen(true)}>
                    {cardNumber ? 'Change' : 'Add Card'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-500 dark:text-gray-400">
                      {isAutoReloadEnabled ? "Auto reload is enabled" : "Auto reload is disabled"}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsAutoReloadEnabled(!isAutoReloadEnabled)}
                  >
                    {isAutoReloadEnabled ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div> */}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Billing Summary</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Overview of your current billing period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Usage:</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatNumber(totalUsedTokens)} tokens
                </span>
              </div>
              {/* <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Monthly budget:</span>
                  <span className="font-medium text-gray-900 dark:text-white">$100.00</span>
                </div>
                <Progress value={(totalCost / 100) * 100} className="h-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {totalCost.toFixed(2)} / $100.00 used
                </p>
              </div> */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Billing period: {startOfMonth.toLocaleDateString(undefined, { dateStyle: "long" })} -{" "}
                {endOfMonth.toLocaleDateString(undefined, { dateStyle: "long" })}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Usage History</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Detailed breakdown of your API usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-600 dark:text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Model</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-300">Tokens</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-300">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logState === "loggedIn" &&
                  usageHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-gray-900 dark:text-gray-300">
                        {item.date.toLocaleDateString(undefined, { dateStyle: "long" })}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-300">{item.model}</TableCell>
                      <TableCell className="text-right text-gray-900 dark:text-gray-300">
                        {item.used_tokens.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-gray-900 dark:text-gray-300">
                        ${((item.cost * item.used_tokens) / item.tokens).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* {isNewCardModalOpen && (
          <Dialog open={isNewCardModalOpen} onOpenChange={setIsNewCardModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Card</DialogTitle>
                <DialogDescription>
                  Enter your new card details below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const newCardNumber = formData.get('cardNumber') as string;
                setCardNumber(newCardNumber);
                setIsNewCardModalOpen(false);
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input id="expiryDate" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
                <Button type="submit" className="w-full">Add Card</Button>
              </form>
            </DialogContent>
          </Dialog>
        )} */}
        <AddFundsModal />
      </div>
    );
  };

  const DocsTab = () => (
    <iframe
      src="https://docs.atoma.network/documentation/get-started/overview"
      className="w-full h-[calc(100vh-4rem)]"
    />
  );

  const CalculatorTab = () => {
    const [selectedModel, setSelectedModel] = useState(modelOptions[0]);
    const [tokensPerDay, setTokensPerDay] = useState(100000);
    const [daysPerMonth, setDaysPerMonth] = useState(30);

    const monthlyCost = useMemo(() => {
      const tokensPerMonth = tokensPerDay * daysPerMonth;
      const costPerMillion = selectedModel.pricePer1MTokens;
      return (tokensPerMonth / 1000000) * (costPerMillion / 1000000);
    }, [selectedModel, tokensPerDay, daysPerMonth]);

    return (
      <div className="space-y-6">
        <Card className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Cost Calculator</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Estimate your monthly costs based on usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="model-select">Select Model</Label>
              <Select
                value={selectedModel.id}
                onValueChange={(value) => setSelectedModel(modelOptions.find((m) => m.id === value) || modelOptions[0])}
              >
                <SelectTrigger id="model-select">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tokens per day: {tokensPerDay.toLocaleString()}</Label>
              <Slider
                min={1000}
                max={10000000}
                step={1000}
                value={[tokensPerDay]}
                onValueChange={([value]) => setTokensPerDay(value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Days per month: {daysPerMonth}</Label>
              <Slider
                min={1}
                max={31}
                step={1}
                value={[daysPerMonth]}
                onValueChange={([value]) => setDaysPerMonth(value)}
              />
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Estimated Monthly Cost:</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">${monthlyCost.toFixed(2)}</span>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Based on {(tokensPerDay * daysPerMonth).toLocaleString()} tokens per month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Pricing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-600 dark:text-gray-300">Model</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Price per 1M tokens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modelOptions.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium text-gray-900 dark:text-gray-300">{model.name}</TableCell>
                    <TableCell className="text-gray-900 dark:text-gray-300">
                      ${(model.pricePer1MTokens / 1000000).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6 dark:bg-[#1A1C23]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4 overflow-x-auto">
          {tabs.map(({ id, icon: Icon, label }) => (
            <Button
              key={id}
              variant={activeTab === id ? "default" : "outline"}
              className={
                activeTab === id
                  ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                  : "bg-white dark:bg-gray-800"
              }
              onClick={() => {
                if (id === "docs") {
                  window.open("https://docs.atoma.network/cloud-api-reference", "_blank");
                } else {
                  setActiveTab(id as TabType);
                }
              }}
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
        {/* Login or Register Button Removed */}
      </div>

      {activeTab === "compute" && <ComputeTab />}
      {activeTab === "api" && <ApiTab />}
      {activeTab === "billing" && <BillingTab />}
      {activeTab === "docs" && <DocsTab />}
      {activeTab === "calculator" && <CalculatorTab />}

      <LoginRegisterModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
        }}
      />
      {isComputeUnitsModalOpen && selectedModelForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ComputeUnitsPayment
            modelName={selectedModelForPayment.name}
            features={selectedModelForPayment.modality}
            pricePer1MUnits={selectedModelForPayment.pricePer1MTokens}
            onClose={() => setIsComputeUnitsModalOpen(false)}
          />
        </div>
      )}
      {/* <ApiExampleModal
        isOpen={isApiExampleModalOpen}
        onClose={() => setIsApiExampleModalOpen(false)}
        model={selectedModel}
        privacyEnabled={privacyEnabled}
      /> */}
      <Dialog open={showNewToken} onOpenChange={setShowNewToken}>
        <DialogContent className="sm:max-w-[425px] text-center">
          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="text-2xl font-bold text-purple-700 dark:text-purple-300 text-center">
              Save your key
            </DialogTitle>
            <DialogDescription className="text-purple-600 dark:text-purple-400 mx-auto">
              Please save your secret key in a safe place since{" "}
              <span className="font-semibold">you won&apos;t be able to view it again</span>. Keep it secure, as anyone
              with your API key can make requests on your behalf. If you do lose it, you&apos;ll need to generate a new
              one.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between items-center">
            <div className="rounded-md border bg-muted p-2 font-mono text-sm">{newToken}</div>
            <Button size="sm" onClick={copyToClipboard} className="right-2 ">
              {copied ? (
                "Copied"
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
