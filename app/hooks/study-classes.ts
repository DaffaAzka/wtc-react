import { StudyClassService } from "@/services/study-class";
import type {
  StudyClass,
  StudyClassRequest,
  StudyClassFilter,
} from "@/services/study-class";
import type { ApiErrorResponse, PaginatedResponse } from "@/types/response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const studyClassKeys = {
  all: ["study-classes"] as const,
  detail: (id: number) => ["study-classes", id] as const,
};

/**
 * Get all study classes with optional filters
 */
export function useGetStudyClasses(filters?: StudyClassFilter) {
  const query = useQuery<StudyClass[], ApiErrorResponse>({
    queryKey: [...studyClassKeys.all, filters],
    queryFn: () => StudyClassService.getAll(filters),
  });

  return {
    studyClasses: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

/**
 * Get paginated study classes with optional filters
 */
export function useGetStudyClassesPaginated(filters?: StudyClassFilter) {
  const query = useQuery<PaginatedResponse<StudyClass>, ApiErrorResponse>({
    queryKey: [...studyClassKeys.all, "paginated", filters],
    queryFn: () => StudyClassService.getAllPaginated(filters),
  });

  return {
    studyClasses: query.data?.data ?? [],
    pagination: query.data?.meta,
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

/**
 * Get a single study class by ID
 */
export function useGetStudyClass(id: number) {
  const query = useQuery<StudyClass, ApiErrorResponse>({
    queryKey: studyClassKeys.detail(id),
    queryFn: () => StudyClassService.getById(id),
    enabled: !!id,
  });

  return {
    studyClass: query.data,
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

/**
 * Create a new study class
 */
export function useCreateStudyClass() {
  const queryClient = useQueryClient();

  return useMutation<StudyClass, ApiErrorResponse, StudyClassRequest>({
    mutationFn: (payload) => StudyClassService.store(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studyClassKeys.all });
      toast.success("Study class created successfully", {
        description: `${data.name} has been added to the system.`,
      });
    },
    onError: (error) => {
      toast.error("Failed to create study class", {
        description: error.message || "An unexpected error occurred.",
      });
    },
  });
}

/**
 * Update an existing study class
 */
export function useUpdateStudyClass() {
  const queryClient = useQueryClient();

  return useMutation<
    StudyClass,
    ApiErrorResponse,
    { id: number; data: StudyClassRequest }
  >({
    mutationFn: ({ id, data }) => StudyClassService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studyClassKeys.all });
      queryClient.invalidateQueries({
        queryKey: studyClassKeys.detail(data.id),
      });
      toast.success("Study class updated successfully", {
        description: `${data.name} has been updated.`,
      });
    },
    onError: (error) => {
      toast.error("Failed to update study class", {
        description: error.message || "An unexpected error occurred.",
      });
    },
  });
}

/**
 * Delete a study class
 */
export function useDeleteStudyClass() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorResponse, number>({
    mutationFn: (id) => StudyClassService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyClassKeys.all });
      toast.success("Study class deleted successfully", {
        description: "The study class has been removed from the system.",
      });
    },
    onError: (error) => {
      toast.error("Failed to delete study class", {
        description: error.message || "An unexpected error occurred.",
      });
    },
  });
}
