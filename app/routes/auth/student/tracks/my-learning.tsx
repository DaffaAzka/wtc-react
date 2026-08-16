import { useState, useEffect } from "react";
import { Link } from "react-router";
import { TrackCard } from "@/students/features/auth/tracks/track-card";
import { TrackCardSkeleton } from "@/students/features/auth/tracks/track-card-skeleton";
import { EmptyState } from "@/students/components/empty-state";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

// TODO: Create enrollment service and hook when backend API is ready
// Expected endpoint: GET /student/enrolled-tracks or similar
// Expected response: Array of enrolled tracks with progress data

export default function MyLearning() {
  const [loading, setLoading] = useState(true);
  const [enrolledTracks, setEnrolledTracks] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading - replace with actual API call when ready
    const timer = setTimeout(() => {
      setLoading(false);
      // TODO: Fetch enrolled tracks from backend
      // const { tracks, loading, error } = useGetEnrolledTracks();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Progres Belajar</h1>
          <p className="text-muted-foreground mt-2">
            Kelola dan lanjutkan pembelajaran kamu
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <TrackCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Progres Belajar</h1>
        <p className="text-muted-foreground mt-2">
          Kelola dan lanjutkan pembelajaran kamu
        </p>
      </div>

      {/* Empty State */}
      {enrolledTracks.length === 0 && (
        <EmptyState
          icon={GraduationCap}
          title="Belum ada kelas yang diambil"
          description="Mulai perjalanan belajar kamu dengan mengambil kelas dari katalog yang tersedia."
          action={
            <Button asChild>
              <Link to="/student/classes">Jelajahi Katalog Kelas</Link>
            </Button>
          }
        />
      )}

      {/* Enrolled Tracks Grid - Will be populated when enrollment API is ready */}
      {enrolledTracks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              variant="enrolled"
            />
          ))}
        </div>
      )}
    </div>
  );
}