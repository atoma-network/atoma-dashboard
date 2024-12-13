import { useState } from "react"
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface LoginRegisterModalProps {
  isOpen: boolean
  onClose: () => void
  error: string | null
  onSubmit: (email: string, password: string, isLogin: boolean) => void
}

export function LoginRegisterModal({ isOpen, onClose, error, onSubmit }: LoginRegisterModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(email, password, isLogin)
  }

  const toggleMode = () => setIsLogin(!isLogin)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-purple-700 dark:text-purple-300">{isLogin ? "Log In" : "Register"}</DialogTitle>
          <DialogDescription className="text-purple-600 dark:text-purple-400">
            {isLogin
              ? "Enter your credentials to access your account."
              : "Create a new account to get started."}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                className="col-span-3 border-purple-200 dark:border-gray-700"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                className="col-span-3 border-purple-200 dark:border-gray-700"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              {isLogin ? "Log In" : "Register"}
            </Button>
            <Button variant="link" onClick={toggleMode} className="text-purple-600 hover:text-purple-700">
              {isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Log In"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
