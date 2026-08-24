import { ChallengeService } from "@/services/challenge";
import type { Challenge } from "@/types/model";
import type { ApiErrorResponse, PaginatedResponse } from "@/types/response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const challengeKeys = {
  all: ["challenges"] as const,
  byLesson: (lessonId: number) => ["challenges", "lesson", lessonId] as const,
  byModule: (moduleSlug: string) => ["challenges", "module", moduleSlug] as const,
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

export function useGetChallengesPaginated(params?: {
  page?: number;
  per_page?: number;
}) {
  const query = useQuery<PaginatedResponse<Challenge>, ApiErrorResponse>({
    queryKey: [...challengeKeys.all, "paginated", params],
    queryFn: () => ChallengeService.getAllPaginated(params),
  });

  return {
    challenges: query.data?.data ?? [],
    pagination: query.data?.meta,
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useGetChallengesByLesson(lessonId: number) {
  const query = useQuery<Challenge[], ApiErrorResponse>({
    queryKey: challengeKeys.byLesson(lessonId),
    queryFn: () => ChallengeService.getByLesson(lessonId),
    enabled: !!lessonId,
  });

  return {
    challenges: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useGetChallengesByModule(moduleSlug: string) {
  const query = useQuery<Challenge[], ApiErrorResponse>({
    queryKey: challengeKeys.byModule(moduleSlug),
    queryFn: () => ChallengeService.getByModule(moduleSlug),
    enabled: !!moduleSlug,
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

export function useStoreChallenge(lessonId?: number, moduleSlug?: string) {
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

      if (lessonId) {
        queryClient.invalidateQueries({
          queryKey: challengeKeys.byLesson(lessonId),
        });
      }

      if (moduleSlug) {
        queryClient.invalidateQueries({
          queryKey: challengeKeys.byModule(moduleSlug),
        });
      }
    },
  });
}

export function useUpdateChallenge(lessonId?: number, moduleSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation<
    Challenge,
    ApiErrorResponse,
    { id: number } & Omit<Challenge, "id" | "created_at" | "updated_at">
  >({
    mutationFn: (payload) => ChallengeService.update(payload.id, payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: challengeKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: challengeKeys.detail(data.id),
      });

      if (lessonId) {
        queryClient.invalidateQueries({
          queryKey: challengeKeys.byLesson(lessonId),
        });
      }

      if (moduleSlug) {
        queryClient.invalidateQueries({
          queryKey: challengeKeys.byModule(moduleSlug),
        });
      }
    },
  });
}

export function useDeleteChallenge(lessonId?: number, moduleSlug?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ChallengeService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: challengeKeys.all,
      });

      if (lessonId) {
        queryClient.invalidateQueries({
          queryKey: challengeKeys.byLesson(lessonId),
        });
      }

      if (moduleSlug) {
        queryClient.invalidateQueries({
          queryKey: challengeKeys.byModule(moduleSlug),
        });
      }
    },
  });
}
