"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Cloud, Key, CreditCardIcon, BookOpen, Calculator, Zap, Info, Copy, CheckCircle2, SquareStackIcon as Stripe, ShoppingCartIcon as Paypal } from 'lucide-react'
import {  Delete } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { LoginRegisterModal } from "./login-register-modal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ComputeUnitsPayment } from "./compute-units-payment"
import { generateApiKey, getAllStacks, getBalance, getSubscriptions, getTasks, listApiKeys, revokeApiToken, type NodeSubscription, type Task } from "@/lib/atoma"

type TabType = 'compute' | 'models' | 'api' | 'billing' | 'docs' | 'calculator';

const tabs = [
  { id: 'compute', icon: Cloud, label: 'Models' },
  { id: 'api', icon: Key, label: 'API Access' },
  { id: 'billing', icon: CreditCardIcon, label: 'Billing' },
  { id: 'docs', icon: BookOpen, label: 'Documentation' },
  { id: 'calculator', icon: Calculator, label: 'Cost Calculator' },
] as const;

interface IUsageHistory {
  id: string;
  date: string;
  tokens: number;
  cost: number;
  model: string;
}

const apiEndpoints = [
  { name: 'Text Generation', endpoint: '/v1/completions', method: 'POST' },
  { name: 'Chat Completions', endpoint: '/v1/chat/completions', method: 'POST' },
  { name: 'Image Generation', endpoint: '/v1/images/generations', method: 'POST' },
  { name: 'Audio Transcription', endpoint: '/v1/audio/transcriptions', method: 'POST' },
]

interface IModelOptions {
    id: string;
    name: string;
    features: string[];
    pricePer1MTokens: number;
    status: string;
}

