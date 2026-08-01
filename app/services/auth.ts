import { authApi } from "@/lib/auth-api";

export const authService = {
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