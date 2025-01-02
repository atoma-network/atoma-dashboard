import type { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

const proxy_url = process.env.NEXT_PUBLIC_PROXY_URL;
const USDC_TYPE = process.env.NEXT_PUBLIC_USDC_TYPE;

export interface NodeSubscription {
  node_small_id: number; // Unique small integer identifier for the node subscription
  task_small_id: number; // Unique small integer identifier for the task
  price_per_compute_unit: number; // Price per compute unit for the subscription
  max_num_compute_units: number; // Maximum number of compute units for the subscription
  valid: boolean; // Indicates whether the subscription is valid
}

export interface Task {
  task_small_id: number; // Unique small integer identifier for the task
  task_id: string; // Unique string identifier for the task
  role: number; // Role associated with the task (encoded as an integer)
  model_name?: string; // Optional name of the model used for the task
  is_deprecated: boolean; // Indicates whether the task is deprecated
  valid_until_epoch?: number; // Optional epoch timestamp until which the task is valid
  deprecated_at_epoch?: number; // Optional epoch timestamp when the task was deprecated
  security_level: number; // Security level of the task (encoded as an integer)
  minimum_reputation_score?: number; // Optional minimum reputation score required for the task
}

export interface StatsStack {
  // Timestamp of the stats
  timestamp: string; // ISO 8601 formatted date string
  // Number of compute units acquired
  num_compute_units: number;
  // Number of compute units processed
  settled_num_compute_units: number;
}

export interface Stack {
  // Address of the owner of the stack
  owner: string;
  // Unique small integer identifier for the stack
  stack_small_id: number;
  // Unique string identifier for the stack
  stack_id: string;
  // Small integer identifier of the associated task
  task_small_id: number;
  // Identifier of the selected node for computation
  selected_node_id: number;
  // Total number of compute units in this stack
  num_compute_units: number;
  // Price of the stack (likely in smallest currency unit)
  price: number;
  // Number of compute units already processed
  already_computed_units: number;
  // Indicates whether the stack is currently in the settle period
  in_settle_period: boolean;
  // Joint concatenation of Blake2b hashes of each payload and response pairs that was already processed
  // by the node for this stack.
  total_hash: Uint8Array;
  // Number of payload requests that were received by the node for this stack.
  num_total_messages: number;
  // Created_at timestamp in ISO 8601 format
  created_at: string;
  // Created_at timestamp in ISO 8601 format
  settled_at: string;
}

export interface AuthResponse {
  refresh_token: string;
  access_token: string;
}

export interface ComputedUnitsProcessedResponse {
  timestamp: string; // ISO 8601 formatted date string
  model_name: string,
  amount: number;
  requests: number;
  time: number;
}

export interface LatencyResponse {
  timestamp: string; // ISO 8601 formatted date string
  latency: number;
  requests: number;
}

export const getSubscriptions = async (): Promise<NodeSubscription[]> => {
  return await fetch(`${proxy_url}/subscriptions`).then((response) => response.json());
};

export const getTasks = async (): Promise<Task[]> => {
  return await fetch(`${proxy_url}/tasks`).then((response) => response.json());
};

export const registerUser = async (username: string, password: string): Promise<AuthResponse> => {
  return await fetch(`${proxy_url}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  }).then((response) => response.json());
};

export const loginUser = async (username: string, password: string): Promise<AuthResponse> => {
  return await fetch(`${proxy_url}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json()
  });
};

export const generateApiKey = async (): Promise<string> => {
  return await fetch(`${proxy_url}/generate_api_token`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  }).then((response) => response.json());
}

export const revokeApiToken = async (api_token:string): Promise<void> => {
  await fetch(`${proxy_url}/revoke_api_token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ api_token }),
  });
}

export const listApiKeys = async (): Promise<string[]> => {
  return await fetch(`${proxy_url}/api_tokens`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json()
  });
}

export const getComputeUnitsProcessed = async (): Promise<ComputedUnitsProcessedResponse[]> => {
  return await fetch(`${proxy_url}/compute_units_processed?hours=24`).then((response) => response.json());
}

export const getLatency = async (): Promise<LatencyResponse[]> => {
  return await fetch(`${proxy_url}/latency?hours=24`).then((response) => response.json());
}

export const getNodesDistribution = async (): Promise<{country:string, count:number }[]> => {
  return await fetch(`${proxy_url}/get_nodes_distribution`).then((response) => response.json());
}

export const getStatsStacks = async (): Promise<StatsStack[]> => {
  return await fetch(`${proxy_url}/get_stats_stacks?hours=24`).then((response) => response.json());
}

export const proofRequest = async (signature: string, walletAddress: string): Promise<void> => {
  await fetch(`${proxy_url}/update_sui_address`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ signature, address:walletAddress }),
  });
}

export const usdcPayment = async (txDigest: string): Promise<void> => {
  await fetch(`${proxy_url}/usdc_payment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transaction_digest: txDigest }),
  });
}

export const getSuiAddress = async (): Promise<string> => {
  return await fetch(`${proxy_url}/get_sui_address`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  }).then((response) => response.json());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const payUSDC = async (client: SuiClient, signAndExecuteTransaction: UseMutateAsyncFunction<any, any, any, unknown>, currentWallet: import("@mysten/wallet-standard").WalletWithRequiredFeatures): Promise<unknown> => {
  const amount = 1;
  const { data: coins } = await client.getCoins({
    owner: currentWallet.accounts[0].address,
    coinType: USDC_TYPE,
  });
  const tx = new Transaction();
  let remainingAmount = amount;
  const selectedCoins = [];

  for (const coin of coins) {
    if (remainingAmount <= 0) break;
    if (parseInt(coin.balance) >= remainingAmount) {
      const [splitCoin] = tx.splitCoins(coin.coinObjectId, [tx.pure.u64(remainingAmount)]);
      selectedCoins.push(splitCoin);
      remainingAmount = 0;
    } else {
      selectedCoins.push(coin.coinObjectId);
      remainingAmount -= parseInt(coin.balance);
    }
  }

  if (remainingAmount > 0) {
    throw new Error("Insufficient balance to cover the amount");
  }
  if (process.env.NEXT_PUBLIC_PROXY_WALLET == null) {
    throw new Error("Proxy wallet address not found");
  }
  tx.transferObjects(selectedCoins, process.env.NEXT_PUBLIC_PROXY_WALLET);
  tx.setSender(currentWallet.accounts[0].address);
  return await signAndExecuteTransaction(
    {
      transaction: tx,
    });
}
