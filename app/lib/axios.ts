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
    if (typeof window !== "undefined") {
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
    if (typeof window !== "undefined") {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/sign-in";
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
