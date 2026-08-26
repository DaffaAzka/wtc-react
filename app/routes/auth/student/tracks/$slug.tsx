import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useGetTrack, useGetTrackOverview } from "@/hooks/tracks";
import { TrackPreview } from "./components/track-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/students/components/empty-state";
import { EnrollmentConfirmationModal } from "@/students/components/enrollment-confirmation-modal";
import {
  useEnrollTrack,
  useMyTracks,
  useTrackEnrollment,
  useUnenrollTrack,
} from "@/students/hooks/enrollments";
import { cn, getPatternBackground } from "@/lib/utils";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  Clock,
  Loader2,
  PlayCircle,
  Lock,
  Play,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import type { LessonWithState } from "@/types/model";

export default function TrackDetail() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  // Fetch basic track data (always accessible)
  const {
    track,
    loading: trackLoading,
    error: trackError,
  } = useGetTrack(slug ?? "");

  // Check enrollment status
  const {
    enrollment,
    loading: enrollmentLoading,
    refresh: refreshEnrollment,
  } = useTrackEnrollment(slug ?? "");
  const isEnrolled =
    enrollment?.status === "active" || enrollment?.status === "completed";

  // Fetch full overview only if enrolled
  const {
    trackOverview,
    loading: overviewLoading,
    error: overviewError,
    refresh: refreshOverview,
  } = useGetTrackOverview(slug ?? "");

  const enrollMutation = useEnrollTrack();
  const unenrollMutation = useUnenrollTrack();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loading =
    trackLoading || enrollmentLoading || (isEnrolled && overviewLoading);
  const error = trackError || (isEnrolled ? overviewError : null);

  const handleEnrollClick = () => {
    if (!slug) return;
    setShowConfirmModal(true);
  };

  const handleConfirmEnroll = async () => {
    if (!slug) return;
    await enrollMutation.mutateAsync(slug);
    setShowConfirmModal(false);

    // Refresh enrollment status and overview to update UI to enrolled view
    await Promise.all([refreshEnrollment(), refreshOverview()]);
  };

  const handleUnenroll = async () => {
    if (!slug) return;
    await unenrollMutation.mutateAsync(slug);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/student/tracks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Katalog
          </Link>
        </Button>
        <EmptyState
          icon={BookOpen}
          title="Gagal memuat data"
          description={
            error.message || "Terjadi kesalahan saat memuat detail kelas."
          }
        />
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

  if (!track) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/student/tracks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Katalog
          </Link>
        </Button>
        <EmptyState
          icon={BookOpen}
          title="Kelas tidak ditemukan"
          description="Kelas yang kamu cari tidak ditemukan atau sudah tidak tersedia."
        />
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <TrackPreview
        track={track}
        showConfirmModal={showConfirmModal}
        enrollmentPending={enrollMutation.isPending}
        onEnrollClick={handleEnrollClick}
        onConfirmEnroll={handleConfirmEnroll}
        onModalChange={setShowConfirmModal}
      />
    );
  }

  // Enrolled view - ensure trackOverview is available
  if (!trackOverview) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/student/tracks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Katalog
          </Link>
        </Button>
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-16 w-16 text-muted-foreground mx-auto animate-spin" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Memuat Data Track</h2>
              <p className="text-muted-foreground">
                Sedang mengambil data track Anda...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const { modules } = trackOverview;

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

  const handleLessonClick = (
    lesson: LessonWithState,
    module: (typeof modules)[0],
  ) => {
    if (lesson.state === "locked") {
      toast.error(
        "Lesson Terkunci. Selesaikan lesson sebelumnya terlebih dahulu.",
      );
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
                    <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none shadow-sm">
                      {modules.length} Modul
                    </Badge>
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
                    <span className="text-muted-foreground">
                      {trackOverview.progress.percent}%
                    </span>
                  </div>
                  <Progress
                    value={trackOverview.progress.percent}
                    className="h-2"
                  />
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>
                      {trackOverview.progress.completed_lessons}/
                      {trackOverview.progress.total_lessons} Lessons
                    </span>
                    <span>
                      {trackOverview.progress.completed_challenges}/
                      {trackOverview.progress.total_challenges} Challenges
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start justify-between gap-4">
                {/* Description */}
                {track.description && (
                  <p className="text-muted-foreground ml-1 leading-relaxed flex-1">
                    {track.description}
                  </p>
                )}

                {/* Continue learning button */}
                {currentLessonInfo && (
                  <Button
                    size="lg"
                    className="w-full sm:w-auto shrink-0"
                    onClick={() =>
                      handleLessonClick(
                        currentLessonInfo.lesson,
                        currentLessonInfo.module,
                      )
                    }>
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
                  style={{ background: getPatternBackground(track.title) }}>
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
          <EmptyState
            icon={BookOpen}
            title="Belum ada modul"
            description="Modul untuk kelas ini sedang dalam pengembangan."
          />
        ) : (
          <div className="space-y-4">
            {modules.map((module, moduleIndex) => (
              <Card key={module.id} className="border-none shadow-sm">
                <CardHeader>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Badge variant="outline" className="shrink-0 font-mono">
                          {String(module.order ?? moduleIndex + 1).padStart(
                            2,
                            "0",
                          )}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg">
                            {module.title}
                          </CardTitle>
                          {module.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {module.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Module progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Progress Modul
                        </span>
                        <span className="font-medium">
                          {module.progress.percent}%
                        </span>
                      </div>
                      <Progress
                        value={module.progress.percent}
                        className="h-1.5"
                      />
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>
                          {module.progress.completed_lessons}/
                          {module.progress.total_lessons} Lessons
                        </span>
                        <span>
                          {module.progress.completed_challenges}/
                          {module.progress.total_challenges} Challenges
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Lessons list */}
                  {module.lessons.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Belum ada lesson di modul ini
                    </p>
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
                              isLocked &&
                                "opacity-50 cursor-not-allowed bg-muted/30",
                              isCurrent &&
                                "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 shadow-sm",
                              isCompleted && "bg-muted/20 hover:bg-muted/40",
                              !isLocked &&
                                !isCurrent &&
                                "hover:shadow-md hover:border-primary/50",
                            )}>
                            {/* Lesson icon */}
                            <div
                              className={cn(
                                "shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                                isLocked && "bg-slate-500/10",
                                isCurrent && "bg-blue-500/10",
                                isCompleted && "bg-green-500/10",
                              )}>
                              {isLocked && (
                                <Lock className="h-5 w-5 text-slate-500" />
                              )}
                              {isCurrent && (
                                <Play className="h-5 w-5 text-blue-500" />
                              )}
                              {isCompleted && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                            </div>

                            {/* Lesson info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {lesson.title}
                                </span>
                                {isCurrent && (
                                  <Badge className="bg-blue-500 text-white text-xs">
                                    Sedang Belajar
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                                {lesson.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {lesson.duration} menit
                                  </span>
                                )}
                                {lesson.challenges_count !== undefined &&
                                  lesson.challenges_count > 0 && (
                                    <span>
                                      {lesson.challenges_count} challenges
                                    </span>
                                  )}
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
