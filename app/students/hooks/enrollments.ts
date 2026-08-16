import { EnrollmentService } from "@/students/services/enrollment";
import type { MyTrack, TrackEnrollment, TrackProgress } from "@/students/types/enrollment";
import type { ApiErrorResponse } from "@/types/response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const enrollmentKeys = {
  myTracks: ["my-tracks"] as const,
  myProgress: ["my-progress"] as const,
  trackEnrollment: (slug: string) => ["track-enrollment", slug] as const,
  trackProgress: (slug: string) => ["track-progress", slug] as const,
};

// Get all tracks the user is enrolled in
export function useMyTracks() {
  const query = useQuery<MyTrack[], ApiErrorResponse>({
    queryKey: enrollmentKeys.myTracks,
    queryFn: async () => {
      console.log("?? [useMyTracks] Fetching enrolled tracks...");
      const data = await EnrollmentService.getMyTracks();
      console.log("? [useMyTracks] Received data:", data);
      console.log("?? [useMyTracks] Total tracks:", data.length);
      return data;
    },
    refetchOnMount: "always",
  });

  console.log("?? [useMyTracks] Current state:", {
    loading: query.isLoading,
    tracksCount: query.data?.length ?? 0,
    error: query.error,
  });

  return {
    myTracks: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

// Get progress for all enrolled tracks
export function useMyProgress() {
  const query = useQuery<TrackProgress[], ApiErrorResponse>({
    queryKey: enrollmentKeys.myProgress,
    queryFn: () => EnrollmentService.getMyProgress(),
    refetchOnMount: "always",
  });

  return {
    progressData: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

// Get enrollment status for a specific track
export function useTrackEnrollment(trackSlug: string) {
  const query = useQuery<TrackEnrollment, ApiErrorResponse>({
    queryKey: enrollmentKeys.trackEnrollment(trackSlug),
    queryFn: () => EnrollmentService.getEnrollmentStatus(trackSlug),
    enabled: !!trackSlug,
  });

  return {
    enrollment: query.data,
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

// Get progress for a specific track
export function useTrackProgress(trackSlug: string) {
  const query = useQuery<TrackProgress, ApiErrorResponse>({
    queryKey: enrollmentKeys.trackProgress(trackSlug),
    queryFn: () => EnrollmentService.getTrackProgress(trackSlug),
    enabled: !!trackSlug,
  });

  return {
    progress: query.data,
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

// Enroll in a track
export function useEnrollTrack() {
  const queryClient = useQueryClient();
  
  return useMutation<TrackEnrollment, ApiErrorResponse, string>({
    mutationFn: async (trackSlug: string) => {
      console.log("?? [useEnrollTrack] Enrolling in track:", trackSlug);
      const result = await EnrollmentService.enroll(trackSlug);
      console.log("? [useEnrollTrack] Enrollment successful:", result);
      return result;
    },
    onSuccess: async (data, trackSlug) => {
      console.log("?? [useEnrollTrack] Starting refetch after enrollment...");
      
      // Explicitly refetch queries to ensure immediate update
      await Promise.all([
        queryClient.refetchQueries({ queryKey: enrollmentKeys.myTracks }),
        queryClient.refetchQueries({ queryKey: enrollmentKeys.myProgress }),
        queryClient.refetchQueries({ queryKey: enrollmentKeys.trackEnrollment(trackSlug) }),
      ]);
      
      console.log("? [useEnrollTrack] Refetch completed");
      
      // Show success toast
      toast.success("Berhasil mendaftar ke track.", {
        description: "Kamu sudah bisa mulai belajar sekarang.",
      });
    },
    onError: (error) => {
      console.error("? [useEnrollTrack] Enrollment failed:", error);
      toast.error("Gagal mendaftar ke track.", {
        description: error.message || "Terjadi kesalahan saat mendaftar.",
      });
    },
  });
}

// Unenroll from a track
export function useUnenrollTrack() {
  const queryClient = useQueryClient();
  
  return useMutation<void, ApiErrorResponse, string>({
    mutationFn: (trackSlug: string) => EnrollmentService.unenroll(trackSlug),
    onSuccess: async (_, trackSlug) => {
      // Explicitly refetch queries
      await Promise.all([
        queryClient.refetchQueries({ queryKey: enrollmentKeys.myTracks }),
        queryClient.refetchQueries({ queryKey: enrollmentKeys.myProgress }),
        queryClient.refetchQueries({ queryKey: enrollmentKeys.trackEnrollment(trackSlug) }),
      ]);
      
      // Show success toast
      toast.success("Berhasil keluar dari track.", {
        description: "Kamu dapat mendaftar kembali kapan saja.",
      });
    },
    onError: (error) => {
      toast.error("Gagal keluar dari track.", {
        description: error.message || "Terjadi kesalahan.",
      });
    },
  });
}