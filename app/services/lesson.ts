import { api } from "@/lib/axios";
import type { LessonFilter } from "@/types/filter";
import type { Lesson } from "@/types/model";
import type { ApiResponse, PaginatedResponse } from "@/types/response";

type LessonRequest = Omit<
  Lesson,
  "id" | "deleted_at" | "created_at" | "updated_at"
>;

export const LessonService = {
  store: async (request: LessonRequest): Promise<Lesson> => {
    const response = await api.post<ApiResponse<Lesson>>("/lessons", request);

    return response.data.data!;
  },

  update: async (slug: string, request: LessonRequest): Promise<Lesson> => {
    const response = await api.put<ApiResponse<Lesson>>(
      `/lessons/${slug}`,
      request,
    );

    return response.data.data!;
  },

  getAll: async (filters?: LessonFilter): Promise<Lesson[]> => {
    const response = await api.get<ApiResponse<Lesson[]>>("/lessons", {
      params: filters,
    });
    return response.data.data!;
  },

  getAllPaginated: async (
    filters?: LessonFilter & { page?: number; per_page?: number },
  ): Promise<PaginatedResponse<Lesson>> => {
    const response = await api.get<PaginatedResponse<Lesson>>("/lessons", {
      params: { ...filters, pagination: true },
    });
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Lesson> => {
    const response = await api.get<ApiResponse<Lesson>>(`/lessons/${slug}`);
    return response.data.data!;
  },

  delete: async (slug: string): Promise<void> => {
    await api.delete(`/lessons/${slug}`);
  },
};
