import { api } from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/response";

export type StudyClass = {
  id: number;
  name: string;
  description?: string | null;
  academic_year?: string | null;
  semester?: string | null;
  created_at: string;
  updated_at: string;
  students_count?: number;
};

export type StudyClassRequest = {
  name: string;
  description?: string | null;
  academic_year?: string | null;
  semester?: string | null;
};

export type StudyClassFilter = {
  search?: string;
  academic_year?: string;
  semester?: string;
  page?: number;
  per_page?: number;
};

export const StudyClassService = {
  /**
   * Get all study classes with optional filters
   */
  getAll: async (filters?: StudyClassFilter): Promise<StudyClass[]> => {
    const response = await api.get<ApiResponse<StudyClass[]>>(
      "/study-classes",
      {
        params: filters,
      }
    );
    return response.data.data!;
  },

  /**
   * Get paginated study classes with optional filters
   */
  getAllPaginated: async (
    filters?: StudyClassFilter
  ): Promise<PaginatedResponse<StudyClass>> => {
    const response = await api.get<PaginatedResponse<StudyClass>>(
      "/study-classes",
      {
        params: { ...filters, pagination: true },
      }
    );
    return response.data;
  },

  /**
   * Create a new study class
   */
  store: async (request: StudyClassRequest): Promise<StudyClass> => {
    const response = await api.post<ApiResponse<StudyClass>>(
      "/study-classes",
      request
    );
    return response.data.data!;
  },

  /**
   * Get a study class by ID
   */
  getById: async (id: number): Promise<StudyClass> => {
    const response = await api.get<ApiResponse<StudyClass>>(
      `/study-classes/${id}`
    );
    return response.data.data!;
  },

  /**
   * Update a study class
   */
  update: async (
    id: number,
    request: StudyClassRequest
  ): Promise<StudyClass> => {
    const response = await api.put<ApiResponse<StudyClass>>(
      `/study-classes/${id}`,
      request
    );
    return response.data.data!;
  },

  /**
   * Delete a study class
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/study-classes/${id}`);
  },
};
