import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AchievementService, type AchievementRequest } from "@/services/achievement";
import type { Achievement, EarnedAchievement, Badge } from "@/types/certificate";
import type { ApiErrorResponse } from "@/types/response";

export const achievementKeys = {
  all: ["achievements"] as const,
  active: () => ["achievements", "active"] as const,
  admin: () => ["achievements", "admin"] as const,
  profileEarned: (profileId: string) => ["achievements", "earned", profileId] as const,
  profileBadges: (profileId: string) => ["achievements", "badges", profileId] as const,
};

export function useAchievements() {
  const query = useQuery<Achievement[], ApiErrorResponse>({
    queryKey: achievementKeys.active(),
    queryFn: () => AchievementService.getAchievements(),
  });
  return {
    achievements: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useAdminAchievements() {
  const query = useQuery<Achievement[], ApiErrorResponse>({
    queryKey: achievementKeys.admin(),
    queryFn: () => AchievementService.getAdminAchievements(),
  });
  return {
    achievements: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useCreateAchievement() {
  const queryClient = useQueryClient();
  return useMutation<Achievement, ApiErrorResponse, AchievementRequest>({
    mutationFn: (data) => AchievementService.createAchievement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.admin() });
      queryClient.invalidateQueries({ queryKey: achievementKeys.active() });
    },
  });
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient();
  return useMutation<Achievement, ApiErrorResponse, { id: number } & AchievementRequest>({
    mutationFn: ({ id, ...data }) => AchievementService.updateAchievement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.admin() });
      queryClient.invalidateQueries({ queryKey: achievementKeys.active() });
    },
  });
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiErrorResponse, number>({
    mutationFn: (id) => AchievementService.deleteAchievement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.admin() });
      queryClient.invalidateQueries({ queryKey: achievementKeys.active() });
    },
  });
}

export function useToggleAchievement() {
  const queryClient = useQueryClient();
  return useMutation<Achievement, ApiErrorResponse, { id: number; is_active: boolean }>({
    mutationFn: ({ id, is_active }) => AchievementService.toggleAchievement(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.admin() });
      queryClient.invalidateQueries({ queryKey: achievementKeys.active() });
    },
  });
}

export function useProfileAchievements(profileId: string) {
  const query = useQuery<EarnedAchievement[], ApiErrorResponse>({
    queryKey: achievementKeys.profileEarned(profileId),
    queryFn: () => AchievementService.getProfileAchievements(profileId),
    enabled: !!profileId,
  });
  return {
    achievements: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useProfileBadges(profileId: string) {
  const query = useQuery<Badge[], ApiErrorResponse>({
    queryKey: achievementKeys.profileBadges(profileId),
    queryFn: () => AchievementService.getProfileBadges(profileId),
    enabled: !!profileId,
  });
  return {
    badges: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function usePinBadge(profileId: string) {
  const queryClient = useQueryClient();
  return useMutation<Badge, ApiErrorResponse, number>({
    mutationFn: (achievement_id) => AchievementService.pinBadge(profileId, achievement_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.profileBadges(profileId) });
    },
  });
}

export function useUnpinBadge(profileId: string) {
  const queryClient = useQueryClient();
  return useMutation<void, ApiErrorResponse, number>({
    mutationFn: (achievementId) => AchievementService.unpinBadge(profileId, achievementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.profileBadges(profileId) });
    },
  });
}
