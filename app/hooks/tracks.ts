import { TrackService } from "@/services/track";
import type { Track } from "@/types/model";
import type { ApiErrorResponse } from "@/types/response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const trackKeys = {
  all: ["tracks"] as const,
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
