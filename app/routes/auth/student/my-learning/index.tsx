import { Link } from "react-router";
import { useMyTracks } from "@/students/hooks/enrollments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCap,
  BookOpen,
  Trophy,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function MyLearning() {
  const { myTracks, loading, error } = useMyTracks();

  const enrolledTracks = myTracks.filter(
    (track) => track.enrollment.status === "active",
  );
  const completedTracks = myTracks.filter(
    (track) => track.enrollment.status === "completed",
  );

  const totalModulesCompleted = myTracks.reduce(
    (sum, track) => sum + (track.enrollment.completed_modules || 0),
    0,
  );
  const totalPoints = myTracks.reduce(
    (sum, track) => sum + (track.enrollment.points_earned || 0),
    0,
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 max-w-md text-center">
          <p className="text-destructive mb-4">
            {error.message || "Gagal memuat data."}
          </p>
          <Button onClick={() => window.location.reload()} size="sm">
            Coba Lagi
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="overflow-hidden rounded-lg border-2">
        <img
          src="/images/progres-header.png"
          alt="Progress Header"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Stats Grid - Single Color Theme */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {enrolledTracks.length}
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Sedang Dipelajari
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {completedTracks.length}
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Diselesaikan
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {totalModulesCompleted}
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Modul Selesai
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{totalPoints}</div>
            <p className="text-sm text-muted-foreground font-medium">
              Total Poin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="enrolled" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="enrolled" className="gap-2">
            <Clock className="h-4 w-4" />
            Sedang Dipelajari ({enrolledTracks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Diselesaikan ({completedTracks.length})
          </TabsTrigger>
        </TabsList>

        {/* Enrolled Tab */}
        <TabsContent value="enrolled" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-2 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : enrolledTracks.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Belum Ada Kelas yang Sedang Dipelajari
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Mulai perjalanan belajar kamu dengan mengambil kelas dari
                  katalog.
                </p>
                <Button asChild>
                  <Link to="/student/tracks">Jelajahi Kelas</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledTracks.map((track) => {
                const progress = track.enrollment.progress_percentage || 0;
                const completedModules =
                  track.enrollment.completed_modules || 0;
                const totalModules = track.modules_count || 0;

                return (
                  <Card
                    key={track.id}
                    className="overflow-hidden hover:shadow-lg transition-all duration-200">
                    <div className="relative h-48 bg-muted">
                      {track.image_url ? (
                        <img
                          src={track.image_url}
                          alt={track.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-5">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">
                        {track.title}
                      </h3>

                      {track.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {track.description}
                        </p>
                      )}

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground font-medium">
                            Progress Belajar
                          </span>
                          <span className="font-bold text-primary">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-2.5" />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BookOpen className="h-4 w-4" />
                          <span>
                            {completedModules} dari {totalModules} Modul
                          </span>
                        </div>
                      </div>

                      {track.enrollment.enrolled_at && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-4">
                          <Clock className="h-3.5 w-3.5" />
                          Diambil{" "}
                          {new Date(
                            track.enrollment.enrolled_at,
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}

                      <Button asChild className="w-full">
                        <Link to={`/student/tracks/${track.slug}`}>
                          Lanjutkan Belajar
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-32 w-full rounded-t-lg" />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : completedTracks.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Trophy className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Belum Ada Kelas yang Diselesaikan
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Selesaikan kelas yang sedang kamu pelajari untuk melihatnya di
                  sini.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedTracks.map((track) => (
                <Card
                  key={track.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
                  <div className="relative h-32 bg-muted">
                    {track.image_url ? (
                      <img
                        src={track.image_url}
                        alt={track.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Trophy className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-primary">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-bold line-clamp-2 flex-1">
                        {track.title}
                      </h3>
                    </div>

                    {track.enrollment.completed_at && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        <span>
                          Diselesaikan{" "}
                          {new Date(
                            track.enrollment.completed_at,
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full">
                      <Link to={`/student/tracks/${track.slug}`}>
                        Lihat Detail
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
