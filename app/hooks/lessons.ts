import { LessonService } from "@/services/lesson";
import type { Lesson } from "@/types/model";
import type { ApiErrorResponse } from "@/types/response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const lessonKeys = {
  all: ["lessons"] as const,
  detail: (slug: string) => ["lessons", slug] as const,
  byModule: (moduleSlug: string) => ["lessons", "module", moduleSlug] as const,
};

export function useGetLessons() {
  const query = useQuery<Lesson[], ApiErrorResponse>({
    queryKey: lessonKeys.all,
    queryFn: () => LessonService.getAll(),
  });

  return {
    lessons: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useGetLesson(slug: string) {
  const query = useQuery<Lesson, ApiErrorResponse>({
    queryKey: lessonKeys.detail(slug),
    queryFn: () => LessonService.getBySlug(slug),
    enabled: !!slug,
  });

  return {
    lesson: query.data,
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useGetLessonsByModule(moduleSlug: string) {
  const query = useQuery<Lesson[], ApiErrorResponse>({
    queryKey: lessonKeys.byModule(moduleSlug),
    queryFn: () => LessonService.getByModule(moduleSlug),
    enabled: !!moduleSlug,
  });

  return {
    lessons: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useStoreLesson() {
  const queryClient = useQueryClient();
  return useMutation<
    Lesson,
    ApiErrorResponse,
    Omit<Lesson, "id" | "deleted_at" | "created_at" | "updated_at">
  >({
    mutationFn: (payload) => LessonService.store(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  return useMutation<
    Lesson,
    ApiErrorResponse,
    { id: number } & Omit<
      Lesson,
      "id" | "deleted_at" | "created_at" | "updated_at"
    >
  >({
    mutationFn: (payload) => LessonService.update(payload.slug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => LessonService.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
    },
  });
}
