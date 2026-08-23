import type { Question } from "./challenge";

export type ProfileAvatar = string | { url: string; expires_at: string } | null;

export type Profile = {
  display_name: string | null;
  email: string | null;
  avatar: ProfileAvatar;
  points: number;
  study_class_id: number | null;
  roles: Role[];
  puid?: string;
};

export type Role = {
  id?: number;
  name: string;
  display_name?: string;
};

export type Track = {
  id: number;
  slug: string;
  title: string;
  order?: number | null;
  image_url: string;
  description: string;
  created_at: string;
  updated_at: string;

  // addictional
  modules_count?: number | null;
};

export type Module = {
  id: number;
  track_id: number;
  slug: string;
  title: string;
  order?: number | null;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: number;
  module_id: number;
  title: string;
  slug: string;
  content: string;
  video_url: string | null;
  order?: number | null;
  attachments?: ChallengeAttachment[];
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ChallengeOption = {
  key: string;
  text: string;
  is_correct: boolean;
};

export type ChallengeSettings = {
  shuffle_options?: boolean;
  options?: ChallengeOption[];
  explanation?: string;
  [key: string]: unknown;
};

export type ChallengeMetadata = {
  estimated_minutes?: number;
  questions?: Question[];
  [key: string]: unknown;
};

export type ChallengeAttachment = {
  id: string;
  title: string;
  description: string;
  type: string;
  file_name: string;
  mime_type: string;
  size: string;
  created_at: string;
  updated_at: string;
};

export type Challenge = {
  id: number;
  module_id: number | null;
  lesson_id: number | null;
  title: string;
  slug: string;
  type:
    | "multiple_choice"
    | "essay"
    | "code_editor"
    | "file_upload"
    | "github_submission"
    | "docker_project"
    | "timed_exam"
    | "quiz_group";
  difficulty?: "easy" | "medium" | "hard";
  order?: number;
  content: string;
  settings: ChallengeSettings | null;
  metadata: ChallengeMetadata | null;
  max_score: number;
  points?: number;
  allowed_attempts?: number;
  attachments?: ChallengeAttachment[];
  created_at: string | null;
  updated_at: string | null;
};
