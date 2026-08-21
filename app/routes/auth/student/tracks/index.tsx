import { useGetTracks } from "@/hooks/tracks";
import { useMyTracks, useEnrollTrack } from "@/students/hooks/enrollments";
import { TrackCard } from "@/students/features/auth/tracks/track-card";
import { TrackCardSkeleton } from "@/students/features/auth/tracks/track-card-skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaGraduationCap, FaBook } from "react-icons/fa";

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

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Featured Skeleton */}
        <div className="h-80 bg-muted animate-pulse rounded-lg" />

        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TrackCardSkeleton />
          <TrackCardSkeleton />
          <TrackCardSkeleton />
        </div>
      </div>
    );
  }

  if (tracksError) {
    return (
      <div className="space-y-8">
        {/* Static Header Banner */}
        <div className="overflow-hidden rounded-lg border-2">
          <img
            src="/images/courses-header.png"
            alt="Courses Header"
            className="w-full h-auto object-cover"
          />
        </div>

        <Card className="p-12">
          <div className="text-center space-y-4">
            <FaBook className="h-16 w-16 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Gagal Memuat Data</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {tracksError.message || "Terjadi kesalahan saat memuat katalog kelas. Silakan coba lagi."}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Static Header Banner - Pure image, no overlays */}
      <div className="overflow-hidden rounded-lg border-2">
        <img
          src="/images/course-header.png"
          alt="Courses Header"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* All Learning Paths Section */}
      {tracks.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <FaBook className="h-16 w-16 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Belum Ada Kelas Tersedia</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Saat ini belum ada learning path yang tersedia. Silakan kembali lagi nanti.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FaGraduationCap className="h-6 w-6 text-primary" />
                All Learning Paths
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose your path and start your learning journey
              </p>
            </div>

            <Badge variant="secondary" className="text-sm px-3 py-1.5">
              {tracks.length} {tracks.length === 1 ? "Course" : "Courses"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>
      )}
    </div>
  );
}
