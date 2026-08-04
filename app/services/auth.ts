import { authApi } from "@/lib/auth-api";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/response";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type AuthResponse = {
  user: {
    id: string;
    puid: string | null;
    name: string;
    email: string;
    provider: string;
    avatar: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
  };
  profile: {
    id: string;
    user_id: string;
    study_class_id: string | null;
    display_name: string;
    points: number;
    last_login_at: string | null;
    last_synced_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    roles: Array<{
      name: string;
    }>;
  };
  token: string;
};

export const authService = {
  // Regular API methods (VITE_API_URL)
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>("/login", request);
    return response.data.data!;
  },

  register: async (request: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>("/register", request);
    return response.data.data!;
  },

  // Auth API methods (VITE_AUTH_URL)
  me() {
    return authApi.get("/api/auth/me");
  },

  refresh(refreshToken: string) {
    return authApi.post("/api/auth/refresh", {
      refresh_token: refreshToken,
    });
  },

  logout(refreshToken: string) {
    return authApi.post("/api/auth/logout", {
      refresh_token: refreshToken,
      client_id: "lms",
      redirect_uri: window.location.origin,
    });
  },
};