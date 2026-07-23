import { LessonService } from "@/services/lesson";
import type { Lesson } from "@/types/model";
import type { ApiErrorResponse } from "@/types/response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const lessonKeys = {
  all: ["lessons"] as const,
  detail: (id: number) => ["lessons", id] as const,
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

export function useGetLesson(id: number) {
  const query = useQuery<Lesson, ApiErrorResponse>({
    queryKey: lessonKeys.detail(id),
    queryFn: () => LessonService.getById(id),
    enabled: !!id,
  });

  return {
    lesson: query.data,
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
    { id: number } & Omit<Lesson, "id" | "deleted_at" | "created_at" | "updated_at">
  >({
    mutationFn: (payload) => LessonService.update(payload.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => LessonService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
    },
  });
}
