import { useState } from "react";
import { useNavigate } from "react-router";
import { authService } from "@/services/auth";
import type { LoginRequest, RegisterRequest } from "@/types/auth";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async (data: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(data.email, data.password);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      window.location.href = "/login";
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
}
