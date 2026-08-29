// ---------------------------------------------------------------------------
// Avatar — the backend returns either a raw URL string or a signed-URL object
// ---------------------------------------------------------------------------
export type ProgressAvatar = string | { url: string; expires_at?: string } | null;

// ---------------------------------------------------------------------------
// Profile list (GET /student-progress/profiles)
// ---------------------------------------------------------------------------
export type ProgressProfileSummary = {
  id: number;
  display_name: string;
  avatar: ProgressAvatar;
  enrolled_tracks_count: number;
  completed_tracks_count: number;
  in_progress_tracks_count: number;
  total_points: number;
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
};

export type ProgressProfileDetail = {
  profile: {
    id: number;
    display_name: string;
    avatar: ProgressAvatar;
    total_points: number;
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
  id: number;
  display_name: string;
  avatar: ProgressAvatar;
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
  status: "in_progress" | "completed";
  points: number;
};

export type ProgressTrackDetail = {
  track: {
    id: number;
    title: string;
    slug: string;
    modules_count: number;
    total_lessons: number;
  };
  profiles: TrackProfileProgress[];
};

// ---------------------------------------------------------------------------
// Shared pagination shape
// ---------------------------------------------------------------------------
export type ProgressPagination = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
};

// ---------------------------------------------------------------------------
// Paginated list responses
// ---------------------------------------------------------------------------
export type ProgressProfilesResponse = {
  profiles: ProgressProfileSummary[];
  pagination: ProgressPagination;
};

export type ProgressTracksResponse = {
  tracks: ProgressTrackSummary[];
  pagination: ProgressPagination;
};

// ---------------------------------------------------------------------------
// Query param types
// ---------------------------------------------------------------------------
export type ProfileProgressSort =
  | "progress_desc"
  | "progress_asc"
  | "name_asc"
  | "points_desc";

export type TrackProgressSort =
  | "avg_progress_desc"
  | "avg_progress_asc"
  | "enrolled_desc"
  | "title_asc";

export type ProgressStatus = "in_progress" | "completed";

export type GetProgressProfilesParams = {
  search?: string;
  sort?: ProfileProgressSort;
  page?: number;
  per_page?: number;
};

export type GetProgressTracksParams = {
  search?: string;
  sort?: TrackProgressSort;
  page?: number;
  per_page?: number;
};

export type GetProgressProfileDetailParams = {
  status?: ProgressStatus;
  sort?: "progress_desc" | "progress_asc" | "title_asc";
};

export type GetProgressTrackDetailParams = {
  status?: ProgressStatus;
  sort?: "progress_desc" | "progress_asc" | "name_asc";
};
