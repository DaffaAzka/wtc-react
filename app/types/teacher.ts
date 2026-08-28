import type { Track, Module, Lesson, Challenge } from "@/types/model";
import type { PaginatedResponse } from "@/types/response";

// ---------------------------------------------------------------------------
// Shared creator metadata (lightweight, no PII)
// ---------------------------------------------------------------------------

export type CreatorMeta = {
  id: number;
  display_name: string | null;
  avatar: string | null;
  roles: Array<{ name: string }>;
};

// ---------------------------------------------------------------------------
// Teacher submission queue
// ---------------------------------------------------------------------------

export type TeacherSubmissionStatus = "draft" | "submitted" | "graded" | "returned";

export type TeacherSubmission = {
  id: number;
  status: TeacherSubmissionStatus;
  score: number | null;
  feedback: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  challenge: {
    id: number;
    title: string;
    slug: string;
    type: string;
    max_score: number;
  };
  profile: {
    id: number;
    display_name: string | null;
    avatar: string | null;
    roles: Array<{ name: string }>;
  };
};

export type TeacherSubmissionFilters = {
  status?: TeacherSubmissionStatus;
  challenge_id?: number;
  profile_id?: number;
  page?: number;
  per_page?: number;
};

export type GradeSubmissionRequest = {
  status?: "graded" | "returned";
  score?: number;
  feedback?: string;
};

// ---------------------------------------------------------------------------
// Teacher dashboard
// ---------------------------------------------------------------------------

export type TeacherDashboardStats = {
  total_students: number;
  total_tracks: number;
  total_lessons: number;
  total_challenges: number;
  pending_submissions: number;
};

export type TeacherDashboard = {
  stats: TeacherDashboardStats;
  pending_submissions: TeacherSubmission[];
  leaderboard_preview: LeaderboardEntry[];
};

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------

export type LeaderboardEntry = {
  rank: number;
  profile_id: number;
  display_name: string | null;
  avatar: string | null;
  points: number;
  study_class_id: number | null;
};

export type LeaderboardPeriod = "all-time" | "monthly" | "weekly";

export type LeaderboardParams = {
  page?: number;
  per_page?: number;
  study_class_id?: number;
  period?: LeaderboardPeriod;
};

export type LeaderboardResponse = PaginatedResponse<LeaderboardEntry>;

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

export type AuditLog = {
  id: number;
  action: string;
  actor: CreatorMeta | null;
  target_type: string;
  target_id: number;
  target_title: string | null;
  changed_fields: Record<string, unknown> | null;
  created_at: string;
};

export type AuditLogParams = {
  page?: number;
  per_page?: number;
  action?: string;
  target_type?: string;
  date_from?: string;
  date_to?: string;
};

// ---------------------------------------------------------------------------
// Content list params (shared across all four resource types)
// ---------------------------------------------------------------------------

export type ContentListParams = {
  page?: number;
  per_page?: number;
  search?: string;
};

// ---------------------------------------------------------------------------
// Content request shapes (teacher context)
// ---------------------------------------------------------------------------

export type TrackRequest = Omit<Track, "id" | "created_at" | "updated_at" | "modules_count">;
export type ModuleRequest = Omit<Module, "id" | "created_at" | "updated_at">;
export type LessonRequest = Omit<Lesson, "id" | "created_at" | "updated_at" | "attachments" | "deleted_at">;
export type ChallengeRequest = Omit<Challenge, "id" | "created_at" | "updated_at" | "attachments">;

// Re-export content types for convenience
export type { Track, Module, Lesson, Challenge };
