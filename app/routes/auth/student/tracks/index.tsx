import { useGetTracks } from "@/hooks/tracks";
import { useMyTracks, useEnrollTrack } from "@/students/hooks/enrollments";
import { TrackCard } from "@/students/features/auth/tracks/track-card";
import { TrackCardSkeleton } from "@/students/features/auth/tracks/track-card-skeleton";
import { EmptyState } from "@/students/components/empty-state";
import { BookOpen } from "lucide-react";

export default function TracksIndex() {
  const { tracks, loading: tracksLoading, error: tracksError } = useGetTracks();
  const { myTracks, loading: myTracksLoading } = useMyTracks();
  const enrollMutation = useEnrollTrack();  

  const loading = tracksLoading || myTracksLoading;

  // Check if a track is enrolled
  const isTrackEnrolled = (trackSlug: string): boolean => {
    return myTracks.some((mt) => mt.slug === trackSlug);
  };

  // Check if a specific track is currently being enrolled
  const isEnrolling = (trackSlug: string): boolean => {
    return enrollMutation.isPending && enrollMutation.variables === trackSlug;
  };

  // Handle enrollment
  const handleEnroll = (trackSlug: string) => {
    enrollMutation.mutate(trackSlug);
  };

  if (tracksError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Katalog Kelas</h1>
          <p className="text-muted-foreground mt-2">
            Jelajahi berbagai learning path yang tersedia
          </p>
        </div>
        <EmptyState
          icon={BookOpen}
          title="Gagal memuat data"
          description={tracksError.message || "Terjadi kesalahan saat memuat katalog kelas. Silakan coba lagi."}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Katalog Kelas</h1>
        <p className="text-muted-foreground mt-2">
          Jelajahi berbagai learning path yang tersedia
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TrackCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && tracks.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="Belum ada kelas tersedia"
          description="Saat ini belum ada learning path yang tersedia. Silakan kembali lagi nanti."
        />
      )}

      {/* Tracks Grid */}
      {!loading && tracks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isEnrolled={isTrackEnrolled(track.slug)}
              onEnroll={handleEnroll}
              enrolling={isEnrolling(track.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}