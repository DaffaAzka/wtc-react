import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useGetTrackOverview } from "@/hooks/tracks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/students/components/empty-state";
import { EnrollmentConfirmationModal } from "@/students/components/enrollment-confirmation-modal";
import { useEnrollTrack, useMyTracks, useUnenrollTrack } from "@/students/hooks/enrollments";
import { cn, getPatternBackground } from "@/lib/utils";
import { ArrowLeft, Award, BookOpen, CheckCircle, CheckCircle2, Clock, Loader2, PlayCircle, Lock, Play } from "lucide-react";
import { toast } from "sonner";
import type { LessonWithState } from "@/types/model";

export default function TrackDetail() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { trackOverview, loading: trackLoading, error: trackError, refresh } = useGetTrackOverview(slug ?? "");
  const enrollMutation = useEnrollTrack();
  const unenrollMutation = useUnenrollTrack();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loading = trackLoading;
  const error = trackError;
  const isEnrolled = trackOverview?.enrollment?.status === "active" || trackOverview?.enrollment?.status === "completed";

  const handleEnrollClick = () => {
    if (!slug) return;
    setShowConfirmModal(true);
  };

  const handleConfirmEnroll = async () => {
    if (!slug) return;
    await enrollMutation.mutateAsync(slug);
    setShowConfirmModal(false);
  };

  const handleUnenroll = async () => {
    if (!slug) return;
    await unenrollMutation.mutateAsync(slug);
  };

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
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!trackOverview) {
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

  const { track, modules } = trackOverview;

  if (!isEnrolled) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/student/classes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Katalog
          </Link>
        </Button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left: Details (75%) */}
                  <div className="flex-1 space-y-5">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none shadow-sm">{modules.length} Modul</Badge>
                        <Badge className="bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 border-none shadow-sm gap-1">
                          <Clock className="h-3 w-3" />
                          Self-Paced
                        </Badge>
                      </div>
                      <h1 className="text-3xl font-bold">{track.title}</h1>
                    </div>

                    <Separator />

                    <div>
                      <h2 className="mb-2 text-lg font-semibold">Tentang Kelas Ini</h2>
                      {track.description ? (
                        <p className="leading-relaxed text-muted-foreground">{track.description}</p>
                      ) : (
                        <p className="italic text-muted-foreground">Deskripsi kelas akan segera ditambahkan.</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-lg font-semibold">Apa yang Akan Kamu Pelajari</h2>
                      <div className="grid gap-2">
                        {modules.slice(0, 5).map((module) => (
                          <div key={module.id} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                            <span className="text-sm text-muted-foreground">{module.title}</span>
                          </div>
                        ))}
                        {modules.length > 5 && <p className="pl-7 text-sm text-muted-foreground">Dan {modules.length - 5} modul lainnya...</p>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Image with Effects (25%) */}
                  <div className="lg:w-1/4 flex-shrink-0 flex items-start justify-center">
                    <div className="relative w-full max-w-[200px] lg:max-w-none">
                      {/* Background gradient effect */}
                      <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-indigo-500/20 rounded-3xl blur-2xl opacity-60" />

                      {/* Image container */}
                      <div
                        className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
                        style={{ background: getPatternBackground(track.title) }}
                      >
                        {track.image_url && (
                          <img
                            src={track.image_url}
                            alt={track.title}
                            className="w-full aspect-square object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        {/* Subtle overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kurikulum Kelas</CardTitle>
              </CardHeader>
              <CardContent>
                {modules.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">Modul sedang dalam persiapan</p>
                ) : (
                  <div className="space-y-2">
                    {modules.map((module, index) => (
                      <div key={module.id} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                        <Badge variant="outline" className="shrink-0 font-mono">
                          {String(module.order ?? index + 1).padStart(2, "0")}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{module.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-6">
              <CardContent className="space-y-4 p-6">
                <div className="py-4 text-center">
                  <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <p className="mb-1 text-3xl font-bold">Gratis</p>
                  <p className="text-sm text-muted-foreground">Akses selamanya</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Kelas ini mencakup:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{modules.length} Modul pembelajaran</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Akses selamanya</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Belajar dengan tempo sendiri</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Sertifikat penyelesaian</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <Button size="lg" className="w-full" onClick={handleEnrollClick} disabled={enrollMutation.isPending}>
                  {enrollMutation.isPending ? "Memproses..." : "Ambil Kelas Sekarang"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">Dengan mengambil kelas ini, Anda menyetujui untuk belajar dan menyelesaikan materi.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <EnrollmentConfirmationModal open={showConfirmModal} onOpenChange={setShowConfirmModal} onConfirm={handleConfirmEnroll} loading={enrollMutation.isPending} trackTitle={track.title} />
      </div>
    );
  }

  // Helper function to find current lesson
  const findCurrentLesson = () => {
    for (const module of modules) {
      const currentLesson = module.lessons.find((l) => l.state === "current");
      if (currentLesson) {
        return { module, lesson: currentLesson };
      }
    }
    return null;
  };

  const currentLessonInfo = findCurrentLesson();

  const handleLessonClick = (lesson: LessonWithState, module: (typeof modules)[0]) => {
    if (lesson.state === "locked") {
      toast.error("Lesson Terkunci. Selesaikan lesson sebelumnya terlebih dahulu.");
      return;
    }

    // Navigate to lesson with correct 3-segment URL structure
    navigate(`/student/classes/${track.slug}/${module.slug}/${lesson.slug}`);
  };

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Button variant="ghost" asChild>
        <Link to="/student/classes">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Katalog
        </Link>
      </Button>

      {/* Track header with image and progress */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Details & Progress (75%) */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                {/* Title and badges */}
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold">{track.title}</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none shadow-sm">{modules.length} Modul</Badge>
                    <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none shadow-sm gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Terdaftar
                    </Badge>
                  </div>
                </div>

                {/* Overall progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Progress Keseluruhan</span>
                    <span className="text-muted-foreground">{trackOverview.progress.percent}%</span>
                  </div>
                  <Progress value={trackOverview.progress.percent} className="h-2" />
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>
                      {trackOverview.progress.completed_lessons}/{trackOverview.progress.total_lessons} Lessons
                    </span>
                    <span>
                      {trackOverview.progress.completed_challenges}/{trackOverview.progress.total_challenges} Challenges
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start justify-between gap-4">
                {/* Description */}
                {track.description && <p className="text-muted-foreground ml-1 leading-relaxed flex-1">{track.description}</p>}

                {/* Continue learning button */}
                {currentLessonInfo && (
                  <Button size="lg" className="w-full sm:w-auto shrink-0" onClick={() => handleLessonClick(currentLessonInfo.lesson, currentLessonInfo.module)}>
                    <Play className="h-5 w-5 mr-2" />
                    Lanjutkan Belajar: {currentLessonInfo.lesson.title}
                  </Button>
                )}
              </div>
            </div>

            {/* Right: Image with Effects (25%) */}
            <div className="lg:w-1/4 flex-shrink-0 flex items-start justify-center">
              <div className="relative w-full max-w-[200px] lg:max-w-none">
                {/* Background gradient effect */}
                <div className="absolute -inset-4 bg-gradient-to-br from-green-500/20 via-blue-500/20 to-cyan-500/20 rounded-3xl blur-2xl opacity-60" />

                {/* Image container */}
                <div
                  className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
                  style={{ background: getPatternBackground(track.title) }}
                >
                  {track.image_url && (
                    <img
                      src={track.image_url}
                      alt={track.title}
                      className="w-full aspect-square object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  {/* Subtle overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules and lessons */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Kurikulum Kelas</h2>

        {modules.length === 0 ? (
          <EmptyState icon={BookOpen} title="Belum ada modul" description="Modul untuk kelas ini sedang dalam pengembangan." />
        ) : (
          <div className="space-y-4">
            {modules.map((module, moduleIndex) => (
              <Card key={module.id} className="border-none shadow-sm">
                <CardHeader>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Badge variant="outline" className="shrink-0 font-mono">
                          {String(module.order ?? moduleIndex + 1).padStart(2, "0")}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          {module.description && <p className="text-sm text-muted-foreground mt-1">{module.description}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Module progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress Modul</span>
                        <span className="font-medium">{module.progress.percent}%</span>
                      </div>
                      <Progress value={module.progress.percent} className="h-1.5" />
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>
                          {module.progress.completed_lessons}/{module.progress.total_lessons} Lessons
                        </span>
                        <span>
                          {module.progress.completed_challenges}/{module.progress.total_challenges} Challenges
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Lessons list */}
                  {module.lessons.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Belum ada lesson di modul ini</p>
                  ) : (
                    <div className="space-y-2">
                      {module.lessons.map((lesson) => {
                        const isLocked = lesson.state === "locked";
                        const isCurrent = lesson.state === "current";
                        const isCompleted = lesson.state === "completed";

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleLessonClick(lesson, module)}
                            disabled={isLocked}
                            className={cn(
                              "w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                              isLocked && "opacity-50 cursor-not-allowed bg-muted/30",
                              isCurrent && "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 shadow-sm",
                              isCompleted && "bg-muted/20 hover:bg-muted/40",
                              !isLocked && !isCurrent && "hover:shadow-md hover:border-primary/50",
                            )}
                          >
                            {/* Lesson icon */}
                            <div
                              className={cn(
                                "shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                                isLocked && "bg-slate-500/10",
                                isCurrent && "bg-blue-500/10",
                                isCompleted && "bg-green-500/10",
                              )}
                            >
                              {isLocked && <Lock className="h-5 w-5 text-slate-500" />}
                              {isCurrent && <Play className="h-5 w-5 text-blue-500" />}
                              {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                            </div>

                            {/* Lesson info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{lesson.title}</span>
                                {isCurrent && <Badge className="bg-blue-500 text-white text-xs">Sedang Belajar</Badge>}
                              </div>
                              <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                                {lesson.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {lesson.duration} menit
                                  </span>
                                )}
                                {lesson.challenges_count !== undefined && lesson.challenges_count > 0 && <span>{lesson.challenges_count} challenges</span>}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
