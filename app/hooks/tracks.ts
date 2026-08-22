import { TrackService } from "@/services/track";
import type { Track } from "@/types/model";
import type { ApiErrorResponse, PaginatedResponse } from "@/types/response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const trackKeys = {
  all: ["tracks"] as const,
  detail: (slug: string) => ["tracks", slug] as const,
};

export function useGetTracks() {
  const query = useQuery<Track[], ApiErrorResponse>({
    queryKey: trackKeys.all,
    queryFn: () => TrackService.getAll(),
  });

  return {
    tracks: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useGetTracksPaginated(params?: {
  page?: number;
  per_page?: number;
}) {
  const query = useQuery<PaginatedResponse<Track>, ApiErrorResponse>({
    queryKey: [...trackKeys.all, "paginated", params],
    queryFn: () => TrackService.getAllPaginated(params),
  });

  return {
    tracks: query.data?.data ?? [],
    pagination: query.data?.meta,
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useGetTrack(slug: string) {
  const query = useQuery<Track, ApiErrorResponse>({
    queryKey: trackKeys.detail(slug),
    queryFn: () => TrackService.getBySlug(slug),
    enabled: !!slug,
  });

  return {
    track: query.data,
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useStoreTrack() {
  const queryClient = useQueryClient();
  return useMutation<
    Track,
    ApiErrorResponse,
    Omit<Track, "id" | "created_at" | "updated_at">
  >({
    mutationFn: (payload) => TrackService.store(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trackKeys.all });
    },
  });
}

export function useUpdateTrack() {
  const queryClient = useQueryClient();
  return useMutation<
    Track,
    ApiErrorResponse,
    Omit<Track, "id" | "created_at" | "updated_at">
  >({
    mutationFn: (payload) => TrackService.update(payload.slug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trackKeys.all });
    },
  });
}

export function useDeleteTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => TrackService.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trackKeys.all });
    },
  });
}
