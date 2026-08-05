import { api } from "@/lib/axios";
import type { Lesson } from "@/types/model";
import type { ApiResponse } from "@/types/response";

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

  getAll: async (): Promise<Lesson[]> => {
    const response = await api.get<ApiResponse<Lesson[]>>("/lessons");
    return response.data.data!;
  },

  getBySlug: async (slug: string): Promise<Lesson> => {
    const response = await api.get<ApiResponse<Lesson>>(`/lessons/${slug}`);
    return response.data.data!;
  },

  delete: async (slug: string): Promise<void> => {
    await api.delete(`/lessons/${slug}`);
  },

  getByModule: async (moduleSlug: string): Promise<Lesson[]> => {
    const response = await api.get<ApiResponse<Lesson[]>>(
      `/modules/${moduleSlug}/lessons`,
    );
    return response.data.data!;
  },
};
