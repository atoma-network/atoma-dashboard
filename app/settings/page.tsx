"use client";

import { useSettings } from "@/contexts/settings-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BackgroundGrid } from "@/components/background-grid";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { getUserProfile, saveUserProfile } from "@/lib/api";

export default function SettingsPage() {
  const [userProfile, setUserProfile] = useState({ email: "" });
  const { settings } = useSettings();
  const [loggedIn, setLoggedIn] = useState(false);
  const [address, setAddress] = useState<string>();
  const account = useCurrentAccount();

  useEffect(() => {
    (async () => {
      setLoggedIn(settings.loggedIn);
      if (settings.loggedIn) {
        let profile = await getUserProfile();
        setUserProfile(profile.data);
        if (settings.zkLogin.isEnabled) {
          setAddress(settings.zkLogin.address);
        } else {
          console.log("account?.address", account?.address);
          setAddress(account?.address);
        }
      } else {
        setAddress(undefined);
        setUserProfile({ email: "" });
      }
    })();
  }, [settings.loggedIn, account]);

  return (
    <div className="relative min-h-screen w-full">
      <BackgroundGrid />
      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto py-10">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>

          {/* Account Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={userProfile.email} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet">Wallet Address</Label>
                <Input id="wallet" value={address || ""} readOnly className="bg-muted" disabled={!loggedIn} />
              </div>
              <div className="space-y-2 pt-4 border-t">
                <Label>Interface Preferences</Label>
                <p className="text-sm text-muted-foreground mb-4">Toggle between light and dark mode</p>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
