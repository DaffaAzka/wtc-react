import { api } from "@/lib/axios";
import type { MyTrack, TrackEnrollment, TrackProgress } from "@/students/types/enrollment";
import type { ApiResponse } from "@/types/response";

export const EnrollmentService = {
  // Enroll in a track
  enroll: async (trackSlug: string): Promise<TrackEnrollment> => {
    const response = await api.post<ApiResponse<TrackEnrollment>>(
      `/tracks/${trackSlug}/enroll`,
    );
    return response.data.data!;
  },

  // Unenroll from a track
  unenroll: async (trackSlug: string): Promise<void> => {
    await api.delete(`/tracks/${trackSlug}/enroll`);
  },

  // Get enrollment status for a specific track
  getEnrollmentStatus: async (trackSlug: string): Promise<TrackEnrollment> => {
    const response = await api.get<ApiResponse<TrackEnrollment>>(
      `/tracks/${trackSlug}/enrollment`,
    );
    return response.data.data!;
  },

  // Get all tracks the user is enrolled in
  getMyTracks: async (): Promise<MyTrack[]> => {
    const response = await api.get<ApiResponse<MyTrack[]>>("/my/tracks");
    return response.data.data!;
  },

  // Get progress for all enrolled tracks
  getMyProgress: async (): Promise<TrackProgress[]> => {
    const response = await api.get<ApiResponse<TrackProgress[]>>("/my/progress");
    return response.data.data!;
  },

  // Get progress for a specific track
  getTrackProgress: async (trackSlug: string): Promise<TrackProgress> => {
    const response = await api.get<ApiResponse<TrackProgress>>(
      `/my/tracks/${trackSlug}/progress`,
    );
    return response.data.data!;
  },
};