import type { Profile, RoleName } from "@/types/model";

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function saveToken(token: string): void {
  localStorage.setItem("token", token);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refresh_token");
}

export function saveRefreshToken(token: string): void {
  localStorage.setItem("refresh_token", token);
}

export function getUser(): Profile | null {
  const data = localStorage.getItem("user");

  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveUser(user: unknown): void {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getActiveView(): RoleName | null {
  const val = localStorage.getItem("active_view");
  if (val === "admin" || val === "teacher" || val === "student") return val;
  return null;
}

export function saveActiveView(role: RoleName): void {
  localStorage.setItem("active_view", role);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function hasRefreshToken(): boolean {
  return !!getRefreshToken();
}

export function clearAuth(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("session_id");
  localStorage.removeItem("user");
  localStorage.removeItem("active_view");
}
