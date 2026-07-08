import { api } from "@/lib/axios";
import type { Track } from "@/types/model";
import type { ApiResponse } from "@/types/response";
import type { TrackRequest } from "@/types/track";

export const TrackService = {
  store: async (request: TrackRequest): Promise<Track> => {
    const response = await api.post<ApiResponse<Track>>("/tracks", request);

    return response.data.data!;
  },

  update: async (id: string, request: TrackRequest): Promise<Track> => {
    const response = await api.put<ApiResponse<Track>>(
      `/tracks/${id}`,
      request,
    );

    return response.data.data!;
  },

  getAll: async (): Promise<Track[]> => {
    const response = await api.get<ApiResponse<Track[]>>("/tracks");
    return response.data.data!;
  },

  getById: async (id: string): Promise<Track> => {
    const response = await api.get<ApiResponse<Track>>(`/tracks/${id}`);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tracks/${id}`);
  },
};
