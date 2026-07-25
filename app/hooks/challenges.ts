import { ChallengeService } from "@/services/challenge";
import type { Challenge } from "@/types/model";
import type { ApiErrorResponse } from "@/types/response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const challengeKeys = {
  all: ["challenges"] as const,
  detail: (id: number) => ["challenges", id] as const,
};

export function useGetChallenges() {
  const query = useQuery<Challenge[], ApiErrorResponse>({
    queryKey: challengeKeys.all,
    queryFn: () => ChallengeService.getAll(),
  });

  return {
    challenges: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useGetChallenge(id: number) {
  const query = useQuery<Challenge, ApiErrorResponse>({
    queryKey: challengeKeys.detail(id),
    queryFn: () => ChallengeService.getById(id),
    enabled: !!id,
  });

  return {
    challenge: query.data,
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useStoreChallenge() {
  const queryClient = useQueryClient();

  return useMutation<
    Challenge,
    ApiErrorResponse,
    Omit<Challenge, "id" | "created_at" | "updated_at">
  >({
    mutationFn: (payload) => ChallengeService.store(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: challengeKeys.all,
      });
    },
  });
}

export function useUpdateChallenge() {
  const queryClient = useQueryClient();

  return useMutation<
    Challenge,
    ApiErrorResponse,
    { id: number } & Omit<Challenge, "id" | "created_at" | "updated_at">
  >({
    mutationFn: (payload) => ChallengeService.update(payload.id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: challengeKeys.all,
      });
    },
  });
}

export function useDeleteChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ChallengeService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: challengeKeys.all,
      });
    },
  });
}
