import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/lib/auth-api";
import type { Profile } from "@/types/model";
import { api } from "@/lib/axios";

type AuthContextType = {
  user: Profile | null;
  token: string | null;
  loading: boolean;

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

  const fetchMe = async (accessToken: string) => {
    const { data } = await api.get("/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const avatar = await fetchAvatar(accessToken);

    const updatedUser = {
      ...data,
      avatar,
    };

    setUser(updatedUser);

    localStorage.setItem("user", JSON.stringify(updatedUser));
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

        await fetchMe(storedToken);
      } catch (e) {
        console.error(e);

        clearSession();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

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
