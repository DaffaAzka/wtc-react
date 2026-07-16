import type { ApiErrorResponse } from "@/types/response";
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
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    if (typeof response.data !== "object" || response.data === null) {
      const fallback: ApiErrorResponse = {
        message: "Unexpected response format",
      } as ApiErrorResponse;
      return Promise.reject(fallback);
    }
    return response;
  },
  (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes("/login") ||
      error.config?.url?.includes("/register");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      globalThis.location.href = "/login";
    }

    if (axios.isAxiosError(error) && error.response) {
      return Promise.reject(error.response.data as ApiErrorResponse);
    }

    return Promise.reject(error);
  },
);
