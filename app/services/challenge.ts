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

  addAttachment: async (
    challengeId: number,
    file: File,
    title: string,
    type: "material" | "starter_file" | "example" | "template" | "reference" | "instruction" = "starter_file",
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
      `/challenges/${challengeId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.data!;
  },

  deleteAttachment: async (
    challengeId: number,
    attachmentId: string,
  ): Promise<void> => {
    await api.delete(`/challenges/${challengeId}/attachments/${attachmentId}`);
  },

  getAll: async (): Promise<Challenge[]> => {
    const response = await api.get<ApiResponse<Challenge[]>>("/challenges");

    return response.data.data!;
  },

  getByLesson: async (lessonId: number): Promise<Challenge[]> => {
    const response = await api.get<ApiResponse<Challenge[]>>(
      `/challenges?lesson_id=${lessonId}`,
    );

    return response.data.data!;
  },

  getById: async (id: number): Promise<Challenge> => {
    const response = await api.get<ApiResponse<Challenge>>(`/challenges/${id}`);

    return response.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/challenges/${id}`);
  },
};
