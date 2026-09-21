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
  myClass: ["study-classes", "my"] as const,
};

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

export function useGetMyClass() {
  const query = useQuery<StudyClass, ApiErrorResponse>({
    queryKey: studyClassKeys.myClass,
    queryFn: () => StudyClassService.getMyClass(),
    retry: false, // 404 = user has no class, that's expected
  });

  return {
    myClass: query.data ?? null,
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useCreateStudyClass() {
  const queryClient = useQueryClient();

  return useMutation<StudyClass, ApiErrorResponse, StudyClassRequest>({
    mutationFn: (payload) => StudyClassService.store(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studyClassKeys.all });
      toast.success("Study class created successfully", {
        description: `${data.name} has been added.`,
      });
    },
    onError: (error) => {
      toast.error("Failed to create study class", {
        description: error.message || "An unexpected error occurred.",
      });
    },
  });
}

export function useUpdateStudyClass() {
  const queryClient = useQueryClient();

  return useMutation<StudyClass, ApiErrorResponse, { id: number; data: StudyClassRequest }>({
    mutationFn: ({ id, data }) => StudyClassService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studyClassKeys.all });
      queryClient.invalidateQueries({ queryKey: studyClassKeys.detail(data.id) });
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

export function useDeleteStudyClass() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorResponse, number>({
    mutationFn: (id) => StudyClassService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyClassKeys.all });
      toast.success("Study class deleted successfully.");
    },
    onError: (error) => {
      toast.error("Failed to delete study class", {
        description: error.message || "An unexpected error occurred.",
      });
    },
  });
}

export function useToggleStudyClass() {
  const queryClient = useQueryClient();

  return useMutation<StudyClass, ApiErrorResponse, number>({
    mutationFn: (id) => StudyClassService.toggle(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studyClassKeys.all });
      queryClient.invalidateQueries({ queryKey: studyClassKeys.detail(data.id) });
      toast.success(`Study class ${data.is_active ? "activated" : "deactivated"}.`);
    },
    onError: (error) => {
      toast.error("Failed to toggle study class", {
        description: error.message || "An unexpected error occurred.",
      });
    },
  });
}

export function useAssignTrack() {
  const queryClient = useQueryClient();

  return useMutation<StudyClass, ApiErrorResponse, { studyClassId: number; trackId: number }>({
    mutationFn: ({ studyClassId, trackId }) =>
      StudyClassService.assignTrack(studyClassId, trackId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studyClassKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: studyClassKeys.all });
      toast.success("Track assigned successfully.");
    },
    onError: (error) => {
      toast.error("Failed to assign track", {
        description: error.message || "An unexpected error occurred.",
      });
    },
  });
}

export function useRemoveTrack() {
  const queryClient = useQueryClient();

  return useMutation<StudyClass, ApiErrorResponse, { studyClassId: number; trackId: number }>({
    mutationFn: ({ studyClassId, trackId }) =>
      StudyClassService.removeTrack(studyClassId, trackId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studyClassKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: studyClassKeys.all });
      toast.success("Track removed successfully.");
    },
    onError: (error) => {
      toast.error("Failed to remove track", {
        description: error.message || "An unexpected error occurred.",
      });
    },
  });
}

export function useJoinClass() {
  const queryClient = useQueryClient();

  return useMutation<StudyClass, ApiErrorResponse, number>({
    mutationFn: (id) => StudyClassService.joinClass(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studyClassKeys.myClass });
      queryClient.invalidateQueries({ queryKey: studyClassKeys.all });
      toast.success(`Berhasil bergabung ke ${data.name}!`);
    },
    onError: (error) => {
      toast.error("Gagal bergabung ke kelas", {
        description: error.message || "Terjadi kesalahan.",
      });
    },
  });
}
