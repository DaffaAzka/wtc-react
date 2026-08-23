import type { Challenge } from "./model";

export type SubmissionStatus =
  "submitted" | "graded" | "returned" | "pending" | "draft" | "not_submitted";

export type Submission = {
  id: number;
  challenge_id: number;
  profile_id: string | number;
  status: SubmissionStatus;
  score: number | null;
  feedback: string | null;
  file_path: string | null;
  content: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SubmissionDetail = {
  submission?: {
    id?: number;
    challenge_id?: number;
    challenge?: {
      id?: number;
      title?: string;
      slug?: string;
      type?: string;
      max_score?: number;
      allowed_attempts?: number;
    };
    profile?: {
      id?: number;
      display_name: string | null;
      email?: string;
      avatar?: string | { url: string; expires_at: string } | null;
    };
    status?: SubmissionStatus;
    score?: number | null;
    feedback?: string | null;
    file_path?: string | null;
    content?: string | null;
    submitted_at?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  id?: number;
  challenge_id?: number;
  challenge?: {
    id?: number;
    title?: string;
    slug?: string;
    type?: string;
    max_score?: number;
    allowed_attempts?: number;
  };
  profile?: {
    id?: number;
    display_name: string | null;
    email?: string;
    avatar?: string | { url: string; expires_at: string } | null;
  };
  status?: SubmissionStatus;
  score?: number | null;
  feedback?: string | null;
  file_path?: string | null;
  content?: string | null;
  submitted_at?: string | null;
  created_at?: string;
  updated_at?: string;
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
