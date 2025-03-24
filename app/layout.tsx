import "./globals.css";

import "primereact/resources/themes/lara-light-cyan/theme.css";

import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/settings-context";
import { AppStateProvider } from "@/contexts/app-state";
import type React from "react";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import SuiWrap from "@/contexts/SuiWrap";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AtomCloud Dashboard",
  description: "A modern, responsive financial dashboard",
  generator: "v0.dev",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SettingsProvider>
          <AppStateProvider>
            <SuiWrap>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <TooltipProvider delayDuration={0}>
                  <ClientWrapper>
                    <div className="min-h-screen flex bg-background dark:bg-darkMode">
                      <Sidebar />
                      <div className="flex-1">
                        <TopNav />
                        <div className="container mx-auto p-4 max-w-[1600px]">
                          <main className="w-full">{children}</main>
                        </div>
                      </div>
                    </div>
                  </ClientWrapper>
                  <Toaster />
                </TooltipProvider>
              </ThemeProvider>
            </SuiWrap>
          </AppStateProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import ClientWrapper from "./client-wrapper";
