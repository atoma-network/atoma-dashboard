"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { BackgroundGrid } from "@/components/background-grid"
import { ApiUsageDialog } from "@/components/api-usage-dialog"
import { ParametersSidebar } from "@/components/parameters-sidebar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const models = ["DeepSeek-R1-Zero", "Llama 3.3 70B", "Qwen 2.5 72B", "FLUX.1 schnell"]

interface Parameters {
  apiKey: string
  systemPrompt: string
  customSystemPrompt: string
  autoSetLength: boolean
  outputLength: number
  temperature: number
  topP: number
  topK: number
  repetitionPenalty: number
}

const defaultParameters: Parameters = {
  apiKey: "",
  systemPrompt: "Default",
  customSystemPrompt: "",
  autoSetLength: true,
  outputLength: 2048,
  temperature: 0.7,
  topP: 0.7,
  topK: 50,
  repetitionPenalty: 1,
}

interface Response {
  response: string;
  error?: {
    message: string;
  };
}

export default function PlaygroundPage() {
  const [selectedModel, setSelectedModel] = useState(models[0])
  const [message, setMessage] = useState("")
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<Response>({ response: "" })

  const [parameters, setParameters] = useState<Parameters>(defaultParameters)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setResponse({ response: "This is a sample response." })
      setIsLoading(false)
    }, 1000)
    setMessage("")
  }

  const handleParameterChange = (key: keyof Parameters, value: number | boolean | string) => {
    setParameters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <BackgroundGrid />
      <div className="relative z-10 h-[calc(100vh-6rem)] overflow-hidden">
        <div className="h-full p-4 grid grid-cols-[1fr,400px] gap-4">
          <Card
            className="flex flex-col overflow-hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            hideInfo
          >
            {/* Header Section */}
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between w-full">
                {/* <div className="flex items-center">
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2"
                        onMouseEnter={() => setIsPopoverOpen(true)}
                        onMouseLeave={() => setIsPopoverOpen(false)}
                      >
                        {selectedModel}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="right"
                      align="start"
                      className="w-[200px] p-2"
                      onMouseEnter={() => setIsPopoverOpen(true)}
                      onMouseLeave={() => setIsPopoverOpen(false)}
                    >
                      <div className="space-y-1">
                        {models.map((model) => (
                          <Button
                            key={model}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              setSelectedModel(model)
                              setIsPopoverOpen(false)
                            }}
                          >
                            {model}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div> */}
                <div className="flex items-center">
                  {["DeepSeek-R1-Zero", "Llama 3.3 70B", "Qwen 2.5 72B"].map((model) => (
                    <Button
                      key={model}
                      variant="ghost"
                      className={`mr-2 ${selectedModel === model ? "bg-secondary text-secondary-foreground" : ""}`}
                      onClick={() => setSelectedModel(model)}
                    >
                      {model}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsApiDialogOpen(true)}>
                    API
                  </Button>
                </div>
              </div>
              <Separator />
            </div>

            {/* Chat Section */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 p-4">
                {(!response.response && !isLoading) || isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div
                      className="w-24 h-24 rounded-full border-8 border-[#DD6C4A] transition-all duration-1000 animate-pulse"
                      style={{ animationDuration: '2s' }}
                    />
                  </div>
                ) : response.error ? (
                  <div className="text-red-500">Error: {response.error.message}</div>
                ) : (
                  <div className="text-green-500">Response: {response.response}</div>
                )}
              </div>
              <div className="border-t p-4 bg-background/50">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" className="bg-[#DD6C4A] hover:bg-[#c55f40]">
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </form>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden" hideInfo>
            <ParametersSidebar parameters={parameters} onChange={handleParameterChange} />
          </Card>
        </div>
      </div>
      <ApiUsageDialog isOpen={isApiDialogOpen} onClose={() => setIsApiDialogOpen(false)} modelName={selectedModel} />
    </div>
  )
}

