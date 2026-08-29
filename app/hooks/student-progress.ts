import { useQuery } from "@tanstack/react-query";
import {
  getProgressProfiles,
  getProgressProfile,
  getProgressTracks,
  getProgressTrack,
} from "@/services/student-progress";
import type {
  GetProgressProfilesParams,
  GetProgressTracksParams,
  GetProgressProfileDetailParams,
  GetProgressTrackDetailParams,
} from "@/types/student-progress";

// ---------------------------------------------------------------------------
// Query key factories
// ---------------------------------------------------------------------------

export const studentProgressKeys = {
  all: ["student-progress"] as const,

  profiles: (params?: GetProgressProfilesParams) =>
    [...studentProgressKeys.all, "profiles", params ?? {}] as const,

  profile: (profileId: number, params?: GetProgressProfileDetailParams) =>
    [...studentProgressKeys.all, "profile", profileId, params ?? {}] as const,

  tracks: (params?: GetProgressTracksParams) =>
    [...studentProgressKeys.all, "tracks", params ?? {}] as const,

  track: (trackSlug: string, params?: GetProgressTrackDetailParams) =>
    [...studentProgressKeys.all, "track", trackSlug, params ?? {}] as const,
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useProgressProfiles(params?: GetProgressProfilesParams) {
  return useQuery({
    queryKey: studentProgressKeys.profiles(params),
    queryFn: () => getProgressProfiles(params),
  });
}

export function useProgressProfile(
  profileId: number,
  params?: GetProgressProfileDetailParams,
) {
  return useQuery({
    queryKey: studentProgressKeys.profile(profileId, params),
    queryFn: () => getProgressProfile(profileId, params),
    enabled: profileId > 0,
  });
}

export function useProgressTracks(params?: GetProgressTracksParams) {
  return useQuery({
    queryKey: studentProgressKeys.tracks(params),
    queryFn: () => getProgressTracks(params),
  });
}

export function useProgressTrack(
  trackSlug: string,
  params?: GetProgressTrackDetailParams,
) {
  return useQuery({
    queryKey: studentProgressKeys.track(trackSlug, params),
    queryFn: () => getProgressTrack(trackSlug, params),
    enabled: !!trackSlug,
  });
}
