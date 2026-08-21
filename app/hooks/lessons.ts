import { LessonService } from "@/services/lesson";
import type { LessonFilter } from "@/types/filter";
import type { Lesson } from "@/types/model";
import type { ApiErrorResponse, PaginatedResponse } from "@/types/response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const lessonKeys = {
  all: ["lessons"] as const,
  detail: (slug: string) => ["lessons", slug] as const,
};

export function useGetLessons(filters?: LessonFilter) {
  const query = useQuery<Lesson[], ApiErrorResponse>({
    queryKey: [...lessonKeys.all, filters],
    queryFn: () => LessonService.getAll(filters),
  });

  return {
    lessons: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useGetLessonsPaginated(
  filters?: LessonFilter & { page?: number; per_page?: number },
) {
  const query = useQuery<PaginatedResponse<Lesson>, ApiErrorResponse>({
    queryKey: [...lessonKeys.all, "paginated", filters],
    queryFn: () => LessonService.getAllPaginated(filters),
  });

  return {
    lessons: query.data?.data ?? [],
    pagination: query.data?.meta,
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
