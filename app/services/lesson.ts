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

  /**
   * Mark a lesson as completed for the authenticated user
   * POST /lessons/{slug}/complete
   */
  complete: async (slug: string): Promise<{ completed: boolean; completed_at: string }> => {
    const response = await api.post<ApiResponse<{ completed: boolean; completed_at: string }>>(
      `/lessons/${slug}/complete`,
    );
    return response.data.data!;
  },

  /**
   * Add an attachment to a lesson
   * POST /lessons/{slug}/attachments
   */
  addAttachment: async (
    lessonSlug: string,
    file: File,
    title: string,
    type: "material" | "reference" | "download" | "slides" | "document" = "material",
    description?: string,
  ): Promise<any> => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("title", title);
    formData.append("type", type);

    if (description) {
      formData.append("description", description);
    }

    const response = await api.post<ApiResponse<any>>(
      `/lessons/${lessonSlug}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.data!;
  },

  /**
   * Delete an attachment from a lesson
   * DELETE /lessons/{slug}/attachments/{attachmentId}
   */
  deleteAttachment: async (
    lessonSlug: string,
    attachmentId: string,
  ): Promise<void> => {
    await api.delete(`/lessons/${lessonSlug}/attachments/${attachmentId}`);
  },

  /**
   * Get all attachments for a lesson
   * GET /lessons/{slug}/attachments
   */
  getAttachments: async (lessonSlug: string): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>(
      `/lessons/${lessonSlug}/attachments`,
    );
    return response.data.data!;
  },
};
