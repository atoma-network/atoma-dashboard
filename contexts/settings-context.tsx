"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

export interface UserSettings {
  loggedIn: boolean;
  accessToken?: string;
  avatar: string;
  zkLogin: {
    isEnabled: boolean;
    idToken?: string;
    secretKey?: string;
    randomness?: string;
    maxEpoch?: number;
    zkp?: string;
  };
  // fullName: string
  // email: string
  // phone: string
  // timezone: string
  // language: string
  // currency: string
  // dateFormat: string
  // fontSize: number
  // theme: "light" | "dark" | "system"
  // layout: "default" | "compact" | "expanded"
  notifications: {
    //   email: boolean
    //   push: boolean
    //   sms: boolean
    //   accountActivity: boolean
    //   newFeatures: boolean
    //   marketing: boolean
    //   frequency: "real-time" | "daily" | "weekly"
    //   quietHoursStart: string
    //   quietHoursEnd: string
  };
  privacy: {
    //   analyticsSharing: boolean
    //   personalizedAds: boolean
    //   visibility: "public" | "private"
    //   dataRetention: "6-months" | "1-year" | "2-years" | "indefinite"
  };
}

const defaultSettings: UserSettings = {
  loggedIn: false,
  zkLogin: {
    isEnabled: false,
  },
  avatar: "/placeholder.svg?height=400&width=400&background=8B5CF6", // Purple
  // fullName: "Dollar Singh",
  // email: "dollar.singh@example.com",
  // phone: "+1 (555) 123-4567",
  // timezone: "utc-8",
  // language: "en",
  // currency: "usd",
  // dateFormat: "mm-dd-yyyy",
  // fontSize: 16,
  // theme: "system",
  // layout: "default",
  notifications: {
    //   email: true,
    //   push: true,
    //   sms: false,
    //   accountActivity: true,
    //   newFeatures: true,
    //   marketing: false,
    //   frequency: "real-time",
    //   quietHoursStart: "22:00",
    //   quietHoursEnd: "07:00",
  },
  privacy: {
    //   analyticsSharing: true,
    //   personalizedAds: false,
    //   visibility: "public",
    //   dataRetention: "1-year",
  },
};

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  updateZkLoginSettings: (newSettings: Partial<UserSettings["zkLogin"]>) => void;
  updateNotificationSettings: (settings: Partial<UserSettings["notifications"]>) => void;
  updatePrivacySettings: (settings: Partial<UserSettings["privacy"]>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(() => {
    // Try to load settings from localStorage during initialization
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      }
    }
    return defaultSettings;
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("userSettings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateZkLoginSettings = (zkLoginSettings: Partial<UserSettings["zkLogin"]>) => {
    setSettings((prev) => ({
      ...prev,
      zkLogin: { ...prev.zkLogin, ...zkLoginSettings },
    }));
  };

  const updateNotificationSettings = (notificationSettings: Partial<UserSettings["notifications"]>) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...notificationSettings },
    }));
  };

  const updatePrivacySettings = (privacySettings: Partial<UserSettings["privacy"]>) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, ...privacySettings },
    }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateZkLoginSettings,
        updateNotificationSettings,
        updatePrivacySettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

