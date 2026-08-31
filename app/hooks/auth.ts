import { authService, type LoginRequest, type RegisterRequest, type AuthResponse } from "@/services/auth";
import type { ApiErrorResponse } from "@/types/response";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth";
import { saveToken } from "@/utils/auth-storage";
import { resolveLandingPath } from "@/utils/roles";

export function useLogin() {
  const navigate = useNavigate();
  const { setUserData } = useAuth();

  return useMutation<AuthResponse, ApiErrorResponse, LoginRequest>({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (data) => {
      saveToken(data.token);

      const { user_id, ...profileWithoutUserId } = data.profile;
      const mergedUser = {
        ...profileWithoutUserId,
        email: data.user.email,
        avatar: data.user.avatar,
      };

      setUserData(mergedUser as any);
      navigate(resolveLandingPath(mergedUser));
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const { setUserData } = useAuth();

  return useMutation<AuthResponse, ApiErrorResponse, RegisterRequest>({
    mutationFn: (credentials) => authService.register(credentials),
    onSuccess: (data) => {
      saveToken(data.token);
      const { user_id, ...profileWithoutUserId } = data.profile;
      const mergedUser = {
        ...profileWithoutUserId,
        email: data.user.email,
        avatar: data.user.avatar,
      };

      setUserData(mergedUser as any);
      navigate(resolveLandingPath(mergedUser));
    },
  });
}
