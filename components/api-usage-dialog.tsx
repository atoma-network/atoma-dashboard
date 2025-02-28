"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface ApiUsageDialogProps {
  isOpen: boolean
  onClose: () => void
  modelName: string
}

export function ApiUsageDialog({ isOpen, onClose, modelName }: ApiUsageDialogProps) {
  const [copied, setCopied] = useState(false)

  const apiCode = `curl https://api.atoma.network${
    modelName.includes("Chat")
      ? "/v1/chat/completions"
      : modelName.includes("Images")
        ? "/v1/images/generations"
        : "/v1/embeddings"
  } \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer $YOUR_API_KEY" \\
-d '{
  ${
    modelName.includes("Chat")
      ? `
  "model": "llama-3.3-70b",
  "messages": [{
    "role": "user",
    "content": "What is the capital of France?"
  }],
  "max_tokens": 128
  `
      : modelName.includes("Images")
        ? `
  "prompt": "A serene landscape with mountains",
  "n": 1,
  "size": "1024x1024"
  `
        : `
  "input": "The food was delicious and the waiter...",
  "model": "multilingual-e5-large"
  `
  }
}'`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>API Usage for {modelName}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <pre className="relative rounded-lg bg-muted p-4 overflow-x-auto font-mono text-sm">{apiCode}</pre>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 h-8 w-8 hover:bg-muted-foreground/20"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
            <span className="sr-only">Copy code</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

