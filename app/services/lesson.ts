import { api } from "@/lib/axios";
import type { Lesson } from "@/types/model";
import type { ApiResponse } from "@/types/response";

type LessonRequest = Omit<Lesson, "id" | "deleted_at" | "created_at" | "updated_at">;

export const LessonService = {
  store: async (request: LessonRequest): Promise<Lesson> => {
    const response = await api.post<ApiResponse<Lesson>>("/lessons", request);

    return response.data.data!;
  },

  update: async (id: number, request: LessonRequest): Promise<Lesson> => {
    const response = await api.put<ApiResponse<Lesson>>(
      `/lessons/${id}`,
      request,
    );

    return response.data.data!;
  },

  getAll: async (): Promise<Lesson[]> => {
    const response = await api.get<ApiResponse<Lesson[]>>("/lessons");
    return response.data.data!;
  },

  getById: async (id: number): Promise<Lesson> => {
    const response = await api.get<ApiResponse<Lesson>>(`/lessons/${id}`);
    return response.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/lessons/${id}`);
  },
};
