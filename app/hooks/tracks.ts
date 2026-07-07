import { TrackService } from "@/services/track";
import type { Track } from "@/types/model";
import type { ApiErrorResponse } from "@/types/response";
import { use, useEffect, useState } from "react";

export function useGetTracks() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await TrackService.getAll();
      setTracks(response);
    } catch (err) {
      setError(err as ApiErrorResponse);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  return { refetch: fetchTracks, loading, error, tracks };
}
