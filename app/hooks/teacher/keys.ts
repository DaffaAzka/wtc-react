import type {
  TeacherSubmissionFilters,
  LeaderboardParams,
  AuditLogParams,
  ContentListParams,
} from "@/types/teacher";

// ---------------------------------------------------------------------------
// Query key factories
// ---------------------------------------------------------------------------

export const teacherKeys = {
  all: ["teacher"] as const,

  dashboard: () => [...teacherKeys.all, "dashboard"] as const,

  submissions: (filters?: TeacherSubmissionFilters) =>
    [...teacherKeys.all, "submissions", filters ?? {}] as const,

  submission: (id: number) =>
    [...teacherKeys.all, "submission", id] as const,

  leaderboard: (params?: LeaderboardParams) =>
    [...teacherKeys.all, "leaderboard", params ?? {}] as const,

  auditLogs: (params?: AuditLogParams) =>
    [...teacherKeys.all, "audit-logs", params ?? {}] as const,

  tracks: (params?: ContentListParams) =>
    [...teacherKeys.all, "tracks", params ?? {}] as const,

  modules: (params?: ContentListParams) =>
    [...teacherKeys.all, "modules", params ?? {}] as const,

  lessons: (params?: ContentListParams) =>
    [...teacherKeys.all, "lessons", params ?? {}] as const,

  challenges: (params?: ContentListParams) =>
    [...teacherKeys.all, "challenges", params ?? {}] as const,
};
