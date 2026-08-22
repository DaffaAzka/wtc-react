import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EnrollmentService } from "@/services/enrollment";
import type {
  TrackEnrollment,
  MyTrack,
  TrackProgress,
  TrackOverview,
  DashboardData,
} from "@/services/enrollment";
import { toast } from "sonner";

// Query keys
export const enrollmentKeys = {
  all: ["enrollment"] as const,
  enrollment: (trackSlug: string) => [...enrollmentKeys.all, "status", trackSlug] as const,
  myTracks: () => [...enrollmentKeys.all, "my-tracks"] as const,
  myProgress: () => [...enrollmentKeys.all, "my-progress"] as const,
  trackProgress: (trackSlug: string) => [...enrollmentKeys.all, "track-progress", trackSlug] as const,
  trackOverview: (trackSlug: string) => [...enrollmentKeys.all, "track-overview", trackSlug] as const,
  dashboard: () => [...enrollmentKeys.all, "dashboard"] as const,
};

/**
 * Hook to enroll in a track
 */
export function useEnroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackSlug: string) => EnrollmentService.enroll(trackSlug),
    onSuccess: (data, trackSlug) => {
      toast.success("Berhasil mendaftar ke track!");

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.enrollment(trackSlug) });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.myTracks() });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.myProgress() });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.dashboard() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal mendaftar ke track");
    },
  });
}

/**
 * Hook to unenroll from a track
 */
export function useUnenroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trackSlug: string) => EnrollmentService.unenroll(trackSlug),
    onSuccess: (data, trackSlug) => {
      toast.success("Berhasil keluar dari track");

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.enrollment(trackSlug) });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.myTracks() });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.myProgress() });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.dashboard() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal keluar dari track");
    },
  });
}

/**
 * Hook to get enrollment status for a track
 */
export function useGetEnrollment(trackSlug: string) {
  return useQuery({
    queryKey: enrollmentKeys.enrollment(trackSlug),
    queryFn: () => EnrollmentService.getEnrollment(trackSlug),
    enabled: !!trackSlug,
  });
}

/**
 * Hook to get all tracks the user is enrolled in
 */
export function useMyTracks() {
  return useQuery({
    queryKey: enrollmentKeys.myTracks(),
    queryFn: () => EnrollmentService.myTracks(),
  });
}

/**
 * Hook to get learning progress for all enrolled tracks
 */
export function useMyProgress() {
  return useQuery({
    queryKey: enrollmentKeys.myProgress(),
    queryFn: () => EnrollmentService.myProgress(),
  });
}

/**
 * Hook to get detailed progress for a specific track
 */
export function useTrackProgress(trackSlug: string) {
  return useQuery({
    queryKey: enrollmentKeys.trackProgress(trackSlug),
    queryFn: () => EnrollmentService.trackProgress(trackSlug),
    enabled: !!trackSlug,
  });
}

/**
 * Hook to get comprehensive track overview
 */
export function useTrackOverview(trackSlug: string) {
  return useQuery({
    queryKey: enrollmentKeys.trackOverview(trackSlug),
    queryFn: () => EnrollmentService.trackOverview(trackSlug),
    enabled: !!trackSlug,
  });
}

/**
 * Hook to get student dashboard data
 */
export function useDashboard() {
  return useQuery({
    queryKey: enrollmentKeys.dashboard(),
    queryFn: () => EnrollmentService.dashboard(),
  });
}