export function CloudView({ isLoggedIn, setIsLoggedIn }: {isLoggedIn:boolean, setIsLoggedIn:(isLoggedIn: boolean) => void }) {
  const [activeTab, setActiveTab] = useState<TabType>('compute')
  const [privacyEnabled, setPrivacyEnabled] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isComputeUnitsModalOpen, setIsComputeUnitsModalOpen] = useState(false)
  const [selectedModelForPayment, setSelectedModelForPayment] = useState<IModelOptions | null>(null)
  const [apiKeys, setApiKeys] = useState<string[] | undefined>(); 
  const [subscribers, setSubscribers] = useState<NodeSubscription[] | undefined>();
  const [tasks, setTasks] = useState<Task[] | undefined>();
  const [modelOptions, setModelOptions] = useState<IModelOptions[]>([]);
  const [balance, setBalance] = useState<number | null>();
  const [usageHistory, setUsageHistory] = useState<IUsageHistory[]>([]);
  console.log('usageHistory', usageHistory);
  useEffect(() => {
    getBalance().then((balance) => {
      setBalance(balance)
    })
    getTasks().then((tasks) => {
      console.log(tasks);
      getAllStacks().then((stacks) => {
        setUsageHistory(
          stacks.map(([stack,timestamp]) => {
            return {
              id: stack.stack_id,
              date: new Date(timestamp).toLocaleDateString(),
              tokens: stack.num_compute_units,
              cost: (stack.num_compute_units / 1000000) * (stack.price_per_one_million_compute_units / 1000000),
              model: tasks.find((task) => task.task_small_id === stack.task_small_id)?.model_name || "Unknown",
            };
          })
        );
      });
    });
    listApiKeys().then((keys) => setApiKeys(keys))
    getSubscriptions().then((subscriptions) => {
      setSubscribers(subscriptions);
    });
    getTasks().then((tasks) => {
      setTasks(tasks)
    });
  }, []);

  useEffect(() => {
    if (!subscribers || !tasks) return;
    const availableModels : Record<string, NodeSubscription> = {}
    for (const task of tasks) {
      if (!task.model_name) {
        continue;
      }
      const subs_for_this_task = subscribers.filter((subscription) => subscription.task_small_id === task.task_small_id && subscription.valid);  
      if (subs_for_this_task.length === 0) {
        // No valid subscriptions for this task
        continue;
      }
      if (task.model_name in availableModels) {
        availableModels[task.model_name] = subs_for_this_task.reduce((min, item) => item.price_per_one_million_compute_units < min.price_per_one_million_compute_units ? item : min, availableModels[task.model_name])
      } else {
        availableModels[task.model_name] = subs_for_this_task.reduce((min, item) => item.price_per_one_million_compute_units < min.price_per_one_million_compute_units ? item : min, subs_for_this_task[0])
      }
    }
    setModelOptions(Object.keys(availableModels).map((model) => (
      {
        id: model,
        name: model,
        features: [],
        pricePer1MTokens: availableModels[model].price_per_one_million_compute_units,
        status: 'Available'
      })
    ))
  }, [subscribers, tasks])

  const addApiKey = () => {
    generateApiKey().then(() => listApiKeys().then((keys) => setApiKeys(keys)));
  }

  const revokeToken = (token:string) => {
    revokeApiToken(token).then(() => listApiKeys().then((keys) => setApiKeys(keys)));
  }


  const getAdjustedPrice = (pricePerMillion: number) => {
    return (privacyEnabled ? pricePerMillion * 1.05 : pricePerMillion) / 1000000 // Convert from USDC (6 decimals) to USD
  }

  const handleStartUsing = (model:IModelOptions) => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true)
    } else {
      setSelectedModelForPayment(model)
      setIsComputeUnitsModalOpen(true)
    }
  }

  const ComputeTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-end space-x-2 mb-4">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modelOptions.map((model) => (
          <Card key={model.id} className="bg-white dark:bg-[#1E2028] border-purple-100 dark:border-purple-800/30 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg font-medium text-gray-900 dark:text-white">
                <span >{model.name}</span>
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
                        <h4 className="font-semibold">Features & Capabilities</h4>
                        <ul className="text-sm space-y-1">
                          {model.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-green-500 dark:text-green-400 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="pt-2">
                          <p className="text-sm font-medium">Technical Specs:</p>
                          <div className="text-sm space-y-1 mt-1">
                            {/* <p>• {model.ram}</p>
                            <p>• {model.cores}</p>
                            <p>• {model.storage}</p> */}
                          </div>
                        </div>
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
                    ${getAdjustedPrice(model.pricePer1MTokens).toFixed(2)} / 1M {model.id === 'flux1' ? 'MP' : 'tokens'}
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
                  if (isLoggedIn) { 
                    handleStartUsing(model)
                  }  else {
                    setIsLoginModalOpen(true)
                  }
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
  )

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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2" onClick={addApiKey}>API Key</h3>
            {Array.isArray(apiKeys) ?
                apiKeys.map((apiKey) => {
                  return (<div className="flex items-center space-x-2" key={apiKey}>
                    <Input
                      type="password"
                      value="••••••••••••••••"
                      readOnly
                      className="font-mono bg-gray-100 dark:bg-[#1A1C23] border-purple-200 dark:border-purple-800/30 text-gray-900 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600"
                    />
                    <Button variant="outline" onClick={() => navigator.clipboard.writeText(apiKey)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button variant="outline" onClick={()=>revokeToken(apiKey)}>
                      <Delete className="mr-2 h-4 w-4" />
                      Revoke
                    </Button>
                  </div>)
                })
            : <div>Loading</div>}
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
                  <TableRow key={endpoint.name}>
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
            <pre className="bg-gray-100 dark:bg-[#1A1C23] p-4 rounded-md overflow-x-auto">
              <code className="text-sm">
{`curl https://api.atoma.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "llama-2-70b",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is the capital of France?"}
    ]
  }'`}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const BillingTab = () => {
    const totalUsage = usageHistory.reduce((sum, item) => sum + item.tokens, 0)
    const totalCost = usageHistory.reduce((sum, item) => sum + item.cost, 0)
    const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false)
    const [isAutoReloadEnabled, setIsAutoReloadEnabled] = useState(false)
    const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false)
    const [cardNumber, setCardNumber] = useState<string | null>(null);

    const AddFundsModal = () => (
      <Dialog open={isAddFundsModalOpen} onOpenChange={setIsAddFundsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>
              Choose a payment method to add funds to your account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button 
              variant="outline" 
              className="flex justify-start items-center"
              onClick={() => {
                // Handle Stripe payment
                setIsAddFundsModalOpen(false)
              }}
            >
              <Stripe className="mr-2 h-4 w-4" />
              Pay with Stripe
            </Button>
            <Button 
              variant="outline" 
              className="flex justify-start items-center"
              onClick={() => {
                // Handle Credit Card payment
                setIsAddFundsModalOpen(false)
              }}
            >
              <CreditCardIcon className="mr-2 h-4 w-4" />
              Pay with Credit Card
            </Button>
            <Button 
              variant="outline" 
              className="flex justify-start items-center"
              onClick={() => {
                // Handle PayPal payment
                setIsAddFundsModalOpen(false)
              }}
            >
              <Paypal className="mr-2 h-4 w-4" />
              Pay with PayPal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )

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
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">${(balance/1000000).toFixed(2)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Remaining Balance</p>
                </div>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => setIsAddFundsModalOpen(true)}
                >
                  Add Funds
                </Button>
              </div>
              <div className="space-y-2">
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
              </div>
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
                <span className="text-lg font-bold text-gray-900 dark:text-white">{totalUsage.toLocaleString()} tokens</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Monthly budget:</span>
                  <span className="font-medium text-gray-900 dark:text-white">$100.00</span>
                </div>
                <Progress value={(totalCost / 100) * 100} className="h-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {totalCost.toFixed(2)} / $100.00 used
                </p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Billing period: March 1, 2024 - March 31, 2024</p>
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
                {usageHistory.map((item, index) => (
                  <TableRow key={item.index}>
                    <TableCell className="text-gray-900 dark:text-gray-300">{item.date}</TableCell>
                    <TableCell className="text-gray-900 dark:text-gray-300">{item.model}</TableCell>
                    <TableCell className="text-right text-gray-900 dark:text-gray-300">{item.tokens.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-gray-900 dark:text-gray-300">${item.cost.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {isNewCardModalOpen && (
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
        )}
        <AddFundsModal />
      </div>
    )
  }

  const DocsTab = () => (
    <div>Documentation</div>
  )

  const CalculatorTab = () => {
    const [selectedModel, setSelectedModel] = useState(modelOptions[0])
    const [tokensPerDay, setTokensPerDay] = useState(100000)
    const [daysPerMonth, setDaysPerMonth] = useState(30)

    const monthlyCost = useMemo(() => {
      const tokensPerMonth = tokensPerDay * daysPerMonth
      const costPerMillion = selectedModel.pricePer1MTokens
      return (tokensPerMonth / 1000000) * (costPerMillion / 1000000)
    }, [selectedModel, tokensPerDay, daysPerMonth])

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
                onValueChange={(value) => setSelectedModel(modelOptions.find(m => m.id === value) || modelOptions[0])}
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
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${monthlyCost.toFixed(2)}
                </span>
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
                    <TableCell className="text-gray-900 dark:text-gray-300">${(model.pricePer1MTokens / 1000000).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 dark:bg-[#1A1C23]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4 overflow-x-auto">
          {tabs.map(({ id, icon: Icon, label }) => (
            <Button
              key={id}
              variant={activeTab === id ? 'default' : 'outline'}
              className={activeTab === id ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300" : "bg-white dark:bg-gray-800"}
              onClick={() => setActiveTab(id as TabType)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
        {/* Login or Register Button Removed */}
      </div>

      {activeTab === 'compute' && <ComputeTab/>}
      {activeTab === 'api' && <ApiTab />}
      {activeTab === 'billing' && <BillingTab />}
      {activeTab === 'docs' && <DocsTab />}
      {activeTab === 'calculator' && <CalculatorTab />}

      <LoginRegisterModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false)
        }}
        setIsLoggedIn={setIsLoggedIn}
      />
      {isComputeUnitsModalOpen && selectedModelForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ComputeUnitsPayment
            modelName={selectedModelForPayment.name}
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
    </div>
  )
}
