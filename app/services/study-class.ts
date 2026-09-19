import { api } from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/response";

export type Track = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  is_active: boolean;
  order: number;
  image_url?: string | null;
  modules_count?: number;
  updated_at?: string;
};

export type StudyClass = {
  id: number;
  name: string;
  description?: string | null;
  academic_year?: string | null;
  semester?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  students_count?: number;
  tracks?: Track[];
};

export type StudyClassRequest = {
  name: string;
  description?: string | null;
  academic_year?: string | null;
  semester?: string | null;
  is_active?: boolean;
};

export type StudyClassFilter = {
  search?: string;
  academic_year?: string;
  semester?: string;
  active_only?: boolean;
  with_tracks?: boolean;
  page?: number;
  per_page?: number;
};

export const StudyClassService = {
  /**
   * Get all study classes with optional filters
   */
  getAll: async (filters?: StudyClassFilter): Promise<StudyClass[]> => {
    const response = await api.get<ApiResponse<StudyClass[]>>("/study-classes", {
      params: filters,
    });
    return response.data.data!;
  },

  /**
   * Get paginated study classes with optional filters
   */
  getAllPaginated: async (filters?: StudyClassFilter): Promise<PaginatedResponse<StudyClass>> => {
    const response = await api.get<PaginatedResponse<StudyClass>>("/study-classes", {
      params: { ...filters, pagination: true },
    });
    return response.data;
  },

  /**
   * Get a study class by ID (includes tracks)
   */
  getById: async (id: number): Promise<StudyClass> => {
    const response = await api.get<ApiResponse<StudyClass>>(`/study-classes/${id}`);
    return response.data.data!;
  },

  /**
   * Get the authenticated user's study class (includes tracks)
   */
  getMyClass: async (): Promise<StudyClass> => {
    const response = await api.get<ApiResponse<StudyClass>>("/my/study-class");
    return response.data.data!;
  },

  /**
   * Join (enroll in) a study class
   */
  joinClass: async (id: number): Promise<StudyClass> => {
    const response = await api.post<ApiResponse<StudyClass>>(`/study-classes/${id}/join`);
    return response.data.data!;
  },

  /**
   * Create a new study class
   */
  store: async (request: StudyClassRequest): Promise<StudyClass> => {
    const response = await api.post<ApiResponse<StudyClass>>("/study-classes", request);
    return response.data.data!;
  },

  /**
   * Update a study class
   */
  update: async (id: number, request: StudyClassRequest): Promise<StudyClass> => {
    const response = await api.put<ApiResponse<StudyClass>>(`/study-classes/${id}`, request);
    return response.data.data!;
  },

  /**
   * Delete a study class
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/study-classes/${id}`);
  },

  /**
   * Toggle is_active for a study class
   */
  toggle: async (id: number): Promise<StudyClass> => {
    const response = await api.patch<ApiResponse<StudyClass>>(`/study-classes/${id}/toggle`);
    return response.data.data!;
  },

  /**
   * Assign a track to a study class
   */
  assignTrack: async (studyClassId: number, trackId: number): Promise<StudyClass> => {
    const response = await api.post<ApiResponse<StudyClass>>(
      `/study-classes/${studyClassId}/tracks/${trackId}`
    );
    return response.data.data!;
  },

  /**
   * Remove a track from a study class
   */
  removeTrack: async (studyClassId: number, trackId: number): Promise<StudyClass> => {
    const response = await api.delete<ApiResponse<StudyClass>>(
      `/study-classes/${studyClassId}/tracks/${trackId}`
    );
    return response.data.data!;
  },
};
