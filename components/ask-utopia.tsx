"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bot, X } from 'lucide-react'

export function AskUtopia() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-[350px] shadow-lg border-purple-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Ask Utopia
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[300px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
              <div className="space-y-4">
                <div className="flex gap-2 items-start">
                  <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1" />
                  <p className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg text-sm">
                    Hello! I&apos;m Utopia, your AI assistant. How can I help you today?
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex w-full gap-2">
              <Input 
                placeholder="Type your message..." 
                className="border-purple-200 dark:border-gray-700"
              />
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Send</Button>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center gap-2"
        >
          <Bot className="h-5 w-5" />
          Ask Utopia
        </Button>
      )}
    </div>
  )
}

