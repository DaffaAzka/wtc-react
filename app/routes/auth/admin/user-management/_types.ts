// ── Types ───────────────────────────────────────────────────────────────────

export type UserResource = {
  id: string;
  puid: string | null;
  name: string;
  email: string;
  provider: string;
  avatar: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
};

export type RoleResource = {
  id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
};

export type ProfileWithUser = {
  id: string;
  user_id: string;
  study_class_id: number | null;
  display_name: string | null;
  points: number;
  last_login_at: string;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
  user: UserResource;
  roles: RoleResource[];
};

export type PaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
};

export type ProfilesResponse = {
  success: boolean;
  message: string;
  data: { profiles: ProfileWithUser[]; pagination: PaginationMeta };
};

export type RolesResponse = {
  success: boolean;
  message: string;
  data: RoleResource[];
};

export type ProfileResponse = {
  success: boolean;
  message: string;
  data: ProfileWithUser;
};

// ── Role badge color map ────────────────────────────────────────────────────

export const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin:   { bg: "bg-[#ff007b]/10",  text: "text-[#ff007b]" },
  teacher: { bg: "bg-[#1c81ff]/10",  text: "text-[#1c81ff]" },
  student: { bg: "bg-[#00E676]/10",  text: "text-[#00E676]" },
};
