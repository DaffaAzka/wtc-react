import type { Profile, RoleName } from "@/types/model";

type RoleUser = Pick<Profile, "roles">;

export function normalizeRoleName(value: unknown): RoleName | null {
  const normalized = typeof value === "string" ? value.toLowerCase() : "";
  return normalized === "admin" || normalized === "teacher" || normalized === "student"
    ? normalized
    : null;
}

export function hasRole(user: RoleUser | null | undefined, role: RoleName): boolean {
  return Array.isArray(user?.roles) && user.roles.some((item) => normalizeRoleName(item?.name) === role);
}

/** Returns the highest-priority role the user holds, used as the default active view. */
export function resolveDefaultView(user: RoleUser | null | undefined): RoleName {
  if (hasRole(user, "admin")) return "admin";
  if (hasRole(user, "teacher")) return "teacher";
  return "student";
}

/** Maps an active view to its landing path. */
export function resolveViewPath(view: RoleName): string {
  if (view === "admin") return "/dashboard";
  if (view === "teacher") return "/teacher/dashboard";
  return "/student/dashboard";
}

/**
 * Returns all recognized roles the user holds, in priority order (admin → teacher → student).
 * Used to determine which views are available in the view switcher.
 */
export function getUserViews(user: RoleUser | null | undefined): RoleName[] {
  if (!Array.isArray(user?.roles)) return [];
  const found = new Set<RoleName>();
  for (const r of user!.roles) {
    const name = normalizeRoleName(r?.name);
    if (name) found.add(name);
  }
  const order: RoleName[] = ["admin", "teacher", "student"];
  return order.filter((r) => found.has(r));
}

/** @deprecated Use resolveDefaultView + resolveViewPath instead. Kept for backward compat. */
export function resolveLandingPath(user: RoleUser | null | undefined): string {
  return resolveViewPath(resolveDefaultView(user));
}
