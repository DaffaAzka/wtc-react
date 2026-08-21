import { ModuleService } from "@/services/module";
import type { ModuleFilter } from "@/types/filter";
import type { Module } from "@/types/model";
import type { ApiErrorResponse, PaginatedResponse } from "@/types/response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const moduleKeys = {
  all: ["modules"] as const,
  detail: (slug: string) => ["modules", slug] as const,
};

export function useGetModules(filters?: ModuleFilter) {
  const query = useQuery<Module[], ApiErrorResponse>({
    queryKey: [...moduleKeys.all, filters],
    queryFn: () => ModuleService.getAll(filters),
  });

  return {
    modules: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useGetModulesPaginated(
  filters?: ModuleFilter & { page?: number; per_page?: number },
) {
  const query = useQuery<PaginatedResponse<Module>, ApiErrorResponse>({
    queryKey: [...moduleKeys.all, "paginated", filters],
    queryFn: () => ModuleService.getAllPaginated(filters),
  });

  return {
    modules: query.data?.data ?? [],
    pagination: query.data?.meta,
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useGetModule(slug: string) {
  const query = useQuery<Module, ApiErrorResponse>({
    queryKey: moduleKeys.detail(slug),
    queryFn: () => ModuleService.getBySlug(slug),
    enabled: !!slug,
  });

  return {
    module: query.data,
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useGetModulesByTrack(trackSlug: string) {
  const query = useQuery<Module[], ApiErrorResponse>({
    queryKey: ["tracks", trackSlug, "modules"] as const,
    queryFn: () => ModuleService.getByTrack(trackSlug),
    enabled: !!trackSlug,
  });

  return {
    modules: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useStoreModule() {
  const queryClient = useQueryClient();
  return useMutation<
    Module,
    ApiErrorResponse,
    Omit<Module, "id" | "created_at" | "updated_at">
  >({
    mutationFn: (payload) => ModuleService.store(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.all });
    },
  });
}

export function useUpdateModule() {
  const queryClient = useQueryClient();
  return useMutation<
    Module,
    ApiErrorResponse,
    Omit<Module, "id" | "created_at" | "updated_at">
  >({
    mutationFn: (payload) => ModuleService.update(payload.slug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.all });
    },
  });
}

export function useDeleteModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => ModuleService.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.all });
    },
  });
}