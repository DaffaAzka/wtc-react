import type { Question } from "./challenge";

export type ProfileAvatar = string | { url: string; expires_at: string } | null;

export type RoleName = "admin" | "teacher" | "student";

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
  minimum_score?: number;
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
    | "fill_blank"
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
  allowed_attempts: number | null;
  attachments?: ChallengeAttachment[];
  created_at: string | null;
  updated_at: string | null;
};

// ========================================
// Learning State Types (Track Overview)
// ========================================

export type LessonState = "locked" | "current" | "completed";

export type LessonWithState = Lesson & {
  state: LessonState;
  completed: boolean;
  challenges_count?: number;
  duration?: number;
};

export type ModuleProgress = {
  percent: number;
  completed_lessons: number;
  total_lessons: number;
  completed_challenges: number;
  total_challenges: number;
};

export type ModuleWithProgress = Module & {
  progress: ModuleProgress;
  lessons: LessonWithState[];
  direct_challenges?: Challenge[];
  description?: string;
};

export type EnrollmentInfo = {
  status: "active" | "completed" | "inactive";
  enrolled_at: string;
  completed_at: string | null;
};

export type TrackProgress = {
  percent: number;
  completed_lessons: number;
  total_lessons: number;
  completed_challenges: number;
  total_challenges: number;
};

export type TrackOverview = {
  track: Track;
  enrollment: EnrollmentInfo;
  progress: TrackProgress;
  modules: ModuleWithProgress[];
};
