import { authService, type LoginRequest, type RegisterRequest, type AuthResponse } from "@/services/auth";
import type { ApiErrorResponse } from "@/types/response";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth";

export function useLogin() {
  const navigate = useNavigate();
  const { setUserData } = useAuth();

  return useMutation<AuthResponse, ApiErrorResponse, LoginRequest>({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);

      const { user_id, ...profileWithoutUserId } = data.profile;

      const mergedUser = {
        ...profileWithoutUserId,
        email: data.user.email,
        avatar: data.user.avatar,
      };

      localStorage.setItem("user", JSON.stringify(mergedUser));

      // Update auth context immediately so sidebar re-renders
      setUserData(mergedUser as any);

      // Role-based redirect - Check ADMIN first (since all users have student role)
      const isAdmin = mergedUser.roles?.some((role: any) => role.name.toLowerCase() === "admin");

      if (isAdmin) {
        navigate("/dashboard");
      } else {
        // Regular students (only student role, no admin role)
        navigate("/student/dashboard");
      }
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const { setUserData } = useAuth();

  return useMutation<AuthResponse, ApiErrorResponse, RegisterRequest>({
    mutationFn: (credentials) => authService.register(credentials),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      const { user_id, ...profileWithoutUserId } = data.profile;

      const mergedUser = {
        ...profileWithoutUserId,
        email: data.user.email,
        avatar: data.user.avatar,
      };

      localStorage.setItem("user", JSON.stringify(mergedUser));

      // Update auth context immediately so sidebar re-renders
      setUserData(mergedUser as any);

      // Role-based redirect - Check ADMIN first (since all users have student role)
      const isAdmin = mergedUser.roles?.some((role: any) => role.name.toLowerCase() === "admin");

      if (isAdmin) {
        navigate("/dashboard");
      } else {
        // Regular students (only student role, no admin role)
        navigate("/student/dashboard");
      }
    },
  });
}
