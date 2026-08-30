import { afterEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const mutationOptions: { current?: { onSuccess?: (data: any) => void } } = {};
  return {
    mutationOptions,
    navigate: vi.fn(),
    redirect: vi.fn((to: string) => ({ to })),
    setUserData: vi.fn(),
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
  useAuth: () => ({ setUserData: mocks.setUserData }),
}));

vi.mock("@/services/auth", () => ({
  authService: { login: vi.fn(), register: vi.fn() },
}));

import type { Profile } from "@/types/model";
import { useRegister } from "@/hooks/auth";
import { clientLoader as studentLoader } from "@/routes/auth/student/layout";
import { clientLoader as adminLoader } from "@/routes/auth/admin/layout";
import { getUser } from "./auth-storage";
import { hasRole, normalizeRoleName, resolveLandingPath } from "./roles";

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

  test("uses admin then teacher precedence across multiple roles", () => {
    expect(hasRole(user([{ name: "TEACHER" }]), "teacher")).toBe(true);
    expect(resolveLandingPath(user([{ name: "student" }, { name: "Teacher" }]))).toBe("/teacher/dashboard");
    expect(resolveLandingPath(user([{ name: "teacher" }, { name: "ADMIN" }]))).toBe("/dashboard");
  });

  test("defaults landing paths to student", () => {
    expect(resolveLandingPath(user([{ name: "student" }]))).toBe("/student/dashboard");
    expect(resolveLandingPath(user([]))).toBe("/student/dashboard");
    expect(resolveLandingPath(null)).toBe("/student/dashboard");
  });

  test("registers teachers into shared storage and their landing path", () => {
    const storage = installStorage();
    useRegister();

    mocks.mutationOptions.current?.onSuccess?.({
      token: "teacher-token",
      user: { email: "teacher@example.test", avatar: null },
      profile: { user_id: "u1", display_name: "Teacher", roles: [{ name: "TEACHER" }] },
    });

    expect(storage.get("token")).toBe("teacher-token");
    expect(mocks.setUserData).toHaveBeenCalledWith(expect.objectContaining({
      email: "teacher@example.test",
      roles: [{ name: "TEACHER" }],
    }));
    expect(mocks.navigate).toHaveBeenCalledWith("/teacher/dashboard");
  });

  test("student guard redirects unauthenticated and malformed cached sessions to login", async () => {
    installStorage();
    await expect(studentLoader()).rejects.toEqual({ to: "/" });

    installStorage({ token: "token", user: "{" });
    await expect(studentLoader()).rejects.toEqual({ to: "/" });
  });

  test("student guard admits students and redirects teacher and admin", async () => {
    const storage = installStorage({ token: "token", user: JSON.stringify(user([{ name: "Student" }])) });
    await expect(studentLoader()).resolves.toBeNull();

    storage.set("user", JSON.stringify(user([{ name: "Teacher" }])));
    await expect(studentLoader()).rejects.toEqual({ to: "/teacher/dashboard" });

    storage.set("user", JSON.stringify(user([{ name: "ADMIN" }])));
    await expect(studentLoader()).rejects.toEqual({ to: "/dashboard" });
  });

  // D-1 regression: zero-role authenticated user must not loop via resolveLandingPath
  test("D-1: student guard redirects zero-role user to / not /student/dashboard", async () => {
    // roles: [] — authenticated, has token, user object is valid, but no recognized role
    installStorage({ token: "t", user: JSON.stringify(user([])) });
    await expect(studentLoader()).rejects.toEqual({ to: "/" });

    // roles with unrecognized value — same expectation
    installStorage({ token: "t", user: JSON.stringify(user([{ name: "moderator" }])) });
    await expect(studentLoader()).rejects.toEqual({ to: "/" });
  });

  // D-2 regression: admin layout must check token independently
  test("D-2: admin guard redirects to / when no token", async () => {
    installStorage(); // no token, no user
    await expect(adminLoader()).rejects.toEqual({ to: "/" });
  });

  test("D-2: admin guard redirects to / when token present but user null", async () => {
    installStorage({ token: "t" }); // token present, no user in storage
    await expect(adminLoader()).rejects.toEqual({ to: "/" });
  });

  test("D-2: admin guard redirects non-admin to their landing path", async () => {
    const storage = installStorage({ token: "t", user: JSON.stringify(user([{ name: "teacher" }])) });
    await expect(adminLoader()).rejects.toEqual({ to: "/teacher/dashboard" });

    storage.set("user", JSON.stringify(user([{ name: "student" }])));
    await expect(adminLoader()).rejects.toEqual({ to: "/student/dashboard" });
  });

  test("D-2: admin guard admits admin users", async () => {
    installStorage({ token: "t", user: JSON.stringify(user([{ name: "admin" }])) });
    await expect(adminLoader()).resolves.toBeUndefined();
  });
});
