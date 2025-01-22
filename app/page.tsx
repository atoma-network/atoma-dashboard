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
      <link rel="apple-touch-icon" type="image/png" sizes="180x180" href="https://mintlify.s3-us-west-1.amazonaws.com/atoma/_generated/favicon/apple-touch-icon.png?v=3"/>
      <link rel="icon" type="image/png" sizes="32x32" href="https://mintlify.s3-us-west-1.amazonaws.com/atoma/_generated/favicon/favicon-32x32.png?v=3"/>
      <link rel="icon" type="image/png" sizes="16x16" href="https://mintlify.s3-us-west-1.amazonaws.com/atoma/_generated/favicon/favicon-16x16.png?v=3"/>
      <link rel="shortcut icon" type="image/x-icon" href="https://mintlify.s3-us-west-1.amazonaws.com/atoma/_generated/favicon/favicon.ico?v=3" />
      <script src="https://accounts.google.com/gsi/client" async defer></script>
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
