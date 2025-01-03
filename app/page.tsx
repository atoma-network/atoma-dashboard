"use client";
import Dashboard from "@/components/dashboard";

import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";

import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mysten/dapp-kit/dist/index.css";
import { useState } from "react";
import { GlobalStateProvider } from "./GlobalStateContext";

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

export default function Home() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
          <WalletProvider autoConnect={true}>
            <GlobalStateProvider>
              <Dashboard />
            </GlobalStateProvider>
          </WalletProvider>
        </SuiClientProvider>
        </QueryClientProvider>
    </>
  );
}
