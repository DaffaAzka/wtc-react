import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/lib/auth-api";
import type { Profile } from "@/types/model";
import { api } from "@/lib/axios";

type AuthContextType = {
  user: Profile | null;
  token: string | null;
  loading: boolean;

  setUserData: (userData: Profile) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

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

  const toMergedUser = (payload: any) => {
    const { user, profile } = payload;
    const { user_id, ...profileWithoutUserId } = profile;

    return {
      ...profileWithoutUserId,
      email: user.email,
      avatar: user.avatar,
    };
  };

  const fetchMe = async (accessToken: string) => {
    const { data: res } = await api.get("/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const mergedUser = toMergedUser(res.data);

    localStorage.setItem("user", JSON.stringify(mergedUser));
    setUser(mergedUser);
  };

  const fetchAvatar = async (accessToken: string) => {
    const { data } = await authApi.get("/api/auth/avatar", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return data.url;
  };

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        setToken(storedToken);

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } catch (error) {
            console.error("Failed to parse stored user data", error);
          }
        }

        try {
          await fetchMe(storedToken);
        } catch (error) {
          const tokenStillExists = localStorage.getItem("token");
          if (!tokenStillExists) {
            setUser(null);
            setToken(null);
          } else {
            console.warn("Failed to fetch fresh user data, using cached data", error);
          }
        }
      } catch (e) {
        console.error("Bootstrap error", e);
        if (localStorage.getItem("token")) {
          clearSession();
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const setUserData = (userData: Profile) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const refreshUser = async () => {
    if (!token) return;

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

  const value = useMemo(
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
