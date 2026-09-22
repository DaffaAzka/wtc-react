import { useState } from "react";
import { authService, type LoginRequest, type RegisterRequest, type AuthResponse } from "@/services/auth";
import type { ApiErrorResponse } from "@/types/response";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/auth";
import { saveToken } from "@/utils/auth-storage";
import { resolveDefaultView, resolveViewPath } from "@/utils/roles";
import { computeAndSaveStreak, type StreakResult } from "@/utils/streak";

export function useLogin() {
  const navigate = useNavigate();
  const { setUserData, setActiveView } = useAuth();
  const [streakResult, setStreakResult] = useState<StreakResult | null>(null);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const proceed = () => {
    setStreakResult(null);
    if (pendingPath) navigate(pendingPath);
  };

  const mutation = useMutation<AuthResponse, ApiErrorResponse, LoginRequest>({
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

      // Always resolve + persist active view first — layout guards need it
      const defaultView = resolveDefaultView(mergedUser as any);
      setActiveView(defaultView);

      // Only redirect unverified students — admin/teacher skip email check
      const isStudentOnly = !mergedUser.roles?.some(
        (r: any) => r.name === "admin" || r.name === "teacher",
      );
      if (data.user.provider === "local" && !data.user.email_verified_at && isStudentOnly) {
        navigate("/check-email");
        return;
      }

      const path = resolveViewPath(defaultView);

      if (path === "/student/dashboard") {
        const result = computeAndSaveStreak(false);
        setPendingPath(path);
        setStreakResult(result);
      } else {
        navigate(path);
      }
    },
  });

  return { ...mutation, streakResult, proceed };
}

export function useRegister() {
  const navigate = useNavigate();
  const { setUserData, setActiveView } = useAuth();
  const [streakResult, setStreakResult] = useState<StreakResult | null>(null);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const proceed = () => {
    setStreakResult(null);
    if (pendingPath) navigate(pendingPath);
  };

  const mutation = useMutation<AuthResponse, ApiErrorResponse, RegisterRequest>({
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

      // Always resolve + persist active view first
      const defaultView = resolveDefaultView(mergedUser as any);
      setActiveView(defaultView);

      // Local users go to check-email first — Pinat users are pre-verified
      if (data.user.provider === "local") {
        navigate("/check-email");
        return;
      }

      const path = resolveViewPath(defaultView);

      if (path === "/student/dashboard") {
        const result = computeAndSaveStreak(true);
        setPendingPath(path);
        setStreakResult(result);
      } else {
        navigate(path);
      }
    },
  });

  return { ...mutation, streakResult, proceed };
}

export function useVerifyEmail() {
  return useMutation<{ user: AuthResponse["user"] }, ApiErrorResponse, string>({
    mutationFn: (token) => authService.verifyEmail(token),
  });
}

export function useResendVerification() {
  return useMutation<void, ApiErrorResponse, void>({
    mutationFn: () => authService.resendVerification(),
  });
}
