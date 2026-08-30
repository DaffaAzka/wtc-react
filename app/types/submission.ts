import type { Challenge } from "./model";

export type SubmissionStatus =
  "submitted" | "graded" | "returned" | "pending" | "draft" | "not_submitted";

/**
 * Structured grading result returned in submission.feedback for
 * auto-graded challenges (quiz_group, multiple_choice).
 * Both FE and BE must use this exact shape.
 */
export type QuizGradingResult = {
  correct_answers: number;
  wrong_answers: number;
  total_answered: number;
  total_questions: number;
  percentage: number;
  passing_score: number;
  passed: boolean;
};

/** Parse feedback string — returns structured result or null for non-quiz. */
export function parseQuizFeedback(feedback: string | null | undefined): QuizGradingResult | null {
  if (!feedback) return null;
  try {
    const parsed = JSON.parse(feedback);
    if (typeof parsed.correct_answers === "number") return parsed as QuizGradingResult;
  } catch {}
  return null;
}

export type Submission = {
  id: number;
  challenge_id: number;
  profile_id: string | number;
  attempt_number: number;
  status: SubmissionStatus;
  auto_score: number | null;
  manual_score: number | null;
  score: number | null;
  feedback: string | null;
  file_path: string | null;
  content: string | null;
  submitted_at: string | null;
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
