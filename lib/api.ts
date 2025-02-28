import axios from "axios";
import config from "../config";

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
      const token = sessionStorage.getItem("atoma_access_token");
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
