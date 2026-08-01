export type Profile = {
  puid: string;
  study_class_id: number | null;
  nickname: string | null; //editable
  display_name: string | null; //not editable
  avatar_key: string | null;
  avatar? : string | null;
  email: string | null;
  points: number;

  last_login_at: string | null;
  last_synced_at: string | null;

  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  roles: Role[];
};

export type Role = {
  id: number;
  name: string;
  display_name: string;
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

  // addictional
  modules_count?: number | null;
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
  slug: string;
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
