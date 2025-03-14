"use client";

import type React from "react";

import { createContext, useContext, useState } from "react";

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
    address?: string;
  };
}

const defaultSettings: UserSettings = {
  loggedIn: false,
  zkLogin: {
    isEnabled: false,
  },
  avatar: "/placeholder.svg?height=400&width=400&background=8B5CF6", // Purple
};

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  updateZkLoginSettings: (newSettings: Partial<UserSettings["zkLogin"]>) => void;
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

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updatedSettings = { ...prev, ...newSettings };
      localStorage.setItem("userSettings", JSON.stringify(updatedSettings)); // update here, to take effect immediately
      return updatedSettings;
    });
  };

  const updateZkLoginSettings = (zkLoginSettings: Partial<UserSettings["zkLogin"]>) => {
    setSettings(prev => {
      const updatedSettings = {
        ...prev,
        zkLogin: { ...prev.zkLogin, ...zkLoginSettings },
      };
      localStorage.setItem("userSettings", JSON.stringify(updatedSettings)); // update here, to take effect immediately
      return updatedSettings;
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateZkLoginSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
