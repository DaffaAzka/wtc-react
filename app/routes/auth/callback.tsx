import { useEffect } from "react";
import { useNavigate } from "react-router";

import { api } from "@/lib/axios";
import { saveRefreshToken, saveToken, saveUser } from "@/utils/auth-storage";
import { authApi } from "@/lib/auth-api";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const finishLogin = async () => {
      const params = window.location.hash ? new URLSearchParams(window.location.hash.substring(1)) : new URLSearchParams(window.location.search);

      const pinatAccessToken = params.get("access_token");

      const refreshToken = params.get("refresh_token");

      const sessionId = params.get("session_id");

      if (!pinatAccessToken) {
        navigate("/", {
          replace: true,
        });

        return;
      }

      try {
        const response = await api.post("/auth/sso", {
          access_token: pinatAccessToken,
        });

        const result = response.data.data;

        saveToken(result.token);

        if (refreshToken) {
          saveRefreshToken(refreshToken);
        }

        if (sessionId) {
          localStorage.setItem("session_id", sessionId);
        }

        saveUser(result.profile);

        window.history.replaceState({}, "", "/auth/callback");

        navigate("/dashboard", {
          replace: true,
        });
      } catch (err) {
        console.error("PinatAuth bootstrap failed:", err);

        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("session_id");
        localStorage.removeItem("user");

        navigate("/", {
          replace: true,
        });
      }
    };

    finishLogin();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-xl font-semibold">Logging you in...</h1>
    </div>
  );
}
