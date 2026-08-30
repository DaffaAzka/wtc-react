import {
  AiService,
  type GenerateChallengeConfig,
  type GeneratedChallenge,
} from "@/services/ai";
import type { ApiErrorResponse } from "@/types/response";
import { useMutation } from "@tanstack/react-query";

export function useGenerateChallengeForLesson(lessonSlug: string) {
  return useMutation<GeneratedChallenge, ApiErrorResponse, GenerateChallengeConfig>({
    mutationFn: (config) => AiService.generateForLesson(lessonSlug, config),
  });
}

export function useGenerateChallengeForModule(moduleSlug: string) {
  return useMutation<GeneratedChallenge, ApiErrorResponse, GenerateChallengeConfig>({
    mutationFn: (config) => AiService.generateForModule(moduleSlug, config),
  });
}
