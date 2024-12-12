"use client"

import { User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function UserProfileIcon() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-purple-300 hover:text-purple-200 dark:text-purple-300 dark:hover:text-purple-200"
          >
            <User className="h-5 w-5" />
            <span className="sr-only">User profile</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>User001</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

