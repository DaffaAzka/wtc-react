import { api } from "@/lib/axios";
import type { Challenge } from "@/types/model";
import type { ApiResponse } from "@/types/response";

type ChallengeRequest = Omit<
  Challenge,
  "id" | "created_at" | "updated_at"
>;

export const ChallengeService = {
  store: async (request: ChallengeRequest): Promise<Challenge> => {
    const response = await api.post<ApiResponse<Challenge>>(
      "/challenges",
      request,
    );

    return response.data.data!;
  },

  update: async (
    id: number,
    request: ChallengeRequest,
  ): Promise<Challenge> => {
    const response = await api.put<ApiResponse<Challenge>>(
      `/challenges/${id}`,
      request,
    );

    return response.data.data!;
  },

  updateWithAttachment: async (
    id: number,
    data: Omit<Challenge, "id" | "created_at" | "updated_at" | "attachments">,
    file: File,
  ): Promise<Challenge> => {
    const formData = new FormData();

    // Append all challenge fields
    formData.append("title", data.title);
    formData.append("slug", data.slug);
    formData.append("type", data.type);
    formData.append("content", data.content);
    formData.append("max_score", String(data.max_score));

    if (data.module_id !== null && data.module_id !== undefined) {
      formData.append("module_id", String(data.module_id));
    }

    if (data.lesson_id !== null && data.lesson_id !== undefined) {
      formData.append("lesson_id", String(data.lesson_id));
    }

    if (data.difficulty) {
      formData.append("difficulty", data.difficulty);
    }

    if (data.order !== null && data.order !== undefined) {
      formData.append("order", String(data.order));
    }

    if (data.points !== null && data.points !== undefined) {
      formData.append("points", String(data.points));
    }

    if (data.allowed_attempts !== null && data.allowed_attempts !== undefined) {
      formData.append("allowed_attempts", String(data.allowed_attempts));
    }

    if (data.settings !== null) {
      formData.append("settings", JSON.stringify(data.settings));
    }

    if (data.metadata !== null) {
      formData.append("metadata", JSON.stringify(data.metadata));
    }

    // Append file
    formData.append("attachment", file);

    const response = await api.put<ApiResponse<Challenge>>(
      `/challenges/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.data!;
  },

  getAll: async (): Promise<Challenge[]> => {
    const response =
      await api.get<ApiResponse<Challenge[]>>("/challenges");

    return response.data.data!;
  },

  getByLesson: async (lessonId: number): Promise<Challenge[]> => {
    const response = await api.get<ApiResponse<Challenge[]>>(
      `/challenges`,
      {
        params: { lesson_id: lessonId },
      },
    );

    return response.data.data!;
  },

  getById: async (id: number): Promise<Challenge> => {
    const response = await api.get<ApiResponse<Challenge>>(
      `/challenges/${id}`,
    );

    return response.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/challenges/${id}`);
  },
};
