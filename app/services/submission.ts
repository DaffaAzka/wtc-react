import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/response";
import type {
  Submission as AppSubmission,
  SubmissionDetail as AppSubmissionDetail,
  SubmissionStatus,
} from "@/types/submission";

export type Submission = AppSubmission;
export type SubmissionStatusType = SubmissionStatus;

export type SubmissionWithProfile = AppSubmission & {
  profile: {
    id: number;
    display_name: string | null;
    email: string;
    avatar: string | null;
  };
};

export type SubmissionDetail = AppSubmissionDetail;

export type ChallengeSubmissionsData = {
  challenge: {
    id: number;
    title: string;
    slug: string;
    type: string;
    max_score: number;
    allowed_attempts: number;
  };
  students: Array<{
    profile: {
      id: number;
      display_name: string | null;
      email: string;
      avatar: string | null;
    };
    submission_count: number;
    status: "not_submitted" | "submitted";
    attempts: Array<{
      id: number;
      attempt_number: number;
      status: string;
      score: number | null;
      submitted_at: string | null;
    }>;
  }>;
};

export type SubmitRequest = {
  file?: File;
  content?: string;
};

export type UpdateSubmissionRequest = {
  status?: "draft" | "submitted" | "graded" | "returned";
  score?: number;
  feedback?: string;
};

export const SubmissionService = {
  /**
   * Get all student submissions for a challenge (admin/instructor)
   * GET /challenges/{challengeId}/submissions
   */
  index: async (challengeId: number): Promise<ChallengeSubmissionsData> => {
    const response = await api.get<ApiResponse<ChallengeSubmissionsData>>(
      `/challenges/${challengeId}/submissions`,
    );
    return response.data.data!;
  },

  /**
   * Submit a new submission for a challenge
   * POST /challenges/{challengeId}/submit
   */
  store: async (
    challengeId: number,
    request: SubmitRequest,
  ): Promise<Submission> => {
    const formData = new FormData();

    if (request.file) {
      formData.append("file", request.file);
    }

    if (request.content) {
      formData.append("content", request.content);
    }

    const response = await api.post<ApiResponse<Submission>>(
      `/challenges/${challengeId}/submit`,
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
   * Get authenticated user's submissions for a challenge
   * GET /challenges/{challengeId}/my-submissions
   */
  mySubmissions: async (challengeId: number): Promise<Submission[]> => {
    const response = await api.get<ApiResponse<Submission[]>>(
      `/challenges/${challengeId}/my-submissions`,
    );
    return response.data.data!;
  },

  /**
   * Get a single submission in detail
   * GET /submissions/{submissionId}
   */
  show: async (submissionId: number): Promise<SubmissionDetail> => {
    const response = await api.get<ApiResponse<SubmissionDetail>>(
      `/submissions/${submissionId}`,
    );
    return response.data.data!;
  },

  /**
   * Update a submission (for grading/feedback)
   * PUT /submissions/{submissionId}
   */
  update: async (
    submissionId: number,
    request: UpdateSubmissionRequest,
  ): Promise<Submission> => {
    const response = await api.put<ApiResponse<Submission>>(
      `/submissions/${submissionId}`,
      request,
    );
    return response.data.data!;
  },

  /**
   * Get temporary download URL for submission file
   * GET /submissions/{submissionId}/file
   */
  file: async (
    submissionId: number,
  ): Promise<{ name: string; url: string; expires_at: string }> => {
    const response = await api.get<
      ApiResponse<{ file: { name: string; url: string; expires_at: string } }>
    >(`/submissions/${submissionId}/file`);
    return response.data.data!.file;
  },

  /**
   * Get all submissions for the authenticated user across all challenges
   * GET /my-submissions
   */
  getAllMySubmissions: async (): Promise<SubmissionDetail[]> => {
    const response =
      await api.get<ApiResponse<SubmissionDetail[]>>("/my-submissions");
    return response.data.data!;
  },
};
