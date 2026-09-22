import { afterEach, describe, expect, test, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mocks = vi.hoisted(() => {
  const mutationOptions: { current?: { onSuccess?: (data: any) => void } } = {};
  return {
    mutationOptions,
    navigate: vi.fn(),
    redirect: vi.fn((to: string) => ({ to })),
    setUserData: vi.fn(),
    setActiveView: vi.fn(),
  };
});

vi.mock("@tanstack/react-query", () => ({
  useMutation: (options: { onSuccess?: (data: any) => void }) => {
    mocks.mutationOptions.current = options;
    return options;
  },
}));

vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  redirect: mocks.redirect,
  useNavigate: () => mocks.navigate,
}));

vi.mock("@/contexts/auth", () => ({
  useAuth: () => ({ setUserData: mocks.setUserData, setActiveView: mocks.setActiveView }),
}));

vi.mock("@/services/auth", () => ({
  authService: { login: vi.fn(), register: vi.fn() },
}));

import type { Profile } from "@/types/model";
import { useRegister } from "@/hooks/auth";
import { clientLoader as studentLoader } from "@/routes/auth/student/layout";
import { clientLoader as adminLoader } from "@/routes/auth/admin/layout";
import { hasRole, normalizeRoleName, resolveLandingPath, resolveDefaultView, resolveViewPath, getUserViews } from "./roles";

const user = (roles: unknown): Profile => ({
  display_name: null,
  email: null,
  avatar: null,
  points: 0,
  study_class_id: null,
  roles: roles as Profile["roles"],
});

function installStorage(values: Record<string, string> = {}) {
  const store = new Map(Object.entries(values));
  (globalThis as { localStorage: Storage }).localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => void store.set(key, value),
    removeItem: (key) => void store.delete(key),
    clear: () => void store.clear(),
    key: () => null,
    get length() {
      return store.size;
    },
  };
  return store;
}

