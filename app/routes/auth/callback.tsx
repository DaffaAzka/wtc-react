import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

import { api } from "@/lib/axios";
import { saveRefreshToken, saveToken } from "@/utils/auth-storage";

import { useAuth } from "@/contexts/auth";

type MeResponse = {
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
    study_class_id: number | null;
    display_name: string | null;
    points: number;
    last_login_at: string | null;
    last_synced_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    roles: {
      name: string;
      display_name?: string;
      id?: number;
    }[];
  };
};

function toMergedUser(payload: MeResponse) {
  const { user, profile } = payload;

  return {
    puid: user.puid ?? "",
    display_name: profile.display_name ?? user.name,
    email: user.email,
    avatar: user.avatar,
    points: profile.points,
    study_class_id: profile.study_class_id,
    roles: profile.roles,
  };
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUserData } = useAuth();

  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;

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

      window.history.replaceState({}, "", "/auth/callback");

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

        const meResponse = await api.get<{
          success: boolean;
          message: string;
          data: MeResponse;
        }>("/me", {
          headers: {
            Authorization: `Bearer ${result.token}`,
          },
        });

        const mergedUser = toMergedUser(meResponse.data.data);

        setUserData(mergedUser);

        navigate("/dashboard", {
          replace: true,
        });
      } catch (error) {
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
  }, [navigate, setUserData]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-xl font-semibold">Logging you in...</h1>
    </div>
  );
}
