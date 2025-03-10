import axios from "axios";
import config from "../config/config";

const LATENCY = (hours: number) => `/latency?hours=${hours}`;
const COMPUTE_UNITS_PROCESSED = (hours: number) => `/compute_units_processed?hours=${hours}`;

export const ALL_STACKS = "/all_stacks";
export const BALANCE = "/balance";
export const COMPUTE_UNITS_PROCESSED_168 = COMPUTE_UNITS_PROCESSED(168);
export const GENERATE_API_TOKEN = "/generate_api_token";
export const GET_NODES_DISTRIBUTION = "/get_nodes_distribution";
export const GET_SUI_ADDRESS = "/get_sui_address";
export const LATENCY_168 = LATENCY(168);
export const SUBSCRIPTIONS = "/subscriptions";
export const TASKS = "/tasks";
export const USDC_PAYMENT = "/usdc_payment";

export enum ModelModality {
  ChatCompletions = "Chat Completions",
  ImagesGenerations = "Images Generations",
  Embeddings = "Embeddings",
}

export interface NodeSubscription {
  node_small_id: number; // Unique small integer identifier for the node subscription
  task_small_id: number; // Unique small integer identifier for the task
  price_per_one_million_compute_units: number; // Price per 1M compute units for the subscription
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

// Export a default API object with both clients
export default {
  credentials: credentialsApi,
  atoma: atomaApi,

  // Helper method to determine which API to use based on the URL
  post: (url: string, data: any, config?: any) => {
    if (url.startsWith("/v1/")) {
      return atomaApi.post(url, data, config);
    } else {
      return credentialsApi.post(url, data, config);
    }
  },

  get: (url: string, config?: any) => {
    if (url.startsWith("/v1/")) {
      return atomaApi.get(url, config);
    } else {
      return credentialsApi.get(url, config);
    }
  },

  put: (url: string, data: any, config?: any) => {
    if (url.startsWith("/v1/")) {
      return atomaApi.put(url, data, config);
    } else {
      return credentialsApi.put(url, data, config);
    }
  },

  delete: (url: string, config?: any) => {
    if (url.startsWith("/v1/")) {
      return atomaApi.delete(url, config);
    } else {
      return credentialsApi.delete(url, config);
    }
  },
};

export const proofRequest = async (signature: string, walletAddress: string): Promise<void> => {
  return await credentialsApi.post("/update_sui_address", { signature, address: walletAddress });
};
