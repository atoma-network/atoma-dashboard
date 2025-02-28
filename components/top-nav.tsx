"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSettings } from "@/contexts/settings-context"
import api from "@/lib/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import AuthForm from "@/components/AuthForm"
import Modal from "@/components/Modal"

export function TopNav() { 
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean)
  const { settings } = useSettings()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [authType, setAuthType] = useState("login")
  const [username,setUsername]= useState('user')
  useEffect(() => {

    const token = sessionStorage.getItem('atoma_access_token')
    setIsAuthenticated(!!token) 
 
  }, [])

  const handleAuth = (type: string) => {
    setAuthType(type)
    setShowAuthForm(true)
  }

  const closeAuthForm = () => {
    setShowAuthForm(false)
  }

 useEffect(()=>{
  let accessToken = sessionStorage.getItem('atoma_access_token')
   if(accessToken){
    (async()=>{
    try {
      let res = await api.get('/user_profile')
      sessionStorage.setItem('atoma_username',res.data.username);
      setUsername(res.data.username)
    } catch (error) {
      console.log(error)
    }
    })()
   }
 },[])
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-end pl-1 pr-4">
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleAuth("login")} className="w-24">
                Login
              </Button>
              <Button onClick={() => handleAuth("register")} className="w-24">
                Register
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 hover:bg-transparent">
                  <Avatar className="h-8 w-8">
                    <div
                      className="h-full w-full rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: "#" + settings.avatar.split("background=")[1] }}
                    >
                      {username[0].toUpperCase()}
                    </div>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{username.toUpperCase()}</p>
                   
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <div className="flex items-center justify-between w-full">
                    <span>Theme</span>
                    <ThemeToggle />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  sessionStorage.removeItem('atoma_access_token') // Clear token on logout
                  sessionStorage.removeItem('atoma_refresh_token')
                  setIsAuthenticated(false) // Update authentication state
                }}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <Modal isOpen={showAuthForm} onClose={closeAuthForm}>
        <AuthForm type={authType} onClose={closeAuthForm} />
      </Modal>
    </header>
  )
}

