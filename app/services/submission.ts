import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/response";
import type {
  Submission,
  SubmissionDetail,
  SubmissionCreateRequest,
  SubmissionUpdateRequest,
  SubmissionFileResponse,
} from "@/types/submission";

export const SubmissionService = {
  /**
   * Get all submissions for a specific challenge
   * GET /challenges/{challengeId}/submissions
   */
  getAll: async (challengeId: number): Promise<Submission[]> => {
    const response = await api.get<ApiResponse<Submission[]>>(
      `/challenges/${challengeId}/submissions`
    );
    return response.data.data!;
  },

  /**
   * Get student's own submissions for a specific challenge
   * GET /challenges/{challengeId}/my-submissions
   */
  mySubmissions: async (challengeId: number): Promise<SubmissionDetail[]> => {
    const response = await api.get<ApiResponse<SubmissionDetail[]>>(
      `/challenges/${challengeId}/my-submissions`
    );
    return response.data.data!;
  },

  /**
   * Get all submissions for the authenticated user across all challenges
   * GET /my-submissions
   */
  getAllMySubmissions: async (): Promise<SubmissionDetail[]> => {
    const response = await api.get<ApiResponse<SubmissionDetail[]>>("/my-submissions");
    return response.data.data!;
  },

  /**
   * Get a single submission by ID
   * GET /submissions/{submissionId}
   */
  getById: async (submissionId: number): Promise<SubmissionDetail> => {
    const response = await api.get<ApiResponse<SubmissionDetail>>(
      `/submissions/${submissionId}`
    );
    return response.data.data!;
  },

  /**
   * Submit to a challenge
   * POST /challenges/{challengeId}/submit
   */
  submit: async (
    challengeId: number,
    data: SubmissionCreateRequest
  ): Promise<Submission> => {
    const formData = new FormData();

    if (data.content) {
      formData.append("content", data.content);
    }

    if (data.file) {
      formData.append("file", data.file);
    }

    const response = await api.post<ApiResponse<Submission>>(
      `/challenges/${challengeId}/submit`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.data!;
  },

  /**
   * Update a submission (for instructors/admins)
   * PUT /submissions/{submissionId}
   */
  update: async (
    submissionId: number,
    data: SubmissionUpdateRequest
  ): Promise<Submission> => {
    const response = await api.put<ApiResponse<Submission>>(
      `/submissions/${submissionId}`,
      data
    );
    return response.data.data!;
  },

  /**
   * Delete a submission
   * DELETE /submissions/{submissionId}
   */
  delete: async (submissionId: number): Promise<void> => {
    await api.delete(`/submissions/${submissionId}`);
  },

  /**
   * Get temporary download URL for submission file
   * GET /submissions/{submissionId}/file
   */
  file: async (submissionId: number): Promise<{ name: string; url: string; expires_at: string }> => {
    const response = await api.get<ApiResponse<SubmissionFileResponse>>(
      `/submissions/${submissionId}/file`
    );
    return response.data.data!.file;
  },
};
