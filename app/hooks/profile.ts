import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProfileService } from "@/services/profile";
import type { ProfileUpdateRequest } from "@/services/profile";
import { toast } from "sonner";

/**
 * Profile Query Keys
 */
export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "detail"] as const,
  achievements: () => [...profileKeys.all, "achievements"] as const,
};

/**
 * useGetProfile - Get current user's profile
 */
export function useGetProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: ProfileService.getProfile,
  });
}

/**
 * useUpdateProfile - Update current user's profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileUpdateRequest) =>
      ProfileService.updateProfile(data),
    onSuccess: () => {
      toast.success("Profile berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Gagal memperbarui profile"
      );
    },
  });
}

/**
 * useUploadAvatar - Upload profile avatar
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => ProfileService.uploadAvatar(file),
    onSuccess: () => {
      toast.success("Avatar berhasil diupload!");
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal upload avatar");
    },
  });
}

/**
 * useDeleteAvatar - Delete profile avatar
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ProfileService.deleteAvatar(),
    onSuccess: () => {
      toast.success("Avatar berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menghapus avatar");
    },
  });
}

/**
 * useGetAchievements - Get user's achievements
 */
export function useGetAchievements() {
  return useQuery({
    queryKey: profileKeys.achievements(),
    queryFn: ProfileService.getAchievements,
  });
}
