import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/response";

// API Response types matching actual API structure
export interface MeResponse {
  user: UserResource;
  profile: ProfileResource;
}

export interface UserResource {
  id: string;
  puid: string | null;
  name: string;
  email: string;
  provider: string;
  avatar: {
    url: string;
    expires_at: string;
  } | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileResource {
  id: string;
  user_id: string;
  study_class_id: number | null;
  display_name: string | null;
  points: number;
  last_login_at: string;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user?: UserResource;
  study_class?: StudyClass;
  roles: Role[];
  achievements: Achievement[];
}

export interface StudyClass {
  id: number;
  name: string;
  code: string;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string | null;
  badge_url: string | null;
  earned_at: string;
  metadata: Record<string, any> | null;
}

// Request types matching actual API
export interface ProfileUpdateRequest {
  display_name?: string | null;
  study_class_id?: number | null;
}

// For backwards compatibility with existing UI components
export type UserProfile = MeResponse;

/**
 * Profile Service
 * Handles all profile-related API operations using correct endpoints
 */
export const ProfileService = {
  /**
   * GET /me - Get current authenticated user with profile data
   * Returns both user and profile information including achievements
   */
  getProfile: async (): Promise<MeResponse> => {
    const response = await api.get<ApiResponse<MeResponse>>("/me");
    return response.data.data!;
  },

  /**
   * PUT /profiles/{profile} - Update current user's profile
   * Only display_name and study_class_id can be updated
   */
  updateProfile: async (data: ProfileUpdateRequest): Promise<ProfileResource> => {
    // First get current profile to obtain the ID
    const me = await ProfileService.getProfile();
    const profileId = me.profile.id;

    const response = await api.put<ApiResponse<ProfileResource>>(
      `/profiles/${profileId}`,
      data
    );
    return response.data.data!;
  },

  /**
   * POST /profiles/{profile}/avatar - Upload profile avatar
   */
  uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    // First get current profile to obtain the ID
    const me = await ProfileService.getProfile();
    const profileId = me.profile.id;

    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.post<ApiResponse<{ avatar_url: string }>>(
      `/profiles/${profileId}/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data!;
  },

  /**
   * DELETE /profiles/{profile}/avatar - Delete profile avatar
   */
  deleteAvatar: async (): Promise<{ message: string }> => {
    // First get current profile to obtain the ID
    const me = await ProfileService.getProfile();
    const profileId = me.profile.id;

    const response = await api.delete<ApiResponse<{ message: string }>>(
      `/profiles/${profileId}/avatar`
    );
    return response.data.data!;
  },

  /**
   * Get achievements from profile data
   * Achievements are included in the profile response from GET /me
   */
  getAchievements: async (): Promise<Achievement[]> => {
    const me = await ProfileService.getProfile();
    return me.profile?.achievements || [];
  },
};
