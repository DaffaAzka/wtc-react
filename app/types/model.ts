export type User = {
  id: number;
  study_class_id: number | null;
  name: string;
  email: string;
  role: string;
};

export type Track = {
  id: number;
  slug: string;
  title: string;
  order: number;
  image_url: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type Module = {
  id: number;
  track_id: number;
  slug: string;
  title: string;
  order: number;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: number;
  module_id: number;
  title: string;
  content: string;
  video_url: string | null;
  order: number;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
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
    | "code_editor"
    | "file_upload"
    | "github_submission"
    | "docker_project"
    | "timed_exam"
    | "quiz_group";
  content: string;
  metadata: Record<string, unknown> | null;
  max_score: number;
  created_at: string | null;
  updated_at: string | null;
};
