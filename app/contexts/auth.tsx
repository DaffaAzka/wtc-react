import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "@/lib/auth-api";
import { api } from "@/lib/axios";
import type { Profile } from "@/types/model";

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

type AuthContextType = {
  user: Profile | null;
  token: string | null;
  loading: boolean;

  setUserData: (userData: Profile) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function toMergedUser(payload: MeResponse): Profile {
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

export function AuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("session_id");
    localStorage.removeItem("user");

    setUser(null);
    setToken(null);
  };

  const setUserData = (userData: Profile) => {
    setUser(userData);

    localStorage.setItem("user", JSON.stringify(userData));
  };

  const fetchMe = async (accessToken: string) => {
    const { data: response } = await api.get("/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const mergedUser = toMergedUser(response.data);

    setUser(mergedUser);

    localStorage.setItem("user", JSON.stringify(mergedUser));

    return mergedUser;
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        if (mounted) {
          setLoading(false);
        }

        return;
      }

      try {
        setToken(storedToken);

        /*
         * Load cached user immediately.
         */
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);

            if (mounted) {
              setUser(userData);
            }
          } catch (error) {
            console.error("Failed to parse stored user data", error);
          }
        }

        /*
         * Then refresh the user from backend.
         */
        try {
          await fetchMe(storedToken);
        } catch (error) {
          const tokenStillExists = localStorage.getItem("token");

          if (!tokenStillExists) {
            if (mounted) {
              setUser(null);
              setToken(null);
            }
          } else {
            console.warn("Failed to fetch fresh user data, using cached data", error);
          }
        }
      } catch (error) {
        console.error("Bootstrap error", error);

        if (localStorage.getItem("token")) {
          clearSession();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshUser = async () => {
    if (!token) {
      return;
    }

    await fetchMe(token);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");

    clearSession();

    if (!refreshToken) {
      window.location.href = "/";
      return;
    }

    try {
      const response = await authApi.post("/api/auth/logout", {
        refresh_token: refreshToken,
        client_id: "lms",
        redirect_uri: window.location.origin,
      });

      window.location.href = response.data.redirect_to ?? "/";
    } catch (error) {
      console.error(error);

      window.location.href = "/";
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      loading,
      setUserData,
      refreshUser,
      logout,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
