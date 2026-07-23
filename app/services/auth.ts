import { api } from "@/lib/axios";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "@/types/auth";
import type { User } from "@/types/model";
import type { ApiResponse } from "@/types/response";

export const authService = {
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      "/login",
      request,
    );
    return response.data.data!;
  },
  register: async (request: RegisterRequest): Promise<User> => {
    const response = await api.post<ApiResponse<User>>("/register", request);
    return response.data.data!;
  },
};
