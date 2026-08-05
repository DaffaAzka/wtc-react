import type { ApiErrorResponse } from "@/types/response";
import type { InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { createApi } from "./create-api";
import { clearAuth } from "@/utils/auth-storage";

export const api = createApi(import.meta.env.VITE_API_URL);

api.interceptors.response.use(
  (response) => {
    if (typeof response.data !== "object" || response.data === null) {
      return Promise.reject({
        message: "Unexpected response format",
      } satisfies ApiErrorResponse);
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
    }

    if (axios.isAxiosError(error) && error.response) {
      return Promise.reject(error.response.data as ApiErrorResponse);
    }

    return Promise.reject(error);
  },
);