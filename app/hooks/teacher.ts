import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  teacherDashboard,
  teacherSubmissions,
  teacherSubmission,
  gradeSubmission,
  leaderboard,
  auditLogs,
  trackList,
  trackCreate,
  trackUpdate,
  trackDelete,
  moduleList,
  moduleCreate,
  moduleUpdate,
  moduleDelete,
  lessonList,
  lessonCreate,
  lessonUpdate,
  lessonDelete,
  challengeList,
  challengeCreate,
  challengeUpdate,
  challengeDelete,
} from "@/services/teacher";
import type {
  TeacherSubmissionFilters,
  GradeSubmissionRequest,
  LeaderboardParams,
  AuditLogParams,
  ContentListParams,
  TrackRequest,
  ModuleRequest,
  LessonRequest,
  ChallengeRequest,
} from "@/types/teacher";
import type { ApiErrorResponse } from "@/types/response";

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

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export function useTeacherDashboard() {
  return useQuery({
    queryKey: teacherKeys.dashboard(),
    queryFn: teacherDashboard,
  });
}

// ---------------------------------------------------------------------------
// Submissions
// ---------------------------------------------------------------------------

export function useTeacherSubmissions(filters?: TeacherSubmissionFilters) {
  return useQuery({
    queryKey: teacherKeys.submissions(filters),
    queryFn: () => teacherSubmissions(filters),
  });
}

export function useTeacherSubmission(id: number) {
  return useQuery({
    queryKey: teacherKeys.submission(id),
    queryFn: () => teacherSubmission(id),
    enabled: !!id,
  });
}

export function useGradeSubmission() {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof gradeSubmission>>,
    ApiErrorResponse,
    { id: number; data: GradeSubmissionRequest }
  >({
    mutationFn: ({ id, data }) => gradeSubmission(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: teacherKeys.submission(result.id),
      });
      queryClient.invalidateQueries({
        queryKey: ["teacher", "submissions"],
      });
      queryClient.invalidateQueries({
        queryKey: teacherKeys.dashboard(),
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------

export function useTeacherLeaderboard(params?: LeaderboardParams) {
  return useQuery({
    queryKey: teacherKeys.leaderboard(params),
    queryFn: () => leaderboard(params),
  });
}

// ---------------------------------------------------------------------------
// Audit logs
// ---------------------------------------------------------------------------

export function useTeacherAuditLogs(params?: AuditLogParams) {
  return useQuery({
    queryKey: teacherKeys.auditLogs(params),
    queryFn: () => auditLogs(params),
  });
}

// ---------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------

export function useTeacherTrackList(params?: ContentListParams) {
  return useQuery({
    queryKey: teacherKeys.tracks(params),
    queryFn: () => trackList(params),
  });
}

export function useTeacherTrackCreate() {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof trackCreate>>,
    ApiErrorResponse,
    TrackRequest
  >({
    mutationFn: trackCreate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "tracks"] });
    },
  });
}

export function useTeacherTrackUpdate() {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof trackUpdate>>,
    ApiErrorResponse,
    { slug: string; data: TrackRequest }
  >({
    mutationFn: ({ slug, data }) => trackUpdate(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "tracks"] });
    },
  });
}

export function useTeacherTrackDelete() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiErrorResponse, string>({
    mutationFn: trackDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "tracks"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

export function useTeacherModuleList(params?: ContentListParams) {
  return useQuery({
    queryKey: teacherKeys.modules(params),
    queryFn: () => moduleList(params),
  });
}

export function useTeacherModuleCreate() {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof moduleCreate>>,
    ApiErrorResponse,
    ModuleRequest
  >({
    mutationFn: moduleCreate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "modules"] });
    },
  });
}

export function useTeacherModuleUpdate() {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof moduleUpdate>>,
    ApiErrorResponse,
    { slug: string; data: ModuleRequest }
  >({
    mutationFn: ({ slug, data }) => moduleUpdate(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "modules"] });
    },
  });
}

export function useTeacherModuleDelete() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiErrorResponse, string>({
    mutationFn: moduleDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "modules"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

export function useTeacherLessonList(params?: ContentListParams) {
  return useQuery({
    queryKey: teacherKeys.lessons(params),
    queryFn: () => lessonList(params),
  });
}

export function useTeacherLessonCreate() {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof lessonCreate>>,
    ApiErrorResponse,
    LessonRequest
  >({
    mutationFn: lessonCreate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "lessons"] });
    },
  });
}

export function useTeacherLessonUpdate() {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof lessonUpdate>>,
    ApiErrorResponse,
    { slug: string; data: LessonRequest }
  >({
    mutationFn: ({ slug, data }) => lessonUpdate(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "lessons"] });
    },
  });
}

export function useTeacherLessonDelete() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiErrorResponse, string>({
    mutationFn: lessonDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "lessons"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Challenges
// ---------------------------------------------------------------------------

export function useTeacherChallengeList(params?: ContentListParams) {
  return useQuery({
    queryKey: teacherKeys.challenges(params),
    queryFn: () => challengeList(params),
  });
}

export function useTeacherChallengeCreate() {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof challengeCreate>>,
    ApiErrorResponse,
    ChallengeRequest
  >({
    mutationFn: challengeCreate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "challenges"] });
    },
  });
}

export function useTeacherChallengeUpdate() {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof challengeUpdate>>,
    ApiErrorResponse,
    { id: number; data: ChallengeRequest }
  >({
    mutationFn: ({ id, data }) => challengeUpdate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "challenges"] });
    },
  });
}

export function useTeacherChallengeDelete() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiErrorResponse, number>({
    mutationFn: challengeDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "challenges"] });
    },
  });
}
