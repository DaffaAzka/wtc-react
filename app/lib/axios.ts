import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof globalThis !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (typeof globalThis !== "undefined") {
      const isAuthEndpoint =
        error.config?.url?.includes("/login") ||
        error.config?.url?.includes("/register");

      if (error.response?.status === 401 && !isAuthEndpoint) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        globalThis.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    if (typeof response.data !== "object" || response.data === null) {
      return Promise.reject(new Error(response.data ?? "Unknown error"));
    }
    return response;
  },
  (error) => Promise.reject(error),
);
