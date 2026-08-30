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
  description?: string | null;
  metadata?: Record<string, any> | null;
  order?: number | null;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: number;
  module_id: number;
  title: string;
  slug: string;
  description?: string | null;
  content: string;
  video_url: string | null;
  duration?: number | null;
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

// ─────────────────────────────────────────────────────────────────────────────
// Challenge Settings
// Stored in challenges.settings (JSON column).
// Contains runtime behaviour config — NOT question data.
// ─────────────────────────────────────────────────────────────────────────────
export type ChallengeSettings = {
  // ── Scoring ──────────────────────────────────────────────────────────────
  minimum_score?: number;   // minimum score to pass (0–100)
  passing_score?: number;   // passing percentage threshold (default 70)
  time_limit?: number;      // seconds (timed_exam)

  // ── multiple_choice (single-question) ────────────────────────────────────
  // For single-question MCQ the one question lives here (legacy path).
  // New challenges use metadata.questions instead — see below.
  shuffle_options?: boolean;
  show_correct_answers?: boolean;
  options?: ChallengeOption[];           // legacy single-MCQ options
  explanation?: string;                  // legacy single-MCQ explanation

  // ── fill_blank ───────────────────────────────────────────────────────────
  case_sensitive?: boolean;

  // ── code_editor ──────────────────────────────────────────────────────────
  allow_run_tests?: boolean;

  // ── file_upload ──────────────────────────────────────────────────────────
  max_file_size_mb?: number;
  allowed_extensions?: string[];

  // ── github_submission ────────────────────────────────────────────────────
  required_branch?: string;
  repository_visibility?: string;

  // ── docker_project ───────────────────────────────────────────────────────
  required_files?: string[];

  // ── timed_exam ───────────────────────────────────────────────────────────
  can_pause?: boolean;
  show_timer?: boolean;

  // ── quiz_group / mixed ───────────────────────────────────────────────────
  shuffle_questions?: boolean;
  show_results_immediately?: boolean;

  [key: string]: unknown;
};

// ─────────────────────────────────────────────────────────────────────────────
// Challenge Metadata
// Stored in challenges.metadata (JSON column).
// Contains question/content data — NOT runtime config.
//
// CANONICAL CONTRACT (quiz_group | multiple_choice | mixed | essay):
//
//   metadata: {
//     questions: [
//       {                              ← MCQ question
//         type:    "multiple_choice",
//         question: "...",
//         options:  ["A text", "B text", "C text", "D text"],  // string[]
//         answer:   "B",             // uppercase letter A–D
//         score:    10,
//       },
//       {                              ← Essay question
//         type:    "essay",
//         question: "...",
//         rubric:  "Kriteria penilaian...",
//         score:   20,
//       },
//     ]
//   }
//
// AutoGradingService reads metadata.questions[].answer for MCQ grading.
// QuizGroupForm reads metadata.questions[].options (string[]) for rendering.
// ─────────────────────────────────────────────────────────────────────────────
export type ChallengeMetadata = {
  // ── Canonical question list (quiz_group | multiple_choice | essay | mixed) ─
  questions?: Question[];

  // ── code_editor ──────────────────────────────────────────────────────────
  language?: string;
  starter_code?: string;
  expected_output?: string;
  test_cases?: Array<{ input: string; expected_output: string; is_hidden: boolean }>;

  // ── Common (file_upload / github_submission / docker_project) ────────────
  instructions?: string;
  requirements?: string[];
  checklist?: string[];
  deliverables?: string[];
  evaluation_criteria?: Record<string, string>;
  url_pattern?: string;

  // ── fill_blank ───────────────────────────────────────────────────────────
  blanks?: Array<{ position: number; expected_answer: string }>;
  case_sensitive?: boolean;
  partial_credit?: boolean;

  // ── timed_exam ───────────────────────────────────────────────────────────
  time_limit_minutes?: number;
  total_questions?: number;
  question_types?: string[];
  shuffle_questions?: boolean;
  shuffle_answers?: boolean;
  show_results_immediately?: boolean;
  retry_allowed?: boolean;
  can_pause?: boolean;
  show_timer?: boolean;

  // ── github_submission ────────────────────────────────────────────────────
  required_branch?: string;
  repository_visibility?: string;

  [key: string]: unknown;
};

export type ChallengeAttachment = {
  id: number;
  title: string;
  description: string;
  type: string;
  file_name: string;
  mime_type: string;
  size: number;
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
  status: "active" | "completed" | "dropped" | "paused";
  enrolled_at: string;
  completed_at: string | null;
  dropped_at: string | null;
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
