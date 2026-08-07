import { api } from "@/lib/axios";
import type { Module } from "@/types/model";
import type { ApiResponse } from "@/types/response";

type ModuleRequest = Omit<Module, "id" | "created_at" | "updated_at">;

export const ModuleService = {
  store: async (request: ModuleRequest): Promise<Module> => {
    const response = await api.post<ApiResponse<Module>>("/modules", request);

    return response.data.data!;
  },

  update: async (slug: string, request: ModuleRequest): Promise<Module> => {
    const response = await api.put<ApiResponse<Module>>(
      `/modules/${slug}`,
      request,
    );

    return response.data.data!;
  },

  getAll: async (): Promise<Module[]> => {
    const response = await api.get<ApiResponse<Module[]>>("/modules");
    return response.data.data!;
  },

  getBySlug: async (slug: string): Promise<Module> => {
    const response = await api.get<ApiResponse<Module>>(`/modules/${slug}`);
    return response.data.data!;
  },

  delete: async (slug: string): Promise<void> => {
    await api.delete(`/modules/${slug}`);
  },
};
