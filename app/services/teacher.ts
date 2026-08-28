import { api } from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/response";
import type {
  TeacherDashboard,
  TeacherSubmission,
  TeacherSubmissionFilters,
  GradeSubmissionRequest,
  LeaderboardParams,
  LeaderboardResponse,
  AuditLog,
  AuditLogParams,
  ContentListParams,
  Track,
  Module,
  Lesson,
  Challenge,
  TrackRequest,
  ModuleRequest,
  LessonRequest,
  ChallengeRequest,
} from "@/types/teacher";

// ---------------------------------------------------------------------------
// Teacher dashboard
// ---------------------------------------------------------------------------

export const teacherDashboard = async (): Promise<TeacherDashboard> => {
  const response = await api.get<ApiResponse<TeacherDashboard>>(
    "/teacher/dashboard",
  );
  return response.data.data!;
};

// ---------------------------------------------------------------------------
// Teacher submission queue
// ---------------------------------------------------------------------------

export const teacherSubmissions = async (
  filters?: TeacherSubmissionFilters,
): Promise<PaginatedResponse<TeacherSubmission>> => {
  const response = await api.get<PaginatedResponse<TeacherSubmission>>(
    "/teacher/submissions",
    { params: filters },
  );
  return response.data;
};

export const teacherSubmission = async (
  id: number,
): Promise<TeacherSubmission> => {
  const response = await api.get<ApiResponse<TeacherSubmission>>(
    `/submissions/${id}`,
  );
  return response.data.data!;
};

export const gradeSubmission = async (
  id: number,
  data: GradeSubmissionRequest,
): Promise<TeacherSubmission> => {
  const response = await api.patch<ApiResponse<TeacherSubmission>>(
    `/submissions/${id}`,
    data,
  );
  return response.data.data!;
};

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------

export const leaderboard = async (
  params?: LeaderboardParams,
): Promise<LeaderboardResponse> => {
  const response = await api.get<LeaderboardResponse>("/leaderboard", {
    params,
  });
  return response.data;
};

// ---------------------------------------------------------------------------
// Audit logs
// ---------------------------------------------------------------------------

export const auditLogs = async (
  params?: AuditLogParams,
): Promise<PaginatedResponse<AuditLog>> => {
  const response = await api.get<PaginatedResponse<AuditLog>>("/audits", {
    params,
  });
  return response.data;
};

// ---------------------------------------------------------------------------
// Track CRUD
// ---------------------------------------------------------------------------

export const contentList = async <T>(
  resource: string,
  params?: ContentListParams,
): Promise<PaginatedResponse<T>> => {
  const response = await api.get<PaginatedResponse<T>>(`/${resource}`, {
    params: { ...params, pagination: true },
  });
  return response.data;
};

export const trackList = async (
  params?: ContentListParams,
): Promise<PaginatedResponse<Track>> => contentList<Track>("tracks", params);

export const trackCreate = async (data: TrackRequest): Promise<Track> => {
  const response = await api.post<ApiResponse<Track>>("/tracks", data);
  return response.data.data!;
};

export const trackUpdate = async (
  slug: string,
  data: TrackRequest,
): Promise<Track> => {
  const response = await api.put<ApiResponse<Track>>(`/tracks/${slug}`, data);
  return response.data.data!;
};

export const trackDelete = async (slug: string): Promise<void> => {
  await api.delete(`/tracks/${slug}`);
};

// ---------------------------------------------------------------------------
// Module CRUD
// ---------------------------------------------------------------------------

export const moduleList = async (
  params?: ContentListParams,
): Promise<PaginatedResponse<Module>> => contentList<Module>("modules", params);

export const moduleCreate = async (data: ModuleRequest): Promise<Module> => {
  const response = await api.post<ApiResponse<Module>>("/modules", data);
  return response.data.data!;
};

export const moduleUpdate = async (
  slug: string,
  data: ModuleRequest,
): Promise<Module> => {
  const response = await api.put<ApiResponse<Module>>(`/modules/${slug}`, data);
  return response.data.data!;
};

export const moduleDelete = async (slug: string): Promise<void> => {
  await api.delete(`/modules/${slug}`);
};

// ---------------------------------------------------------------------------
// Lesson CRUD
// ---------------------------------------------------------------------------

export const lessonList = async (
  params?: ContentListParams,
): Promise<PaginatedResponse<Lesson>> => contentList<Lesson>("lessons", params);

export const lessonCreate = async (data: LessonRequest): Promise<Lesson> => {
  const response = await api.post<ApiResponse<Lesson>>("/lessons", data);
  return response.data.data!;
};

export const lessonUpdate = async (
  slug: string,
  data: LessonRequest,
): Promise<Lesson> => {
  const response = await api.put<ApiResponse<Lesson>>(`/lessons/${slug}`, data);
  return response.data.data!;
};

export const lessonDelete = async (slug: string): Promise<void> => {
  await api.delete(`/lessons/${slug}`);
};

// ---------------------------------------------------------------------------
// Challenge CRUD
// ---------------------------------------------------------------------------

export const challengeList = async (
  params?: ContentListParams,
): Promise<PaginatedResponse<Challenge>> =>
  contentList<Challenge>("challenges", params);

export const challengeCreate = async (
  data: ChallengeRequest,
): Promise<Challenge> => {
  const response = await api.post<ApiResponse<Challenge>>("/challenges", data);
  return response.data.data!;
};

export const challengeUpdate = async (
  id: number,
  data: ChallengeRequest,
): Promise<Challenge> => {
  const response = await api.put<ApiResponse<Challenge>>(
    `/challenges/${id}`,
    data,
  );
  return response.data.data!;
};

export const challengeDelete = async (id: number): Promise<void> => {
  await api.delete(`/challenges/${id}`);
};

// ---------------------------------------------------------------------------
// Namespace export for consumers that prefer object style
// ---------------------------------------------------------------------------

export const TeacherService = {
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
};
