"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ApiUsageDialogProps {
  isOpen: boolean
  onClose: () => void
  modelName: string
}

export function ApiUsageDialog({ isOpen, onClose, modelName }: ApiUsageDialogProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("curl")

  // Determine the endpoint based on the model name
  const getEndpoint = () => {
    if (modelName.includes("meta-llama") || 
        modelName.includes("deepseek-ai")) {
      return "/v1/chat/completions"
    } else if (modelName.includes("black-forest-labs/FLUX")) {
      return "/v1/images/generations"
    } else if (modelName.includes("intfloat/multilingual")) {
      return "/v1/embeddings"
    } else {
      // Default to chat completions
      return "/v1/chat/completions"
    }
  }

  // Generate the appropriate request body based on the model
  const getRequestBody = () => {
    if (getEndpoint() === "/v1/chat/completions") {
      return `{
  "model": "${modelName}",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "What is the capital of France?"
    }
  ],
  "max_tokens": 128,
  "temperature": 0.7,
  "top_p": 0.7,
  "top_k": 50,
  "repetition_penalty": 1.0
}`
    } else if (getEndpoint() === "/v1/images/generations") {
      return `{
  "model": "${modelName}",
  "prompt": "A serene landscape with mountains",
  "n": 1,
  "size": "1024x1024"
}`
    } else {
      return `{
  "model": "${modelName}",
  "input": "The food was delicious and the waiter..."
}`
    }
  }

  // Generate curl command
  const curlCode = `curl https://api.atoma.network${getEndpoint()} \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer $YOUR_API_KEY" \\
-d '${getRequestBody()}'`

  // Generate Python code
  const pythonCode = `import requests

url = "https://api.atoma.network${getEndpoint()}"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
}

payload = ${getRequestBody()}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`

  // Generate JavaScript code
  const javascriptCode = `const fetch = require('node-fetch');

const url = 'https://api.atoma.network${getEndpoint()}';
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify(${getRequestBody()})
};

fetch(url, options)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`

  const copyToClipboard = () => {
    const codeMap = {
      curl: curlCode,
      python: pythonCode,
      javascript: javascriptCode
    }
    
    navigator.clipboard.writeText(codeMap[activeTab as keyof typeof codeMap])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>API Usage: {modelName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            </TabsList>
            <div className="mt-4 rounded-md bg-muted/50 p-4">
              <pre className="overflow-x-auto min-h-[280px] flex items-start">
                <code className="text-sm">{activeTab === "curl" ? curlCode : activeTab === "python" ? pythonCode : javascriptCode}</code>
              </pre>
            </div>
          </Tabs>
          <div className="flex gap-2">
            <Button onClick={copyToClipboard} className="w-[100px]">
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

