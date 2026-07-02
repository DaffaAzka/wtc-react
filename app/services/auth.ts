import { api } from "~/lib/axios";
import type { LoginResponse } from "~/types/auth";
import type { User } from "~/types/model";
import type { ApiResponse } from "~/types/response";

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>("/auth/login", {
      email,
      password,
    });
    return response.data.data!;
  },
  register: async (
    name: string,
    email: string,
    password: string,
    study_class_id: number | null,
  ): Promise<User> => {
    const response = await api.post<ApiResponse<User>>("/auth/register", {
      study_class_id,
      name,
      email,
      password,
    });
    return response.data.data!;
  },
};
