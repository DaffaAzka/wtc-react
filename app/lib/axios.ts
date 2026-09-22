import type { ApiErrorResponse } from "@/types/response";
import type { InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { createApi } from "./create-api";
import { clearAuth } from "@/utils/auth-storage";

export const api = createApi(import.meta.env.VITE_API_URL);

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
      return Promise.reject({
        message: "Unexpected response format",
      } satisfies ApiErrorResponse);
    }

    return response;
  },
  (error) => {
    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const pathname = window.location.pathname;

    if (status === 401) {
      /*
       * Token is invalid, expired, or the user was deleted.
       * Wipe all auth state and force a full-page navigation to the home
       * page. A hard navigation (not React Router navigate) is intentional:
       * it tears down all in-memory React state so nothing stale survives.
       */
      clearAuth();
      if (!pathname.startsWith("/login")) {
        window.location.href = "/";
      }
    }

    if (status === 403) {
      /*
       * Permission denied. In normal usage a correctly-authenticated user
       * should never hit a 403 from the API — the UI only exposes actions
       * they are allowed to take and layout guards block protected routes.
       *
       * A 403 therefore means one of:
       *   1. The user's role was changed server-side.
       *   2. localStorage was manually tampered (active_view or user.roles).
       *   3. A bug in the app surfaced a forbidden action.
       *
       * In all three cases the safest response is to clear the persisted
       * view and reload so the auth bootstrap re-fetches /me and
       * re-establishes the correct role from the server.
       *
       * We intentionally do NOT read from localStorage here — tampered
       * localStorage is the attack vector, so we can't trust it to decide
       * whether to redirect.
       */
      localStorage.removeItem("active_view");
      window.location.href = "/";
    }

    if (axios.isAxiosError(error) && error.response) {
      return Promise.reject(error.response.data as ApiErrorResponse);
    }

    return Promise.reject(error);
  },
);