describe("roles", () => {
  afterEach(() => {
    delete (globalThis as { localStorage?: Storage }).localStorage;
    mocks.mutationOptions.current = undefined;
    mocks.navigate.mockReset();
    mocks.redirect.mockClear();
    mocks.setUserData.mockReset();
    mocks.setActiveView.mockReset();
  });

  test("normalizes supported names without case sensitivity", () => {
    expect(normalizeRoleName("Teacher")).toBe("teacher");
    expect(normalizeRoleName("ADMIN")).toBe("admin");
    expect(normalizeRoleName("student")).toBe("student");
  });

  test("rejects missing and unsupported role values", () => {
    expect(normalizeRoleName(undefined)).toBeNull();
    expect(normalizeRoleName({ name: "teacher" })).toBeNull();
    expect(normalizeRoleName("editor")).toBeNull();
    expect(hasRole(undefined, "teacher")).toBe(false);
    expect(hasRole(user(undefined), "teacher")).toBe(false);
  });

  test("resolveDefaultView uses admin then teacher precedence across multiple roles", () => {
    expect(resolveDefaultView(user([{ name: "student" }, { name: "Teacher" }]))).toBe("teacher");
    expect(resolveDefaultView(user([{ name: "teacher" }, { name: "ADMIN" }]))).toBe("admin");
    expect(resolveDefaultView(user([{ name: "student" }]))).toBe("student");
    expect(resolveDefaultView(null)).toBe("student");
  });

  test("resolveViewPath maps roles to correct paths", () => {
    expect(resolveViewPath("admin")).toBe("/dashboard");
    expect(resolveViewPath("teacher")).toBe("/teacher/dashboard");
    expect(resolveViewPath("student")).toBe("/student/dashboard");
  });

  test("getUserViews returns all roles in priority order", () => {
    expect(getUserViews(user([{ name: "student" }, { name: "ADMIN" }, { name: "Teacher" }]))).toEqual(["admin", "teacher", "student"]);
    expect(getUserViews(user([{ name: "student" }]))).toEqual(["student"]);
    expect(getUserViews(null)).toEqual([]);
  });

  test("resolveLandingPath backward compat — same behaviour as before", () => {
    expect(resolveLandingPath(user([{ name: "student" }, { name: "Teacher" }]))).toBe("/teacher/dashboard");
    expect(resolveLandingPath(user([{ name: "teacher" }, { name: "ADMIN" }]))).toBe("/dashboard");
    expect(resolveLandingPath(user([{ name: "student" }]))).toBe("/student/dashboard");
    expect(resolveLandingPath(null)).toBe("/student/dashboard");
  });

  test("registers teachers and sets active view to their default view", () => {
    const storage = installStorage();
    const { result } = renderHook(() => useRegister());

    act(() => {
      mocks.mutationOptions.current?.onSuccess?.({
        token: "teacher-token",
        user: { email: "teacher@example.test", avatar: null, provider: "pinat" },
        profile: { user_id: "u1", display_name: "Teacher", roles: [{ name: "TEACHER" }] },
      });
    });

    expect(storage.get("token")).toBe("teacher-token");
    expect(mocks.setUserData).toHaveBeenCalledWith(expect.objectContaining({
      email: "teacher@example.test",
      roles: [{ name: "TEACHER" }],
    }));
    expect(mocks.setActiveView).toHaveBeenCalledWith("teacher");
    expect(mocks.navigate).toHaveBeenCalledWith("/teacher/dashboard");
  });

  // ── Student layout guard ────────────────────────────────────────────────────

  test("student guard redirects unauthenticated and malformed cached sessions to login", async () => {
    installStorage();
    await expect(studentLoader()).rejects.toEqual({ to: "/" });

    installStorage({ token: "token", user: "{" });
    await expect(studentLoader()).rejects.toEqual({ to: "/" });
  });

  test("student guard admits when active_view is student", async () => {
    installStorage({
      token: "token",
      user: JSON.stringify(user([{ name: "Student" }])),
      active_view: "student",
    });
    await expect(studentLoader()).resolves.toBeNull();
  });

  test("student guard redirects to correct view when active_view is not student", async () => {
    // active_view === teacher → go to teacher dashboard
    installStorage({
      token: "token",
      user: JSON.stringify(user([{ name: "Student" }, { name: "Teacher" }])),
      active_view: "teacher",
    });
    await expect(studentLoader()).rejects.toEqual({ to: "/teacher/dashboard" });

    // active_view === admin → go to admin dashboard
    installStorage({
      token: "token",
      user: JSON.stringify(user([{ name: "Student" }, { name: "ADMIN" }])),
      active_view: "admin",
    });
    await expect(studentLoader()).rejects.toEqual({ to: "/dashboard" });
  });

  test("student guard redirects to default view when active_view is missing", async () => {
    // No active_view — falls back to resolveDefaultView (teacher wins here)
    installStorage({
      token: "token",
      user: JSON.stringify(user([{ name: "student" }, { name: "Teacher" }])),
    });
    await expect(studentLoader()).rejects.toEqual({ to: "/teacher/dashboard" });
  });

  test("student guard redirects to / when user has no recognized roles", async () => {
    installStorage({
      token: "t",
      user: JSON.stringify(user([])),
      active_view: "student",
    });
    await expect(studentLoader()).rejects.toEqual({ to: "/" });

    installStorage({
      token: "t",
      user: JSON.stringify(user([{ name: "moderator" }])),
      active_view: "student",
    });
    await expect(studentLoader()).rejects.toEqual({ to: "/" });
  });

  // ── Admin layout guard ──────────────────────────────────────────────────────

  test("admin guard redirects to / when no token", async () => {
    installStorage();
    await expect(adminLoader()).rejects.toEqual({ to: "/" });
  });

  test("admin guard redirects to / when token present but user null", async () => {
    installStorage({ token: "t" });
    await expect(adminLoader()).rejects.toEqual({ to: "/" });
  });

  test("admin guard redirects when active_view is not admin", async () => {
    installStorage({
      token: "t",
      user: JSON.stringify(user([{ name: "teacher" }])),
      active_view: "teacher",
    });
    await expect(adminLoader()).rejects.toEqual({ to: "/teacher/dashboard" });

    installStorage({
      token: "t",
      user: JSON.stringify(user([{ name: "student" }])),
      active_view: "student",
    });
    await expect(adminLoader()).rejects.toEqual({ to: "/student/dashboard" });
  });

  test("admin guard admits when active_view is admin", async () => {
    installStorage({
      token: "t",
      user: JSON.stringify(user([{ name: "admin" }])),
      active_view: "admin",
    });
    await expect(adminLoader()).resolves.toBeUndefined();
  });
});
