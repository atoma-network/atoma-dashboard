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
          <DialogTitle>API Usage for {modelName}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="curl" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="curl">cURL</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
          </TabsList>
          
          <TabsContent value="curl" className="relative">
            <pre className="relative rounded-lg bg-muted p-4 overflow-x-auto font-mono text-sm">{curlCode}</pre>
          </TabsContent>
          
          <TabsContent value="python" className="relative">
            <pre className="relative rounded-lg bg-muted p-4 overflow-x-auto font-mono text-sm">{pythonCode}</pre>
          </TabsContent>
          
          <TabsContent value="javascript" className="relative">
            <pre className="relative rounded-lg bg-muted p-4 overflow-x-auto font-mono text-sm">{javascriptCode}</pre>
          </TabsContent>
        </Tabs>
        
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-16 right-6 h-8 w-8 hover:bg-muted-foreground/20"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
          <span className="sr-only">Copy code</span>
        </Button>
      </DialogContent>
    </Dialog>
  )
}

