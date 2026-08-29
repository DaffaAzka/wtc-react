// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type ProgressAvatar =
  | string
  | { url: string; expires_at: string }
  | null
  | undefined;

export type ProgressPagination = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

// ---------------------------------------------------------------------------
// Profile list (GET /student-progress/profiles)
// ---------------------------------------------------------------------------

export type ProgressProfileSummary = {
  id: string;
  display_name: string;
  avatar: ProgressAvatar;
  points: number;
  enrolled_tracks_count: number;
  completed_tracks_count: number;
  in_progress_tracks_count: number;
  overall_progress: number;
};

// ---------------------------------------------------------------------------
// Profile detail (GET /student-progress/profiles/{profile})
// ---------------------------------------------------------------------------

export type ProfileTrackProgress = {
  id: number;
  title: string;
  slug: string;
  modules_count: number;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  status: "in_progress" | "completed";
  enrolled_at: string | null;
};

export type ProgressProfileDetail = {
  profile: {
    id: string;
    display_name: string;
    avatar: ProgressAvatar;
    points: number;
  };
  tracks: ProfileTrackProgress[];
};

// ---------------------------------------------------------------------------
// Track list (GET /student-progress/tracks)
// ---------------------------------------------------------------------------

export type ProgressTrackSummary = {
  id: number;
  title: string;
  slug: string;
  image_url: string | null;
  modules_count: number;
  total_lessons: number;
  enrolled_count: number;
  avg_progress_percentage: number;
  completed_count: number;
};

// ---------------------------------------------------------------------------
// Track detail (GET /student-progress/tracks/{track})
// ---------------------------------------------------------------------------

export type TrackProfileProgress = {
  id: string;
  display_name: string;
  avatar: ProgressAvatar;
  points: number;
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
  status: "in_progress" | "completed";
  enrolled_at: string | null;
};

export type ProgressTrackDetail = {
  track: {
    id: number;
    title: string;
    slug: string;
    image_url: string | null;
    modules_count: number;
    total_lessons: number;
    enrolled_count: number;
  };
  profiles: TrackProfileProgress[];
};

// ---------------------------------------------------------------------------
// Paginated response shapes (matching backend {data: [...], meta: {...}})
// ---------------------------------------------------------------------------

export type ProgressProfilesResponse = {
  data: ProgressProfileSummary[];
  meta: ProgressPagination;
};

export type ProgressTracksResponse = {
  data: ProgressTrackSummary[];
  meta: ProgressPagination;
};

// ---------------------------------------------------------------------------
// Query param types
// ---------------------------------------------------------------------------

export type ProfileProgressSort =
  | "name_asc"
  | "progress_desc"
  | "progress_asc"
  | "points_desc";

export type TrackProgressSort =
  | "title_asc"
  | "avg_progress_desc"
  | "avg_progress_asc"
  | "enrolled_desc";

export type GetProgressProfilesParams = {
  search?: string;
  sort?: ProfileProgressSort;
  page?: number;
  per_page?: number;
};

export type GetProgressProfileDetailParams = {
  status?: "in_progress" | "completed";
  sort?: "progress_desc" | "progress_asc" | "title_asc";
};

export type GetProgressTracksParams = {
  search?: string;
  sort?: TrackProgressSort;
  page?: number;
  per_page?: number;
  /** Pass false to fetch tracks with no enrollments */
  enrolled?: boolean;
};

export type GetProgressTrackDetailParams = {
  status?: "in_progress" | "completed";
  sort?: "progress_desc" | "progress_asc" | "name_asc";
};
