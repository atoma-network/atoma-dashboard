"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Cloud, Database, Key, CreditCard, BookOpen, Calculator, Zap, Sparkles, Brain, MessageSquare, Info, Copy, CheckCircle2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
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
import { cn } from "@/lib/utils"

type TabType = 'compute' | 'models' | 'api' | 'billing' | 'docs' | 'calculator';

const tabs = [
  { id: 'compute', icon: Cloud, label: 'Models' },
  { id: 'api', icon: Key, label: 'API Access' },
  { id: 'billing', icon: CreditCard, label: 'Billing' },
  { id: 'docs', icon: BookOpen, label: 'Documentation' },
  { id: 'calculator', icon: Calculator, label: 'Cost Calculator' },
] as const;

const modelOptions = [
  { 
    id: 'llama3b',
    name: 'Llama 3.2 3B',
    type: 'Chat',
    icon: Brain,
    description: 'Efficient and fast language model optimized for low-latency applications',
    price: 0.01,
    ram: 'Language Model',
    cores: 'Context: 8K tokens',
    storage: 'Basic JSON mode',
    features: [
      'Low latency responses',
      'Efficient resource usage',
      'Basic reasoning capabilities',
      'Cost-effective deployment',
      'Suitable for simple tasks'
    ],
    status: 'Available'
  },
  { 
    id: 'llama70b',
    name: 'Llama 2 70B',
    type: 'Chat',
    icon: MessageSquare,
    description: 'High-performance chat model with strong reasoning capabilities',
    price: 0.02,
    ram: 'Language Model',
    cores: 'Context: 4K tokens',
    storage: 'JSON mode support',
    features: [
      'Advanced reasoning capabilities',
      'JSON mode support',
      'Function calling enabled',
      'High accuracy responses',
      'Multilingual support'
    ],
    status: 'Available'
  },
  { 
    id: 'qwen',
    name: 'Qwen 72B',
    type: 'Chat',
    icon: Brain,
    description: 'Advanced multilingual model with superior coding abilities',
    price: 0.025,
    ram: 'Language Model',
    cores: 'Context: 8K tokens',
    storage: 'Code completion',
    features: [
      'Superior code completion',
      'Multi-language support',
      'Extended context window',
      'Technical documentation expertise',
      'API integration capabilities'
    ],
    status: 'Available'
  },
  { 
    id: 'mixtral',
    name: 'Mixtral 8x7B',
    type: 'Completion',
    icon: Sparkles,
    description: 'Efficient mixture-of-experts model with balanced performance',
    price: 0.015,
    ram: 'Language Model',
    cores: 'Context: 32K tokens',
    storage: 'Sparse MoE',
    features: [
      'Mixture-of-Experts architecture',
      'Efficient token processing',
      'Low latency responses',
      'Balanced performance profile',
      'Cost-effective scaling'
    ],
    status: 'Available'
  },
  { 
    id: 'flux1',
    name: 'FLUX.1',
    type: 'Image',
    icon: Sparkles,
    description: 'Next-generation language model with enhanced reasoning and coding capabilities',
    price: 0.04,
    ram: 'Image Model',
    cores: 'Context: 16K tokens',
    storage: 'Advanced JSON mode',
    features: [
      'Superior reasoning capabilities',
      'Enhanced code generation',
      'Multi-modal processing',
      'Real-time optimization',
      'Extended context handling'
    ],
    status: 'Available'
  }
]

const usageHistory = [
  { id: 1, date: '2024-03-01', tokens: 1500000, cost: 30.00, model: 'Llama 2 70B' },
  { id: 2, date: '2024-03-02', tokens: 2000000, cost: 40.00, model: 'Mistral 7B' },
  { id: 3, date: '2024-03-03', tokens: 1800000, cost: 36.00, model: 'Llama 2 70B' },
  { id: 4, date: '2024-03-04', tokens: 2200000, cost: 44.00, model: 'Qwen 72B' },
  { id: 5, date: '2024-03-05', tokens: 1700000, cost: 34.00, model: 'Mixtral 8x7B' },
]

const apiEndpoints = [
  { name: 'Text Generation', endpoint: '/v1/completions', method: 'POST' },
  { name: 'Chat Completions', endpoint: '/v1/chat/completions', method: 'POST' },
  { name: 'Image Generation', endpoint: '/v1/images/generations', method: 'POST' },
  { name: 'Audio Transcription', endpoint: '/v1/audio/transcriptions', method: 'POST' },
]

export function CloudView() {
  const [activeTab, setActiveTab] = useState<TabType>('compute')
  const [selectedModel, setSelectedModel] = useState(modelOptions[0])
  const [privacyEnabled, setPrivacyEnabled] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const getAdjustedPrice = (basePrice: number) => {
    const pricePerMillion = basePrice * 1000 // Convert from per 1K to per 1M
    return privacyEnabled ? pricePerMillion * 1.05 : pricePerMillion
  }

  const handleStartUsing = () => {
    setIsLoginModalOpen(true)
    setLoginError(null)
  }

  const handleLoginRegister = (email: string, password: string, isLogin: boolean) => {
    // This is a mock implementation. In a real app, you'd call your API here.
    if (email === "user@example.com" && password === "password") {
      // Successful login/register
      setIsLoginModalOpen(false)
      setLoginError(null)
      // Here you would typically set the user state or redirect
    } else {
      // Failed login/register
      setLoginError(isLogin ? "Invalid email or password" : "Registration failed. Please try again.")
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
                            <p>• {model.ram}</p>
                            <p>• {model.cores}</p>
                            <p>• {model.storage}</p>
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">{model.type} Model</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{model.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Price:</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${getAdjustedPrice(model.price).toFixed(2)} / 1M {model.id === 'flux1' ? 'MP' : 'tokens'}
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
                  setIsLoginModalOpen(true)
                  setLoginError(null)
                }}
              >
                Start Using
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">API Key</h3>
            <div className="flex items-center space-x-2">
              <Input
                type="password"
                value="••••••••••••••••"
                readOnly
                className="font-mono bg-gray-100 dark:bg-[#1A1C23] border-purple-200 dark:border-purple-800/30 text-gray-900 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600"
              />
              <Button variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
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

    return (
      <div className="space-y-6">
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
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cost:</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">${totalCost.toFixed(2)}</span>
            </div>
            <Progress value={(totalCost / 100) * 100} className="h-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Billing period: March 1, 2024 - March 31, 2024</p>
          </CardContent>
        </Card>

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
                {usageHistory.map((item) => (
                  <TableRow key={item.id}>
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
      const costPerMillion = selectedModel.price * 1000
      return (tokensPerMonth / 1000000) * costPerMillion
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
                    <TableCell className="text-gray-900 dark:text-gray-300">${(model.price * 1000).toFixed(2)}</TableCell>
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

      {activeTab === 'compute' && <ComputeTab />}
      {activeTab === 'api' && <ApiTab />}
      {activeTab === 'billing' && <BillingTab />}
      {activeTab === 'docs' && <DocsTab />}
      {activeTab === 'calculator' && <CalculatorTab />}

      <LoginRegisterModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false)
          setLoginError(null)
        }}
        error={loginError}
        onSubmit={handleLoginRegister}
      />
    </div>
  )
}

