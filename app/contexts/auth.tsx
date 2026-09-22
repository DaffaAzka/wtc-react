import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "@/lib/auth-api";
import { api } from "@/lib/axios";
import type { Profile, RoleName } from "@/types/model";
import { clearAuth, getActiveView, getToken, getUser, saveActiveView, saveUser } from "@/utils/auth-storage";
import { getUserViews, resolveDefaultView } from "@/utils/roles";

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
  activeView: RoleName | null;

  setUserData: (userData: Profile) => void;
  setActiveView: (role: RoleName) => void;
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

/**
 * Validates the stored active_view against the user's current roles.
 * Falls back to the default view (highest-priority role) if stored value is missing or no longer valid.
 */
function resolveAndPersistView(mergedUser: Profile): RoleName {
  const stored = getActiveView();
  const views = getUserViews(mergedUser);
  const resolved = stored && views.includes(stored) ? stored : resolveDefaultView(mergedUser);
  if (resolved !== stored) saveActiveView(resolved);
  return resolved;
}

export function AuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveViewState] = useState<RoleName | null>(null);

  const clearSession = () => {
    clearAuth();
    setUser(null);
    setToken(null);
    setActiveViewState(null);
  };

  const setUserData = (userData: Profile) => {
    setUser(userData);
    saveUser(userData);
  };

  const setActiveView = (role: RoleName) => {
    saveActiveView(role);
    setActiveViewState(role);
  };

  const fetchMe = async (accessToken: string) => {
    const { data: response } = await api.get("/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const mergedUser = toMergedUser(response.data);

    setUser(mergedUser);
    saveUser(mergedUser);

    // Re-validate active_view against fresh roles from the backend
    const resolved = resolveAndPersistView(mergedUser);
    setActiveViewState(resolved);

    return mergedUser;
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const storedToken = getToken();

      if (!storedToken) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        setToken(storedToken);

        // Load cached user immediately so the UI isn't blank
        const storedUser = getUser();

        if (storedUser && mounted) {
          setUser(storedUser);
          // Optimistically set active view from cache; fetchMe will re-validate
          const cached = resolveAndPersistView(storedUser);
          setActiveViewState(cached);
        }

        // Then refresh user from backend (also re-validates active_view)
        try {
          await fetchMe(storedToken);
        } catch (error) {
          const tokenStillExists = localStorage.getItem("token");

          if (!tokenStillExists && mounted) {
            setUser(null);
            setToken(null);
            setActiveViewState(null);
          }
          // Otherwise keep using cached data
        }
      } catch {
        if (localStorage.getItem("token")) {
          clearSession();
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  // Sync active_view changes from other tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      // Sync active_view changes across tabs
      if (e.key === "active_view" && e.newValue) {
        const val = e.newValue;
        if (val === "admin" || val === "teacher" || val === "student") {
          setActiveViewState(val as RoleName);
        }
      }
      // Propagate logout to all open tabs
      if (e.key === "token" && e.newValue === null) {
        clearSession();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
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

      const target = response.data.redirect_to;
      // Validate same-origin before following the redirect to prevent open-redirect attacks
      const isSameOrigin = (() => {
        if (!target) return false;
        try { return new URL(target, window.location.origin).origin === window.location.origin; }
        catch { return false; }
      })();
      window.location.href = isSameOrigin ? target : "/";
    } catch {
      window.location.href = "/";
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      loading,
      activeView,
      setUserData,
      setActiveView,
      refreshUser,
      logout,
    }),
    [user, token, loading, activeView],
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
