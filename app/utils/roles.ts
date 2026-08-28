import type { Profile, RoleName } from "@/types/model";

type RoleUser = Pick<Profile, "roles">;

export function normalizeRoleName(value: unknown): RoleName | null {
  const normalized = typeof value === "string" ? value.toLowerCase() : "";
  return normalized === "admin" || normalized === "teacher" || normalized === "student" ? normalized : null;
}

export function hasRole(user: RoleUser | null | undefined, role: RoleName): boolean {
  return Array.isArray(user?.roles) && user.roles.some((item) => normalizeRoleName(item?.name) === role);
}

export function resolveLandingPath(user: RoleUser | null | undefined): string {
  if (hasRole(user, "admin")) return "/dashboard";
  if (hasRole(user, "teacher")) return "/teacher/dashboard";
  return "/student/dashboard";
}
