import { ModuleService } from "@/services/module";
import type { ModuleFilter } from "@/types/filter";
import type { Module } from "@/types/model";
import type { ApiErrorResponse, PaginatedResponse } from "@/types/response";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const moduleKeys = {
  all: ["modules"] as const,
  detail: (slug: string) => ["modules", slug] as const,
};

export function useGetModules(filters?: ModuleFilter) {
  const query = useQuery<Module[], ApiErrorResponse>({
    queryKey: [...moduleKeys.all, filters],
    queryFn: async () => {
      try {
        return await ModuleService.getAll(filters);
      } catch (err: any) {
        if (err?.response?.status === 404) return [];
        throw err;
      }
    },
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
    queryFn: async () => {
      try {
        return await ModuleService.getAllPaginated(filters);
      } catch (err: any) {
        if (err?.response?.status === 404)
          return { data: [], links: { first: null, last: null, prev: null, next: null }, meta: { current_page: 1, last_page: 1, from: null, to: null, total: 0, per_page: filters?.per_page ?? 15 } };
        throw err;
      }
    },
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
    queryFn: async () => {
      try {
        return await ModuleService.getByTrack(trackSlug);
      } catch (err: any) {
        if (err?.response?.status === 404) return [];
        throw err;
      }
    },
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.all });
      toast.success("Module created successfully", {
        description: `"${data.title}" has been added.`,
      });
    },
    onError: (error) => {
      toast.error("Failed to create module", {
        description: error.message || "An unexpected error occurred.",
      });
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