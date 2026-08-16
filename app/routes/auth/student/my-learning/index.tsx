import { Link } from "react-router";
import { useMyTracks } from "@/students/hooks/enrollments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/students/components/empty-state";
import { GraduationCap, BookOpen, Trophy } from "lucide-react";

export default function MyLearning() {
    const { myTracks, loading, error } = useMyTracks();

  // DEBUG: Log what we got
  console.log("?? [ProgressPage] myTracks data:", myTracks);
  console.log("?? [ProgressPage] loading:", loading);
  console.log("?? [ProgressPage] error:", error);

  // Separate tracks by enrollment status
  const enrolledTracks = myTracks.filter(
    (track) => track.enrollment.status === "active"
  );
  const completedTracks = myTracks.filter(
    (track) => track.enrollment.status === "completed"
  );

  // DEBUG: Log filtered results
  console.log("?? [ProgressPage] Enrolled tracks:", enrolledTracks);
  console.log("?? [ProgressPage] Completed tracks:", completedTracks);

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Progres Belajar</h1>
          <p className="text-muted-foreground mt-2">
            Kelola dan lanjutkan pembelajaran kamu
          </p>
        </div>
        <EmptyState
          icon={GraduationCap}
          title="Gagal memuat data"
          description={error.message || "Terjadi kesalahan saat memuat data progres."}
        />
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

      {/* Tabs */}
      <Tabs defaultValue="enrolled" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="enrolled">
            Kelas yang Dipelajari ({enrolledTracks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Kelas yang Diselesaikan ({completedTracks.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Enrolled Tracks */}
        <TabsContent value="enrolled" className="space-y-6 mt-6">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {!loading && enrolledTracks.length === 0 && (
            <EmptyState
              icon={BookOpen}
              title="Belum ada kelas yang sedang dipelajari"
              description="Mulai perjalanan belajar kamu dengan mengambil kelas dari katalog yang tersedia."
              action={
                <Button asChild>
                  <Link to="/student/classes">Jelajahi Katalog Kelas</Link>
                </Button>
              }
            />
          )}

          {!loading && enrolledTracks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledTracks.map((track) => (
                <Card key={track.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Track Image */}
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    {track.image_url ? (
                      <img
                        src={track.image_url}
                        alt={track.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <BookOpen className="h-16 w-16 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">
                      {track.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {track.modules_count} Modul
                      </Badge>
                      <Badge variant="default" className="text-xs">
                        Sedang Dipelajari
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Description */}
                    {track.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {track.description}
                      </p>
                    )}

                    {/* Enrollment Date */}
                    {track.enrollment.enrolled_at && (
                      <p className="text-xs text-muted-foreground">
                        Diambil pada{" "}
                        {new Date(track.enrollment.enrolled_at).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link to={`/student/classes/${track.slug}`}>
                        Lanjutkan Belajar
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Completed Tracks */}
        <TabsContent value="completed" className="space-y-6 mt-6">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && completedTracks.length === 0 && (
            <EmptyState
              icon={Trophy}
              title="Belum ada kelas yang diselesaikan"
              description="Selesaikan kelas yang sedang kamu pelajari untuk melihatnya di sini."
            />
          )}

          {!loading && completedTracks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedTracks.map((track) => (
                <Card key={track.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Track Image */}
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    {track.image_url ? (
                      <img
                        src={track.image_url}
                        alt={track.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <Trophy className="h-16 w-16 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">
                      {track.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {track.modules_count} Modul
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        ? Selesai
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Description */}
                    {track.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {track.description}
                      </p>
                    )}

                    {/* Completion Info */}
                    {track.enrollment.completed_at && (
                      <p className="text-xs text-muted-foreground">
                        Diselesaikan pada{" "}
                        {new Date(track.enrollment.completed_at).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/student/classes/${track.slug}`}>
                        Lihat Detail
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}