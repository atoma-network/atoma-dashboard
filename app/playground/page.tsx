"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"
import { BackgroundGrid } from "@/components/background-grid"
import { ApiUsageDialog } from "@/components/api-usage-dialog"
import { ParametersSidebar } from "@/components/parameters-sidebar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { toast } from "sonner"

// Define the available API endpoints
const API_ENDPOINTS = {
  CHAT: "/v1/chat/completions",
  EMBEDDINGS: "/v1/embeddings",
  IMAGES: "/v1/images/generations"
}

// Define available models for each endpoint
const MODELS = {
  CHAT: ["DeepSeek-R1-Zero", "Llama 3.3 70B", "Qwen 2.5 72B", "FLUX.1 schnell"],
  EMBEDDINGS: ["multilingual-e5-large", "text-embedding-ada-002"],
  IMAGES: ["dall-e-3", "dall-e-2"]
}

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

export default function PlaygroundPage() {
  // State for the active endpoint and model
  const [activeEndpoint, setActiveEndpoint] = useState<string>("CHAT")
  const [selectedModel, setSelectedModel] = useState<string>(MODELS.CHAT[0])
  
  // Input states for different endpoints
  const [chatInput, setChatInput] = useState<string>("")
  const [embeddingInput, setEmbeddingInput] = useState<string>("The food was delicious and the waiter...")
  const [imagePrompt, setImagePrompt] = useState<string>("A serene landscape with mountains")
  
  // Response state
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // UI state
  const [isApiDialogOpen, setIsApiDialogOpen] = useState<boolean>(false)
  const [parameters, setParameters] = useState<Parameters>(defaultParameters)
  
  // Update selected model when endpoint changes
  useEffect(() => {
    setSelectedModel(MODELS[activeEndpoint as keyof typeof MODELS][0])
  }, [activeEndpoint])
  
  // Handle parameter changes
  const handleParameterChange = (key: keyof Parameters, value: number | boolean | string) => {
    setParameters((prev) => ({ ...prev, [key]: value }))
  }
  
  // Format the request based on the active endpoint
  const formatRequest = () => {
    switch (activeEndpoint) {
      case "CHAT":
        return {
          model: selectedModel.toLowerCase(),
          messages: [
            ...(parameters.systemPrompt === "Custom" && parameters.customSystemPrompt 
              ? [{ role: "system", content: parameters.customSystemPrompt }] 
              : []),
            { role: "user", content: chatInput }
          ],
          max_tokens: parameters.outputLength,
          temperature: parameters.temperature,
          top_p: parameters.topP,
          top_k: parameters.topK,
          repetition_penalty: parameters.repetitionPenalty
        }
      case "EMBEDDINGS":
        return {
          model: selectedModel.toLowerCase(),
          input: embeddingInput
        }
      case "IMAGES":
        return {
          model: selectedModel.toLowerCase(),
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024"
        }
      default:
        return {}
    }
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      // Get the request data
      const requestData = formatRequest()
      
      // Get the endpoint URL
      const endpointUrl = API_ENDPOINTS[activeEndpoint as keyof typeof API_ENDPOINTS]
      
      // Use custom API key if provided
      const headers: Record<string, string> = {}
      if (parameters.apiKey) {
        headers["Authorization"] = `Bearer ${parameters.apiKey}`
      }
      
      // Make the API call
      const response = await api.post(endpointUrl, requestData, { headers })
      
      // Set the response
      setResponse(response.data)
      
      // Show success toast
      toast.success("API request successful")
    } catch (err: any) {
      console.error("API request failed:", err)
      setError(err.response?.data?.error?.message || err.message || "An unknown error occurred")
      toast.error("API request failed")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Render the response based on the active endpoint
  const renderResponse = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      )
    }
    
    if (error) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-300">
          <h3 className="font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )
    }
    
    if (!response) {
      return (
        <div className="flex items-center justify-center h-full">
          {/* Empty State with Animated Ring */}
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full border-2 border-purple-400" />
            <div
              className="absolute inset-0 rounded-full border-t-2 border-purple-600"
              style={{ animation: "spin 3s linear infinite" }}
            />
            <div className="absolute inset-0 rounded-full border-2 border-purple-300 blur-md animate-pulse" />
          </div>
        </div>
      )
    }
    
    switch (activeEndpoint) {
      case "CHAT":
        return (
          <div className="p-4 bg-muted/50 rounded-md font-mono text-sm overflow-auto max-h-[calc(100%-2rem)]">
            <pre>{response.choices?.[0]?.message?.content || JSON.stringify(response, null, 2)}</pre>
          </div>
        )
      case "EMBEDDINGS":
        return (
          <div className="p-4 bg-muted/50 rounded-md font-mono text-sm overflow-auto max-h-[calc(100%-2rem)]">
            <p className="mb-2 text-muted-foreground">Embedding vector (first 10 values):</p>
            <pre>{JSON.stringify(response.data?.[0]?.embedding?.slice(0, 10), null, 2)}</pre>
            <p className="mt-4 mb-2 text-muted-foreground">Full response:</p>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        )
      case "IMAGES":
        return (
          <div className="flex flex-col items-center justify-center p-4">
            {response.data?.[0]?.url ? (
              <>
                <img 
                  src={response.data[0].url} 
                  alt="Generated image" 
                  className="max-w-full max-h-[400px] rounded-md shadow-md mb-4" 
                />
                <div className="p-4 bg-muted/50 rounded-md font-mono text-sm w-full">
                  <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
              </>
            ) : (
              <div className="p-4 bg-muted/50 rounded-md font-mono text-sm w-full">
                <pre>{JSON.stringify(response, null, 2)}</pre>
              </div>
            )}
          </div>
        )
      default:
        return (
          <div className="p-4 bg-muted/50 rounded-md font-mono text-sm overflow-auto max-h-[calc(100%-2rem)]">
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        )
    }
  }
  
  // Render the input form based on the active endpoint
  const renderInputForm = () => {
    switch (activeEndpoint) {
      case "CHAT":
        return (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isLoading || !chatInput.trim()}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        )
      case "EMBEDDINGS":
        return (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <Textarea
              value={embeddingInput}
              onChange={(e) => setEmbeddingInput(e.target.value)}
              placeholder="Enter text to embed..."
              className="flex-1 min-h-[100px]"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700 self-end"
              disabled={isLoading || !embeddingInput.trim()}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Generate Embeddings
            </Button>
          </form>
        )
      case "IMAGES":
        return (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <Textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="flex-1 min-h-[100px]"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700 self-end"
              disabled={isLoading || !imagePrompt.trim()}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Generate Image
            </Button>
          </form>
        )
      default:
        return null
    }
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
                <Tabs 
                  defaultValue="CHAT" 
                  value={activeEndpoint} 
                  onValueChange={(value) => setActiveEndpoint(value)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="CHAT">Chat</TabsTrigger>
                    <TabsTrigger value="EMBEDDINGS">Embeddings</TabsTrigger>
                    <TabsTrigger value="IMAGES">Images</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" onClick={() => setIsApiDialogOpen(true)}>
                    API
                  </Button>
                </div>
              </div>
              <div className="flex items-center">
                {MODELS[activeEndpoint as keyof typeof MODELS].map((model) => (
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
              <Separator />
            </div>

            {/* Response Section */}
            <div className="flex-1 p-4 overflow-auto">
              {renderResponse()}
            </div>
            
            {/* Input Section */}
            <div className="border-t p-4 bg-background/50">
              {renderInputForm()}
            </div>
          </Card>

          <Card className="overflow-hidden" hideInfo>
            <ParametersSidebar parameters={parameters} onChange={handleParameterChange} />
          </Card>
        </div>
      </div>
      <ApiUsageDialog 
        isOpen={isApiDialogOpen} 
        onClose={() => setIsApiDialogOpen(false)} 
        modelName={selectedModel} 
      />
    </div>
  )
}

