import { useParams, Link } from "react-router";
import { useGetTrack } from "@/hooks/tracks";
import { useGetModulesByTrack } from "@/hooks/modules";
import { useGetEnrollment, useEnroll, useUnenroll, useTrackOverview } from "@/hooks/enrollment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/students/components/empty-state";
import { ArrowLeft, BookOpen, PlayCircle, CheckCircle, Loader2 } from "lucide-react";
import { ProgressBarWithLabel, CircularProgress, CompletionBadge, LessonStatusIcon } from "@/components/progress/ProgressIndicators";
import { cn } from "@/lib/utils";

export default function TrackDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { track, loading: trackLoading, error: trackError } = useGetTrack(slug!);
  const { modules, loading: modulesLoading, error: modulesError } = useGetModulesByTrack(slug!);

  // Enrollment hooks
  const { data: enrollment, isLoading: enrollmentLoading } = useGetEnrollment(slug!);
  const { mutate: enroll, isPending: enrolling } = useEnroll();
  const { mutate: unenroll, isPending: unenrolling } = useUnenroll();

  // Track overview with progress data (only fetches if enrolled)
  const { data: overview, isLoading: overviewLoading } = useTrackOverview(slug!);

  const loading = trackLoading || modulesLoading;
  const error = trackError || modulesError;
  const isEnrolled = !!enrollment;

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/student/classes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Katalog
          </Link>
        </Button>
        <EmptyState icon={BookOpen} title="Gagal memuat data" description={error.message || "Terjadi kesalahan saat memuat detail kelas."} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/student/classes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Katalog
          </Link>
        </Button>
        <EmptyState icon={BookOpen} title="Kelas tidak ditemukan" description="Kelas yang kamu cari tidak ditemukan atau sudah tidak tersedia." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link to="/student/classes">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Katalog
        </Link>
      </Button>

      {/* Main Content - Desktop: Side by Side, Mobile: Stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Track Header */}
        <Card className="h-full">
          <CardContent className="p-0 h-full flex flex-col">
            {/* Track Image */}
            {track.image_url && (
              <div className="aspect-video w-full overflow-hidden flex-shrink-0">
                <img src={track.image_url} alt={track.title} className="h-full w-full object-cover" />
              </div>
            )}

            <div className="p-6 flex-1 flex flex-col gap-4">
              {/* Title and Meta */}
              <div className="space-y-3">
                <h1 className="text-3xl font-bold">{track.title}</h1>

                <div className="flex items-center gap-2 flex-wrap">
                  {track.modules_count !== null && track.modules_count !== undefined && <Badge variant="secondary">{track.modules_count} Modul</Badge>}
                  <Badge variant="outline">{modules.length} Modul Tersedia</Badge>
                  {isEnrolled && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Terdaftar
                    </Badge>
                  )}
                </div>

                {/* Description */}
                {track.description && <p className="text-muted-foreground leading-relaxed">{track.description}</p>}
              </div>

              {/* Progress Section - Only show if enrolled and overview data is available */}
              {isEnrolled && overview && (
                <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">Progress Belajar</h3>
                    <CompletionBadge completed={overview.progress.completed_lessons} total={overview.progress.total_lessons} label="pelajaran" />
                  </div>
                  <ProgressBarWithLabel value={overview.progress.percent} showPercentage size="lg" />
                </div>
              )}

              {/* Enrollment Button */}
              <div className="mt-auto pt-2">
                {isEnrolled ? (
                  <Button variant="outline" onClick={() => unenroll(slug!)} disabled={unenrolling} className="w-full">
                    {unenrolling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Keluar dari Track"
                    )}
                  </Button>
                ) : (
                  <Button onClick={() => enroll(slug!)} disabled={enrolling || enrollmentLoading} className="w-full">
                    {enrolling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Mendaftar...
                      </>
                    ) : (
                      "Daftar Sekarang"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules Section */}
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-2xl">Daftar Modul</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {modules.length === 0 ? (
              <EmptyState icon={BookOpen} title="Belum ada modul" description="Modul untuk kelas ini sedang dalam pengembangan." />
            ) : (
              <div className="space-y-3">
                {modules.map((module, index) => {
                  // Find module progress from overview data if available
                  const moduleProgress = overview?.modules.find((m) => m.id === module.id);

                  return (
                    <Card key={module.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          {/* Progress indicator - only show if enrolled and has progress data */}
                          {isEnrolled && moduleProgress && (
                            <div className="flex-shrink-0">
                              <CircularProgress value={moduleProgress.progress.percent} size={48} strokeWidth={4} />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="font-mono flex-shrink-0">
                                {String(module.order ?? index + 1).padStart(2, "0")}
                              </Badge>
                              <CardTitle className="text-lg truncate">{module.title}</CardTitle>
                            </div>

                            {/* Module progress info */}
                            {isEnrolled && moduleProgress && (
                              <p className="text-sm text-muted-foreground">
                                {moduleProgress.progress.completed_lessons} of {moduleProgress.progress.total_lessons} pelajaran
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      {/* Lesson List with completion states - only show if enrolled */}
                      {isEnrolled && moduleProgress && moduleProgress.lessons.length > 0 && (
                        <CardContent className="pt-0">
                          <div className="space-y-1.5 pl-2">
                            {moduleProgress.lessons.map((lesson) => (
                              <div key={lesson.id} className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent/50 transition-colors">
                                <LessonStatusIcon state={lesson.state} size={16} />
                                <span className={cn("text-sm flex-1", lesson.state === "locked" && "text-muted-foreground", lesson.state === "completed" && "text-muted-foreground line-through")}>
                                  {lesson.title}
                                </span>
                                {lesson.duration && <span className="text-xs text-muted-foreground">{lesson.duration} min</span>}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
