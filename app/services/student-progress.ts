import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/response";
import type {
  GetProgressProfilesParams,
  GetProgressTracksParams,
  GetProgressProfileDetailParams,
  GetProgressTrackDetailParams,
  ProgressProfilesResponse,
  ProgressTracksResponse,
  ProgressProfileDetail,
  ProgressTrackDetail,
} from "@/types/student-progress";

/**
 * GET /api/student-progress/profiles
 * Paginated list of student profiles with aggregated track counts.
 */
export async function getProgressProfiles(
  params?: GetProgressProfilesParams,
): Promise<ProgressProfilesResponse> {
  const response = await api.get<ApiResponse<ProgressProfilesResponse>>(
    "/student-progress/profiles",
    { params },
  );
  return response.data.data!;
}

/**
 * GET /api/student-progress/profiles/{profileId}
 * One student's profile info plus per-track progress breakdown.
 */
export async function getProgressProfile(
  profileId: number,
  params?: GetProgressProfileDetailParams,
): Promise<ProgressProfileDetail> {
  const response = await api.get<ApiResponse<ProgressProfileDetail>>(
    `/student-progress/profiles/${profileId}`,
    { params },
  );
  return response.data.data!;
}

/**
 * GET /api/student-progress/tracks
 * Paginated list of tracks that have at least one enrollment.
 */
export async function getProgressTracks(
  params?: GetProgressTracksParams,
): Promise<ProgressTracksResponse> {
  const response = await api.get<ApiResponse<ProgressTracksResponse>>(
    "/student-progress/tracks",
    { params },
  );
  return response.data.data!;
}

/**
 * GET /api/student-progress/tracks/{trackSlug}
 * One track's info plus per-student progress breakdown.
 */
export async function getProgressTrack(
  trackSlug: string,
  params?: GetProgressTrackDetailParams,
): Promise<ProgressTrackDetail> {
  const response = await api.get<ApiResponse<ProgressTrackDetail>>(
    `/student-progress/tracks/${trackSlug}`,
    { params },
  );
  return response.data.data!;
}
