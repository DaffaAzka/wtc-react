import { LessonService } from "@/services/lesson";
import type { LessonFilter } from "@/types/filter";
import type { Lesson } from "@/types/model";
import type { ApiErrorResponse, PaginatedResponse } from "@/types/response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
export function useGetAllLessons(filters?: LessonFilter) {
  const query = useQuery<Lesson[], ApiErrorResponse>({
    queryKey: [...lessonKeys.all, "all", filters],
    queryFn: async () => {
      const perPage = 100;

      const first = await LessonService.getAllPaginated({
        ...filters,
        page: 1,
        per_page: perPage,
      });

      const lastPage = first.meta?.last_page ?? 1;
      let allLessons = [...first.data];

      if (lastPage <= 1) {
        return allLessons;
      }

      const remainingPages = Array.from(
        { length: lastPage - 1 },
        (_, i) => i + 2,
      );

      const results = await Promise.all(
        remainingPages.map((page) =>
          LessonService.getAllPaginated({
            ...filters,
            page,
            per_page: perPage,
          }),
        ),
      );

      results.forEach((res) => {
        allLessons = allLessons.concat(res.data);
      });
      const uniqueLessons = Array.from(
        new Map(allLessons.map((lesson) => [lesson.id, lesson])).values(),
      );

      return uniqueLessons;
    },
    staleTime: 5 * 60 * 1000,
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

/**
 * Hook to mark a lesson as completed
 */
export function useLessonCompletion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => LessonService.complete(slug),
    onSuccess: () => {
      toast.success("Lesson berhasil diselesaikan!");

      // Invalidate enrollment-related queries to update progress
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });

      // Invalidate all track overview queries to update lesson states
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === "tracks" && key[2] === "overview";
        }
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Gagal menyelesaikan lesson",
      );
    },
  });
}

/**
 * Hook to add an attachment to a lesson
 */
export function useAddLessonAttachment() {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    ApiErrorResponse,
    {
      lessonSlug: string;
      file: File;
      title: string;
      type?: "material" | "reference" | "download" | "slides" | "document";
      description?: string;
    }
  >({
    mutationFn: ({ lessonSlug, file, title, type, description }) =>
      LessonService.addAttachment(lessonSlug, file, title, type, description),
    onSuccess: (_, variables) => {
      toast.success("Attachment berhasil ditambahkan!");
      queryClient.invalidateQueries({
        queryKey: lessonKeys.detail(variables.lessonSlug),
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Gagal menambahkan attachment",
      );
    },
  });
}

/**
 * Hook to delete an attachment from a lesson
 */
export function useDeleteLessonAttachment() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    ApiErrorResponse,
    { lessonSlug: string; attachmentId: string }
  >({
    mutationFn: ({ lessonSlug, attachmentId }) =>
      LessonService.deleteAttachment(lessonSlug, attachmentId),
    onSuccess: (_, variables) => {
      toast.success("Attachment berhasil dihapus!");
      queryClient.invalidateQueries({
        queryKey: lessonKeys.detail(variables.lessonSlug),
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Gagal menghapus attachment",
      );
    },
  });
}
