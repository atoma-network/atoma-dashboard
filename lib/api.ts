import axios from "axios";
import { errorHandler } from "./utils"
import config from "../config/config";
import type {
  AuthResponse,
  ComputedUnitsProcessedResponse,
  LatencyResponse,
  ModelModality,
  NodeSubscription,
  Stack,
  StatsStack,
  Task,
  Token,
  UserProfile,
} from "./atoma";

// Create an API client for the credentials API
const credentialsApi = axios.create({
  baseURL: config.ATOMA_CREDENTIALS_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create an API client for the main Atoma API
const atomaApi = axios.create({
  baseURL: config.ATOMA_API_URL,
  timeout: 10000, // Longer timeout for model inference
  headers: {
    "Content-Type": "application/json",
  },
});

// Add authentication interceptor to both clients
const addAuthInterceptor = (apiClient: any) => {
  apiClient.interceptors.request.use(
    (config: any) => {
      let userSettings = localStorage.getItem("userSettings");
      if (!userSettings) {
        throw new Error("User settings not found in local storage");
      }
      const token = JSON.parse(userSettings).accessToken;
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );
};

addAuthInterceptor(credentialsApi);
addAuthInterceptor(atomaApi);

export const getSubscriptions = async () => {
  return await errorHandler(() =>
    credentialsApi.get<NodeSubscription[]>("/subscriptions")
  );
};

export const getAllTasks = async () => {
  return await errorHandler(() =>
    credentialsApi.get<[Task, ModelModality[]][]>("/tasks")
  );
};

export const getTasks = async () => {
  return await errorHandler(async () => {
    const tasks_with_modalities = await getAllTasks();
    // Filter out deprecated tasks and tasks without model names and modalities
    tasks_with_modalities.data = tasks_with_modalities.data.filter(
      ([task, modalities]) =>
        !task.is_deprecated && !!task.model_name && modalities.length > 0
    );
    return tasks_with_modalities;
  });
};

export const registerUser = async (profile: UserProfile, password: string) => {
  return await errorHandler(() =>
    credentialsApi.post<AuthResponse>("/register", {
      user_profile: profile,
      password,
    })
  );
};

export const loginUser = async (email: string, password: string) => {
  return await errorHandler(() =>
    credentialsApi.post<AuthResponse>("/login", { email, password })
  );
};

export const generateApiKey = async (name: string) => {
  return await errorHandler(() =>
    credentialsApi.post<string>("/generate_api_token", name)
  );
};

export const revokeApiToken = async (api_token_id: number) => {
  return await errorHandler(() =>
    credentialsApi.post<void>("/revoke_api_token", api_token_id)
  );
};

export const listApiKeys = async () => {
  return await errorHandler(() => credentialsApi.get<Token[]>("/api_tokens"));
};

export const getComputeUnitsProcessed = async () => {
  return await errorHandler(() =>
    credentialsApi.get<ComputedUnitsProcessedResponse[]>(
      "/compute_units_processed?hours=168"
    )
  );
};

export const getLatency = async () => {
  return await errorHandler(() =>
    credentialsApi.get<LatencyResponse[]>("/latency?hours=168")
  );
};

export const getNodesDistribution = async () => {
  return await errorHandler(() =>
    credentialsApi.get<{ country: string; count: number }[]>(
      "/get_nodes_distribution"
    )
  );
};

export const getStatsStacks = async () => {
  return await errorHandler(() =>
    credentialsApi.get<StatsStack[]>("/get_stats_stacks?hours=168")
  );
};

export const proofRequest = async (
  signature: string,
  walletAddress: string
) => {
  return await errorHandler(() =>
    credentialsApi.post<void>("/update_sui_address", {
      signature,
      address: walletAddress,
    })
  );
};

export const usdcPayment = async (
  txDigest: string,
  proofSignature?: string
) => {
  return await errorHandler(() =>
    credentialsApi.post<void>("/usdc_payment", {
      transaction_digest: txDigest,
      proof_signature: proofSignature,
    })
  );
};

export const getSuiAddress = async () => {
  return await errorHandler(() =>
    credentialsApi.get<string>("/get_sui_address")
  );
};

export const getBalance = async () => {
  return await errorHandler(() => credentialsApi.get<number>("/balance"));
};

export const getAllStacks = async () => {
  return await errorHandler(() =>
    credentialsApi.get<[Stack, string][]>("/all_stacks")
  );
};

export const getUserProfile = async () => {
  return await errorHandler(() =>
    credentialsApi.get<UserProfile>("/user_profile")
  );
};

export const saveUserProfile = async (profile: UserProfile) => {
  return await errorHandler(() =>
    credentialsApi.post<void>("/set_user_profile", profile)
  );
};

export const googleOAuth = async (idToken: string) => {
  return await errorHandler(() =>
    credentialsApi.post<AuthResponse>("/google_oauth", idToken)
  );
};

export const getSalt = async () => {
  return await errorHandler(() => credentialsApi.get<string>("/salt"));
};

export const getGraphs = async () => {
  return await errorHandler(() =>
    credentialsApi.get<[string, [string, string, any][]][]>("/get_graphs")
  );
};

export const getGraphData = async (query: any) => {
  return await errorHandler(() =>
    credentialsApi.post<any>("/get_graph_data", query)
  );
};


