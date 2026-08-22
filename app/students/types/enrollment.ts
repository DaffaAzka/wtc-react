import type { Track } from "@/types/model";

export type TrackEnrollment = {
  id: number;
  track_id: number;
  profile_id: string;
  status: "active" | "completed" | "dropped"; // Changed from "enrolled" to "active"
  enrolled_at: string;
  completed_at: string | null;
  dropped_at: string | null;
  created_at: string;
  updated_at: string;
  track?: Track;
};

export type MyTrack = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  enrollment: {
    status: "active" | "completed" | "dropped";
    enrolled_at: string | null;
    completed_at: string | null;
    progress_percentage?: number;
    completed_modules?: number;
    points_earned?: number;
  };
  modules_count: string | number;
};

export type TrackProgressData = {
  percent: string;
  completed_modules: string;
  total_modules: string;
  completed_challenges: string;
  total_challenges: string;
};

export type TrackProgress = {
  track: Track;
  enrollment: TrackEnrollment;
  progress: TrackProgressData;
  modules: any;
};
