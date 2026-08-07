import { api } from "@/lib/axios";
import type { Track } from "@/types/model";
import type { ApiResponse } from "@/types/response";

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

  getBySlug: async (slug: string): Promise<Track> => {
    const response = await api.get<ApiResponse<Track>>(`/tracks/${slug}`);
    return response.data.data!;
  },

  delete: async (slug: string): Promise<void> => {
    await api.delete(`/tracks/${slug}`);
  },
};
