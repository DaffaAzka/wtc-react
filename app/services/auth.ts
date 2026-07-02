import { api } from "@/lib/axios";
import type { LoginResponse } from "@/types/auth";
import type { User } from "@/types/model";
import type { ApiResponse } from "@/types/response";

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>("/login", {
      email,
      password,
    });
    return response.data.data!;
  },
  register: async (
    study_class_id: number | null,
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    role: string,
  ): Promise<User> => {
    const response = await api.post<ApiResponse<User>>("/register", {
      study_class_id,
      name,
      email,
      password,
      password_confirmation,
      role,
    });
    return response.data.data!;
  },
};
