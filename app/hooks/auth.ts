import { useState } from "react";
import { authService } from "@/services/auth";
import type { RegisterRequest } from "@/types/auth";
import { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/response";

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);

  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      setError(null);
      await authService.register(
        data.study_class_id,
        data.name,
        data.email,
        data.password,
        data.password_confirmation,
        data.role,
      );
      globalThis.location.href = "/login";
    } catch (err) {
      if (err instanceof AxiosError) {
        const data = err.response?.data as ApiErrorResponse | undefined;
        setError(data ?? { message: "Something went wrong." });
      } else {
        setError({ message: "An unexpected error occurred." });
      }
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
}
