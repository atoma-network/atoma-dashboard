"use client";

import { useEffect, useState } from "react";
import { Activity, Cloud, BookOpen, Server } from "lucide-react";
import { NodeStatusView } from "@/components/node-status-view";
import { GuideView } from "@/components/guide-view";
import { CloudView } from "@/components/cloud-view";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeProvider, useTheme } from "next-themes";
// import { AskUtopia } from "@/components/ask-utopia";
import { LoginRegisterButton } from "@/components/login-register-button";
import { UserProfileIcon } from "./user-profile-icon";
import { useGlobalState } from "@/app/GlobalStateContext";
import Image from "next/image";
import { NodeRegistrationView } from "./node-registration-view";

type TabType = "node-status" | "cloud" | "guide" | "node-registration";

const mainTabs = [
  { id: "node-status", icon: Activity, label: "Network Status" },
  { id: "cloud", icon: Cloud, label: "Developer Portal" },
  { id: "guide", icon: BookOpen, label: "Guide" },
  { id: "node-registration", icon: Server, label: "Node Registration" },
] as const;

function Logo() {
  const { resolvedTheme } = useTheme();
  const [logoSrc, setLogoSrc] = useState("/atoma_logo_dark.png");
  useEffect(() => {
    if (resolvedTheme === "dark") {
      setLogoSrc("/atoma_logo_dark.png");
    } else {
      setLogoSrc("/atoma_logo.png");
    }
  }, [resolvedTheme]);
  return <Image src={logoSrc} alt="Atoma" width={177} height={62} />;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("node-status");
  const { logState } = useGlobalState();
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex flex-col h-screen bg-white dark:bg-[#1A1C23]">
        <header className="bg-white dark:bg-[#1A1C23] border-b border-purple-100 dark:border-purple-800/30 p-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {logState === "loggedIn" ? (
                <UserProfileIcon />
              ) : logState === "loggingIn" ? (
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="inline w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <LoginRegisterButton />
              )}
            </div>
          </div>
          <nav className="mt-4">
            <ul className="flex space-x-4">
              {mainTabs.map(({ id, icon: Icon, label }) => (
                <li key={id}>
                  <button
                    onClick={() => setActiveTab(id as TabType)}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      activeTab === id
                        ? "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300"
                        : "text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                    }`}
                  >
                    <Icon className="mr-2 h-5 w-5" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-[#1A1C23]">
          {activeTab === "node-status" && <NodeStatusView />}
          {activeTab === "cloud" && <CloudView />}
          {activeTab === "guide" && <GuideView />}
          {activeTab === "node-registration" && <NodeRegistrationView />}
        </main>

        {/* <AskUtopia /> */}
      </div>
    </ThemeProvider>
  );
}
