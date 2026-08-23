import { useGetTracks } from "@/hooks/tracks";
import { useMyTracks } from "@/students/hooks/enrollments";
import { TrackCard } from "@/students/features/auth/tracks/track-card";
import { TrackCardSkeleton } from "@/students/features/auth/tracks/track-card-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Sparkles } from "lucide-react";

export default function TracksIndex() {
  const { tracks, loading: tracksLoading, error: tracksError } = useGetTracks();
  const { myTracks, loading: myTracksLoading } = useMyTracks();

  const loading = tracksLoading || myTracksLoading;

  // Check if a track is enrolled
  const isTrackEnrolled = (trackSlug: string): boolean => {
    return myTracks.some((mt) => mt.slug === trackSlug);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Featured Skeleton */}
        <div className="h-64 bg-muted animate-pulse rounded-xl" />

        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="overflow-hidden rounded-xl shadow-sm">
          <img
            src="/images/courses-header.png"
            alt="Courses Header"
            className="w-full h-auto object-cover"
          />
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-blue-500/10 mb-4">
              <BookOpen className="h-12 w-12 text-blue-500/50" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Gagal Memuat Data</h2>
            <p className="text-muted-foreground max-w-md">
              {tracksError.message || "Terjadi kesalahan saat memuat katalog kelas. Silakan coba lagi."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Static Header Banner - Clean and modern */}
      <div className="overflow-hidden rounded-xl shadow-sm">
        <img
          src="/images/course-header.png"
          alt="Courses Header"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* All Learning Paths Section */}
      {tracks.length === 0 ? (
        <Card className="border-dashed border-2 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-blue-500/10 mb-4">
              <BookOpen className="h-12 w-12 text-blue-500/50" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Belum Ada Kelas Tersedia</h2>
            <p className="text-muted-foreground max-w-md">
              Saat ini belum ada learning path yang tersedia. Silakan kembali lagi nanti.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <GraduationCap className="h-7 w-7 text-blue-500" />
                </div>
                All Learning Paths
              </h2>
              <p className="text-muted-foreground pl-[52px]">
                Choose your path and start your learning journey
              </p>
            </div>

            <Badge className="text-sm px-4 py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none shadow-sm">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {tracks.length} {tracks.length === 1 ? "Course" : "Courses"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isEnrolled={isTrackEnrolled(track.slug)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
