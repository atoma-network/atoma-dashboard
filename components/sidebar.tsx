"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Network,
  Settings,
  HelpCircle,
  Menu,
  ChevronLeft,
  Box,
  PlayCircle,
  FileText,
  LayoutDashboard,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useSettings } from "@/contexts/settings-context";

const navigation = [
  { name: "Network Status", href: "/", icon: Network },
  { name: "Account Portal", href: "/account-portal", icon: LayoutDashboard },
  { name: "Models", href: "/models", icon: Box },
  { name: "Playground", href: "/playground", icon: PlayCircle },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Docs", href: "https://docs.atoma.network/cloud-api-reference/get-started", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
  {
    name: "Help",
    href: "https://docs.google.com/forms/d/e/1FAIpQLSeE-AV0oEfo6YGtzo0Ts_vvnm8Crtf1kVhdBtANulH11c0OTA/viewform",
    icon: HelpCircle,
  },
];

// Remove or empty the bottomNavigation array since we moved its items
const bottomNavigation: any = [];

export function Sidebar() {
  const pathname = usePathname();
  // Initialize state with defaults that work for both server and client
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { settings } = useSettings();

  // Mount effect to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const NavItem: React.FC<{ item: any; isBottom?: boolean }> = ({ item, isBottom = false }) => (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        {item.href.startsWith("http") ? (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center rounded-md px-4 py-3 text-base font-medium transition-colors",
              pathname === item.href
                ? "bg-secondary dark:bg-[#27272a] text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:dark:bg-[#27272a] hover:text-secondary-foreground",
              isCollapsed && "justify-center px-3"
            )}
          >
            <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>{item.name}</span>}
          </a>
        ) : (
          <Link
            href={item.href}
            className={cn(
              "flex items-center rounded-md px-4 py-3 text-base font-medium transition-colors",
              pathname === item.href
                ? "bg-secondary dark:bg-[#27272a] text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:dark:bg-[#27272a] hover:text-secondary-foreground",
              isCollapsed && "justify-center px-3"
            )}
          >
            <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        )}
      </TooltipTrigger>
      {isCollapsed && mounted && (
        <TooltipContent side="right" className="flex items-center gap-4">
          {item.name}
        </TooltipContent>
      )}
    </Tooltip>
  );

  // Only render the full component after client-side hydration
  if (!mounted) {
    return (
      <div
        className={cn(
          "fixed inset-y-0 z-20 flex flex-col bg-background border-r border-border transition-all duration-300 ease-in-out lg:static",
          "w-60",
          "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Minimal content for server rendering */}
        <div className="border-b border-border dark:bg-darkMode">
          <div className="flex h-16 items-center gap-2 px-4 dark:bg-darkMode">
            <div className="flex items-center font-semibold">
              <div className="h-[140px] w-[140px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <>
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background rounded-md shadow-md"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div
          className={cn(
            "fixed inset-y-0 z-20 flex flex-col bg-background border-r border-border transition-all duration-300 ease-in-out lg:static",
            isCollapsed ? "w-[56px]" : "w-60",
            isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="border-b border-border dark:bg-darkMode">
            <div
              className={cn(
                "flex h-16 items-center justify-between px-4 dark:bg-darkMode",
                isCollapsed && "justify-center px-2"
              )}
            >
              {!isCollapsed && (
                <Link href="/" className="flex items-center font-semibold relative mr-auto">
                  <Image alt="atoma logo" src="/atoma_logo_cropped.svg" height={110} width={110} className="ml-0 " />
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={cn("ml-auto h-8 w-8", isCollapsed && "ml-0")}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <ChevronLeft className={cn("h-10 w-10 transition-transform", isCollapsed && "rotate-180")} />
                <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"} Sidebar</span>
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto dark:bg-darkMode">
            <nav className="flex-1 space-y-2 px-2 py-4 dark:text-[#8f8f98]">
              {navigation.map(item => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </div>
          <div className="border-t border-border p-2">
            <nav className="space-y-1">
              {bottomNavigation.map((item: any) => (
                <NavItem key={item.name} item={item} isBottom />
              ))}
            </nav>
          </div>
        </div>
      </>
    </TooltipProvider>
  );
}
