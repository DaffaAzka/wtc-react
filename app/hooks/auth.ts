import { authService } from "@/services/auth";
import type { RegisterRequest } from "@/types/auth";
import type { ApiErrorResponse } from "@/types/response";
import { useMutation } from "@tanstack/react-query";
import type { User } from "@/types/model";

export function useRegister() {
  return useMutation<User, ApiErrorResponse, RegisterRequest>({
    mutationFn: (payload) => authService.register(payload),
    onSuccess: () => {
      globalThis.location.href = "/login";
    },
  });
}
