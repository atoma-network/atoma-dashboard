"use client"

import { useSettings } from "@/contexts/settings-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { BackgroundGrid } from "@/components/background-grid"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()

  const handleSaveAccount = () => {
    updateSettings({
      fullName: settings.fullName,
      email: settings.email,
      phone: settings.phone,
      timezone: settings.timezone,
    })
    toast.success("Account settings saved successfully")
  }

  return (
    <div className="relative min-h-screen w-full">
      <BackgroundGrid />
      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>

          {/* Account Settings Card */}
          <Card hideInfo>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full-name">Name</Label>
                <Input
                  id="full-name"
                  defaultValue="Marcus"
                  onChange={(e) => updateSettings({ fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="marcus@example.com"
                  onChange={(e) => updateSettings({ email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet">Wallet Address</Label>
                <Input id="wallet" value="0x71C7656EC7ab88b098defB751B7401B5f6d8976F" readOnly className="bg-muted" />
              </div>
              <div className="space-y-2 pt-4 border-t">
                <Label>Interface Preferences</Label>
                <p className="text-sm text-muted-foreground mb-4">Toggle between light and dark mode</p>
                <ThemeToggle />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAccount}>Save Account Settings</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

