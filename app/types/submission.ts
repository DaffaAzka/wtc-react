import type { Challenge } from "./model";

export type SubmissionStatus = "submitted" | "graded" | "returned" | "pending" | "draft";

export type Submission = {
  id: number;
  challenge_id: number;
  profile_id: string;
  status: SubmissionStatus;
  score: number | null;
  feedback: string | null;
  file_path: string | null;
  content: string | null;
  submitted_at: string;
  graded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SubmissionDetail = Submission & {
  challenge?: Challenge;
  profile?: {
    display_name: string;
    email: string;
    avatar: string | null;
  };
};

export type SubmissionCreateRequest = {
  challenge_id: number;
  content?: string;
  file?: File;
};

export type SubmissionUpdateRequest = {
  status?: SubmissionStatus;
  score?: number;
  feedback?: string;
};

export type SubmissionFileResponse = {
  file: {
    name: string;
    url: string;
    expires_at: string;
  };
};
