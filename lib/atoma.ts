import type { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import { WalletAccount } from "@mysten/wallet-standard";
import type { Token } from "./api";

const proxy_url = process.env.NEXT_PUBLIC_PROXY_URL;
const USDC_TYPE = process.env.NEXT_PUBLIC_USDC_TYPE;

export interface NodeSubscription {
  node_small_id: number; // Unique small integer identifier for the node subscription
  task_small_id: number; // Unique small integer identifier for the task
  price_per_one_million_compute_units: number; // Price per 1M compute units for the subscription
  max_num_compute_units: number; // Maximum number of compute units for the subscription
  valid: boolean; // Indicates whether the subscription is valid
}

export enum ModelModality {
  ChatCompletions = "Chat Completions",
  ImagesGenerations = "Images Generations",
  Embeddings = "Embeddings",
}

export interface Token {
  created_at: string; // Creation date of the token
  name: string; // Name of the token
  token_last_4: string; // Last 4 characters of the token
  id: number; // Unique identifier of the token
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
  price_per_one_million_compute_units: number;
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
  model_name: string;
  amount: number;
  requests: number;
  time: number;
}

export interface LatencyResponse {
  timestamp: string; // ISO 8601 formatted date string
  latency: number;
  requests: number;
}

export interface UserProfile {
  email: string;
  name: string;
}

interface RequestOptions {
  path: string;
  post?: boolean;
  body?: object | string;
  use_auth?: boolean;
  accessToken?: string;
}

const request = async <T>({ path, post, body, use_auth, accessToken }: RequestOptions): Promise<T> => {
  const options: RequestInit = {};

  if (post === true) {
    options.method = "POST";
  }
  if (body) {
    options.headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    options.body = JSON.stringify(body);
  }
  if (use_auth) {
    let userSettings = localStorage.getItem("userSettings");
    if (userSettings == null) {
      throw new Error("No user settings");
    }
    let token = accessToken || JSON.parse(userSettings).accessToken;
    if (token == null) {
      throw new Error("No access token");
    }
    options.headers = {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };
  }

  return await fetch(`${proxy_url}/${path}`, options).then((response) => {
    if (!response.ok) {
      if (response.status === 401) {
        // TODO: add automatic logout when the user is unauthorized
        // localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN);
      }
      throw response;
    }
    return response.json();
  });
};

export const getSubscriptions = async (): Promise<NodeSubscription[]> => {
  return await request({ path: "subscriptions" });
};

export const getAllTastks = async (): Promise<[Task, ModelModality[]][]> => {
  return await request({ path: "tasks" });
};

export const getTasks = async (): Promise<[Task, ModelModality[]][]> => {
  const tasks_with_modalities: [Task, ModelModality[]][] = await request({ path: "tasks" });
  // Filter out deprecated tasks and tasks without model names and modalities (no modalities means the proxy doesn't support the task)
  return tasks_with_modalities.filter((task) => !task[0].is_deprecated && !!task[0].model_name && task[1].length > 0);
};

export const registerUser = async (username: string, password: string): Promise<AuthResponse> => {
  return await request({ path: "register", post: true, body: { username, password } });
};

export const loginUser = async (username: string, password: string): Promise<AuthResponse> => {
  return await request({ path: "login", post: true, body: { username, password } });
};

export const generateApiKey = async (): Promise<string> => {
  return await request({ path: "generate_api_token", use_auth: true });
};

export const revokeApiToken = async (api_token: string): Promise<void> => {
  return await request({ path: "revoke_api_token", post: true, body: { api_token }, use_auth: true });
};

export const listApiKeys = async (): Promise<Token[]> => {
  return await request({ path: "api_tokens", use_auth: true });
};

export const getComputeUnitsProcessed = async (): Promise<ComputedUnitsProcessedResponse[]> => {
  return await request({ path: "compute_units_processed?hours=168" });
};

export const getLatency = async (): Promise<LatencyResponse[]> => {
  return await request({ path: "latency?hours=168" });
};

export const getNodesDistribution = async (): Promise<{ country: string; count: number }[]> => {
  return await request({ path: "get_nodes_distribution" });
};

export const getStatsStacks = async (): Promise<StatsStack[]> => {
  return await request({ path: "get_stats_stacks?hours=168" });
};

export const proofRequest = async (signature: string, walletAddress: string): Promise<void> => {
  return await request({
    path: "update_sui_address",
    post: true,
    body: { signature, address: walletAddress },
    use_auth: true,
  });
};

export const usdcPayment = async (txDigest: string, proofSignature?: string): Promise<void> => {
  return await request({
    path: "usdc_payment",
    post: true,
    body: { transaction_digest: txDigest, proof_signature: proofSignature },
    use_auth: true,
  });
};

export const getSuiAddress = async (): Promise<string> => {
  return await request({ path: "get_sui_address", use_auth: true });
};

export const getBalance = async (): Promise<number> => {
  return await request({ path: "balance", use_auth: true });
};

export const getAllStacks = async (): Promise<[Stack, string][]> => {
  return await request({ path: "all_stacks", use_auth: true });
};

export const getUserProfile = async (): Promise<UserProfile> => {
  return await request({ path: "user_profile", use_auth: true });
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  return await request({ path: "set_user_profile", post: true, use_auth: true, body: profile });
};

export const googleOAuth = async (idToken: string): Promise<AuthResponse> => {
  return await request({ path: "google_oauth", post: true, body: idToken });
};

export const getSalt = async (accessToken?: string): Promise<string> => {
  return await request({ path: "salt", use_auth: true, accessToken });
};

export const getGraphs = async (): Promise<[string, [string, string, any][]][]> => {
  return await request({ path: "get_graphs", use_auth: false });
};

export const getGraphData = async (query: any): Promise<any> => {
  return await request({ path: "get_graph_data", post: true, body: query, use_auth: false });
};

export const payUSDC = async (
  amount: number,
  client: SuiClient,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signAndExecuteTransaction: UseMutateAsyncFunction<any, any, any, unknown>,
  account: WalletAccount
): Promise<unknown> => {
  const accountAddress = account.address;
  const { data: coins } = await client.getCoins({
    owner: accountAddress,
    coinType: USDC_TYPE,
  });
  const tx = new Transaction();
  let remainingAmount = Math.floor(amount);
  const selectedCoins = [];

  for (const coin of coins) {
    if (parseInt(coin.balance) >= remainingAmount) {
      const [splitCoin] = tx.splitCoins(coin.coinObjectId, [tx.pure.u64(remainingAmount)]);
      selectedCoins.push(splitCoin);
      remainingAmount = 0;
      break;
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
  tx.setSender(accountAddress);
  return await signAndExecuteTransaction({
    transaction: tx,
    account,
  });
};
