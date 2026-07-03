import { useState } from "react";
import { authService } from "@/services/auth";
import type { RegisterRequest } from "@/types/auth";

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
}
