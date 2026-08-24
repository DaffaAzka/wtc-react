import { api } from "@/lib/axios";
import type { Track, TrackOverview } from "@/types/model";
import type { ApiResponse, PaginatedResponse } from "@/types/response";

type TrackRequest = Omit<Track, "id" | "created_at" | "updated_at">;

export const TrackService = {
  store: async (request: TrackRequest): Promise<Track> => {
    const response = await api.post<ApiResponse<Track>>("/tracks", request);

    return response.data.data!;
  },

  update: async (slug: string, request: TrackRequest): Promise<Track> => {
    const response = await api.put<ApiResponse<Track>>(
      `/tracks/${slug}`,
      request,
    );

    return response.data.data!;
  },

  getAll: async (): Promise<Track[]> => {
    const response = await api.get<ApiResponse<Track[]>>("/tracks");
    return response.data.data!;
  },

  getAllPaginated: async (params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Track>> => {
    const response = await api.get<PaginatedResponse<Track>>("/tracks", {
      params: { ...params, pagination: true },
    });
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Track> => {
    const response = await api.get<ApiResponse<Track>>(`/tracks/${slug}`);
    return response.data.data!;
  },

  getOverview: async (slug: string): Promise<TrackOverview> => {
    const response = await api.get<ApiResponse<TrackOverview>>(`/my/tracks/${slug}/overview`);
    return response.data.data!;
  },

  delete: async (slug: string): Promise<void> => {
    await api.delete(`/tracks/${slug}`);
  },
};
