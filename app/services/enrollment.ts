import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/response";

// Enrollment response types
export type TrackEnrollment = {
  id: number;
  profile_id: number;
  track_id: number;
  enrolled_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MyTrack = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  enrollment: {
    enrolled_at: string;
    completed_at: string | null;
  };
  progress: {
    percent: number;
    completed_lessons: number;
    total_lessons: number;
  };
};

export type TrackProgress = {
  track: {
    id: number;
    title: string;
    slug: string;
  };
  progress: {
    percent: number;
    completed_lessons: number;
    total_lessons: number;
    completed_challenges: number;
    total_challenges: number;
  };
  last_activity: string | null;
};

export type ModuleWithProgress = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  order: number;
  progress: {
    percent: number;
    completed_lessons: number;
    total_lessons: number;
    completed_challenges: number;
    total_challenges: number;
  };
  lessons: LessonWithState[];
};

export type LessonWithState = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  order: number;
  duration: number | null;
  video_url: string | null;
  state: "locked" | "current" | "completed";
  completed: boolean;
  completed_at: string | null;
  challenges_count: number;
  completed_challenges_count: number;
};

export type TrackOverview = {
  track: {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    image_url: string | null;
  };
  enrollment: {
    status: string;
    enrolled_at: string | null;
    completed_at: string | null;
  };
  progress: {
    percent: number;
    completed_lessons: number;
    total_lessons: number;
    completed_challenges: number;
    total_challenges: number;
  };
  modules: ModuleWithProgress[];
};

export type DashboardData = {
  overview: {
    enrolled_tracks: number;
    completed_lessons: number;
    total_lessons: number;
    completed_challenges: number;
    total_challenges: number;
    overall_progress: number;
  };
  recent_activity: Array<{
    type: "lesson" | "challenge";
    id: number;
    title: string;
    completed_at: string;
    track: {
      title: string;
      slug: string;
    };
  }>;
  enrolled_tracks: Array<{
    id: number;
    title: string;
    slug: string;
    image_url: string | null;
    progress: number;
    last_activity: string | null;
  }>;
};

export const EnrollmentService = {
  /**
   * Enroll authenticated user in a track
   * POST /tracks/{trackSlug}/enrollment
   */
  enroll: async (trackSlug: string): Promise<TrackEnrollment> => {
    const response = await api.post<ApiResponse<TrackEnrollment>>(
      `/tracks/${trackSlug}/enrollment`,
    );
    return response.data.data!;
  },

  /**
   * Unenroll authenticated user from a track
   * DELETE /tracks/{trackSlug}/enrollment
   */
  unenroll: async (trackSlug: string): Promise<void> => {
    await api.delete(`/tracks/${trackSlug}/enrollment`);
  },

  /**
   * Get enrollment status for a specific track
   * GET /tracks/{trackSlug}/enrollment
   */
  getEnrollment: async (trackSlug: string): Promise<TrackEnrollment | null> => {
    try {
      const response = await api.get<ApiResponse<TrackEnrollment>>(
        `/tracks/${trackSlug}/enrollment`,
      );
      return response.data.data!;
    } catch (error: any) {
      // Return null if not enrolled (404)
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get all tracks the authenticated user is enrolled in
   * GET /my/tracks
   */
  myTracks: async (): Promise<MyTrack[]> => {
    const response = await api.get<ApiResponse<MyTrack[]>>("/my/tracks");
    return response.data.data!;
  },

  /**
   * Get learning progress for all enrolled tracks
   * GET /my/progress
   */
  myProgress: async (): Promise<TrackProgress[]> => {
    const response = await api.get<ApiResponse<TrackProgress[]>>("/my/progress");
    return response.data.data!;
  },

  /**
   * Get detailed progress for a specific enrolled track
   * GET /my/tracks/{trackSlug}/progress
   */
  trackProgress: async (trackSlug: string): Promise<TrackProgress> => {
    const response = await api.get<ApiResponse<TrackProgress>>(
      `/my/tracks/${trackSlug}/progress`,
    );
    return response.data.data!;
  },

  /**
   * Get comprehensive track overview with modules and lessons
   * GET /my/tracks/{trackSlug}/overview
   */
  trackOverview: async (trackSlug: string): Promise<TrackOverview> => {
    const response = await api.get<ApiResponse<TrackOverview>>(
      `/my/tracks/${trackSlug}/overview`,
    );
    return response.data.data!;
  },

  /**
   * Get student dashboard data
   * GET /my/dashboard
   */
  dashboard: async (): Promise<DashboardData> => {
    const response = await api.get<ApiResponse<DashboardData>>("/my/dashboard");
    return response.data.data!;
  },
};
