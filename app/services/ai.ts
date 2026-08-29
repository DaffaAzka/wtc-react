import { api } from "@/lib/axios";
import type { Question, ChallengeFormType } from "@/types/challenge";
import type { ApiResponse } from "@/types/response";

export type GenerateChallengeConfig = {
  type: ChallengeFormType;
  difficulty: "easy" | "medium" | "hard";
  max_score: number;
  mcq_count?: number;
  essay_count?: number;
  language?: "id" | "en";
};

export type GeneratedChallenge = {
  title: string;
  content: string;
  questions: Question[];
  difficulty?: "easy" | "medium" | "hard";
};

export const AiService = {
  generateForLesson: async (
    lessonSlug: string,
    config: GenerateChallengeConfig,
  ): Promise<GeneratedChallenge> => {
    const response = await api.post<ApiResponse<GeneratedChallenge>>(
      `/lessons/${lessonSlug}/generate-challenge`,
      config,
    );
    return response.data.data!;
  },

  generateForModule: async (
    moduleSlug: string,
    config: GenerateChallengeConfig,
  ): Promise<GeneratedChallenge> => {
    const response = await api.post<ApiResponse<GeneratedChallenge>>(
      `/modules/${moduleSlug}/generate-challenge`,
      config,
    );
    return response.data.data!;
  },
};
