"use client";
import Dashboard from "@/components/dashboard";

import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";

import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@mysten/dapp-kit/dist/index.css";
import { useState } from "react";

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

export default function Home() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect={true}>
          <Dashboard />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
