import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/response";
import type { Achievement, EarnedAchievement, Badge } from "@/types/certificate";

export type AchievementRequest = {
  name: string;
  description?: string | null;
  badge_emoji: string;
  trigger_type: Achievement["trigger_type"];
  trigger_config?: Achievement["trigger_config"];
  points_reward: number;
  is_active: boolean;
};

export const AchievementService = {
  getAchievements: async (): Promise<Achievement[]> => {
    const res = await api.get<ApiResponse<Achievement[]>>("/achievements");
    return res.data.data!;
  },

  getAdminAchievements: async (): Promise<Achievement[]> => {
    const res = await api.get<ApiResponse<Achievement[]>>("/admin/achievements");
    return res.data.data!;
  },

  createAchievement: async (data: AchievementRequest): Promise<Achievement> => {
    const res = await api.post<ApiResponse<Achievement>>("/admin/achievements", data);
    return res.data.data!;
  },

  updateAchievement: async (id: number, data: AchievementRequest): Promise<Achievement> => {
    const res = await api.put<ApiResponse<Achievement>>(`/admin/achievements/${id}`, data);
    return res.data.data!;
  },

  deleteAchievement: async (id: number): Promise<void> => {
    await api.delete(`/admin/achievements/${id}`);
  },

  toggleAchievement: async (id: number, is_active: boolean): Promise<Achievement> => {
    const res = await api.put<ApiResponse<Achievement>>(`/admin/achievements/${id}`, { is_active });
    return res.data.data!;
  },

  getProfileAchievements: async (profileId: string): Promise<EarnedAchievement[]> => {
    const res = await api.get<ApiResponse<EarnedAchievement[]>>(`/profiles/${profileId}/achievements`);
    return res.data.data!;
  },

  getProfileBadges: async (profileId: string): Promise<Badge[]> => {
    const res = await api.get<ApiResponse<Badge[]>>(`/profiles/${profileId}/badges`);
    return res.data.data!;
  },

  pinBadge: async (profileId: string, achievement_id: number): Promise<Badge> => {
    const res = await api.post<ApiResponse<Badge>>(`/profiles/${profileId}/badges`, { achievement_id });
    return res.data.data!;
  },

  unpinBadge: async (profileId: string, achievementId: number): Promise<void> => {
    await api.delete(`/profiles/${profileId}/badges/${achievementId}`);
  },
};
