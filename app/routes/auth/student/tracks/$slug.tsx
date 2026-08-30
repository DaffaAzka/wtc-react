import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useGetTrack, useGetTrackOverview } from "@/hooks/tracks";
import { TrackPreview } from "./components/track-preview";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/students/components/empty-state";
import {
  useEnrollTrack,
  useTrackEnrollment,
  useUnenrollTrack,
} from "@/students/hooks/enrollments";
import { cn, getPatternBackground } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Play,
  Lock,
  Target,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import type { LessonWithState } from "@/types/model";

export default function TrackDetail() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const { track, loading: trackLoading, error: trackError } = useGetTrack(slug ?? "");
  const { enrollment, loading: enrollmentLoading, refresh: refreshEnrollment } = useTrackEnrollment(slug ?? "");
  const isEnrolled = enrollment?.status === "active" || enrollment?.status === "completed";

  const { trackOverview, loading: overviewLoading, error: overviewError, refresh: refreshOverview } = useGetTrackOverview(slug ?? "");

  const enrollMutation = useEnrollTrack();
  const unenrollMutation = useUnenrollTrack();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loading = trackLoading || enrollmentLoading || (isEnrolled && overviewLoading);
  const error = trackError || (isEnrolled ? overviewError : null);

  const handleEnrollClick = () => { if (!slug) return; setShowConfirmModal(true); };
  const handleConfirmEnroll = async () => {
    if (!slug) return;
    await enrollMutation.mutateAsync(slug);
    setShowConfirmModal(false);
    await Promise.all([refreshEnrollment(), refreshOverview()]);
  };
  const handleUnenroll = async () => { if (!slug) return; await unenrollMutation.mutateAsync(slug); };

  const handleLessonClick = (lesson: LessonWithState, module: any) => {
    if (lesson.state === "locked") { toast.error("Lesson Terkunci. Selesaikan lesson sebelumnya terlebih dahulu."); return; }
    navigate(`/student/classes/${track!.slug}/${module.slug}/${lesson.slug}`);
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-8 max-w-4xl">
        <Skeleton className="h-4 w-36 rounded-lg" />
        <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-6 md:p-8">
          <div className="flex gap-8">
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4 rounded-xl" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-10 w-44 rounded-xl" />
            </div>
            <Skeleton className="hidden lg:block h-48 w-48 shrink-0 rounded-2xl" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-5 space-y-3">
              <Skeleton className="h-5 w-2/3 rounded-lg" />
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="space-y-2 pt-2">
                {[1, 2].map((j) => <Skeleton key={j} className="h-12 w-full rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Link to="/student/classes" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Katalog
        </Link>
        <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-8 flex items-start gap-3">
          <TriangleAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[15px] text-red-600 dark:text-red-400">
            {error.message || "Terjadi kesalahan saat memuat detail kelas."}
          </p>
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────────
  if (!track) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Link to="/student/classes" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Katalog
        </Link>
        <EmptyState icon={BookOpen} title="Kelas tidak ditemukan" description="Kelas yang kamu cari tidak ditemukan atau sudah tidak tersedia." />
      </div>
    );
  }

  // ── Not enrolled ─────────────────────────────────────────────────────────────
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

  // ── Loading overview ─────────────────────────────────────────────────────────
  if (!trackOverview) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#1c81ff]" />
        <p className="text-[14px] text-gray-500 dark:text-gray-400">Memuat kurikulum…</p>
      </div>
    );
  }

  const { modules } = trackOverview;

  const findCurrentLesson = () => {
    for (const module of modules) {
      const currentLesson = module.lessons.find((l) => l.state === "current");
      if (currentLesson) return { module, lesson: currentLesson };
    }
    return null;
  };

  const currentLessonInfo = findCurrentLesson();

  // ── Enrolled view ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Back */}
      <Link to="/student/classes" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Katalog
      </Link>

      {/* Track header */}
      <div className="overflow-hidden rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-0">
          {/* Image */}
          <div className="relative lg:w-56 xl:w-64 shrink-0 overflow-hidden min-h-[180px]"
            style={{ background: getPatternBackground(track.title) }}>
            {track.image_url && (
              <img src={track.image_url} alt={track.title} className="w-full h-full object-cover absolute inset-0"
                onError={(e) => { e.currentTarget.style.display = "none"; }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 dark:to-[#0b1215]/30" />
          </div>

          {/* Info */}
          <div className="flex-1 p-6 md:p-8 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#00E676]/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#00E676]">
                  <CheckCircle className="h-3 w-3" /> Terdaftar
                </span>
                <span className="inline-flex items-center rounded-full bg-[#1c81ff]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#1c81ff]">
                  {modules.length} Modul
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white" style={{ letterSpacing: "-0.02em" }}>
                {track.title}
              </h1>
              {track.description && (
                <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-2">{track.description}</p>
              )}
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-bold text-gray-700 dark:text-gray-300">Progress Keseluruhan</span>
                <span className="font-extrabold text-[#1c81ff] tabular-nums">{trackOverview.progress.percent}%</span>
              </div>
              <Progress value={trackOverview.progress.percent} className="h-2 bg-gray-100 dark:bg-white/10 [&>div]:bg-[#1c81ff]" />
              <div className="flex items-center gap-4 text-[12px] text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {trackOverview.progress.completed_lessons}/{trackOverview.progress.total_lessons} Lessons
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {trackOverview.progress.completed_challenges}/{trackOverview.progress.total_challenges} Challenges
                </span>
              </div>
            </div>

            {/* Continue button */}
            {currentLessonInfo && (
              <button
                onClick={() => handleLessonClick(currentLessonInfo.lesson, currentLessonInfo.module)}
                className="flex items-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-2.5 px-5 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 text-sm"
              >
                <Play className="h-4 w-4" />
                Lanjutkan: {currentLessonInfo.lesson.title}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="space-y-5">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-1">Kurikulum</p>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white" style={{ letterSpacing: "-0.02em" }}>
            Materi Kelas
          </h2>
        </div>

        {modules.length === 0 ? (
          <EmptyState icon={BookOpen} title="Belum ada modul" description="Modul untuk kelas ini sedang dalam pengembangan." />
        ) : (
          <div className="space-y-4">
            {modules.map((module, moduleIndex) => (
              <div key={module.id} className="overflow-hidden rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm">
                {/* Module header */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-[#1c81ff]/10 font-mono text-[11px] font-extrabold text-[#1c81ff]">
                        {String(module.order ?? moduleIndex + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-[15px] text-gray-900 dark:text-white" style={{ letterSpacing: "-0.01em" }}>
                          {module.title}
                        </h3>
                        {module.description && (
                          <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">{module.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 text-[12px] font-bold tabular-nums text-[#1c81ff]">
                      {module.progress.percent}%
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <Progress value={module.progress.percent} className="h-1.5 bg-gray-100 dark:bg-white/10 [&>div]:bg-[#1c81ff]" />
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-600">
                      <span>{module.progress.completed_lessons}/{module.progress.total_lessons} lessons</span>
                      <span>{module.progress.completed_challenges}/{module.progress.total_challenges} challenges</span>
                    </div>
                  </div>
                </div>

                {/* Lessons */}
                <div className="p-3 space-y-1.5">
                  {module.lessons.length === 0 ? (
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 text-center py-6">Belum ada lesson di modul ini</p>
                  ) : (
                    module.lessons.map((lesson) => {
                      const isLocked    = lesson.state === "locked";
                      const isCurrent   = lesson.state === "current";
                      const isCompleted = lesson.state === "completed";

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson, module)}
                          disabled={isLocked}
                          className={cn(
                            "w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all",
                            isLocked && "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-white/[0.02]",
                            isCurrent && "bg-[#1c81ff]/10 border border-[#1c81ff]/20",
                            isCompleted && "hover:bg-gray-50 dark:hover:bg-white/5",
                            !isLocked && !isCurrent && !isCompleted && "hover:bg-gray-50 dark:hover:bg-white/5",
                          )}
                        >
                          {/* Icon */}
                          <div className={cn(
                            "shrink-0 h-9 w-9 rounded-full flex items-center justify-center",
                            isLocked    && "bg-gray-100 dark:bg-white/5",
                            isCurrent   && "bg-[#1c81ff]/20",
                            isCompleted && "bg-[#00E676]/10",
                            !isLocked && !isCurrent && !isCompleted && "bg-gray-100 dark:bg-white/5",
                          )}>
                            {isLocked    && <Lock       className="h-4 w-4 text-gray-400 dark:text-gray-600" />}
                            {isCurrent   && <Play       className="h-4 w-4 text-[#1c81ff]" />}
                            {isCompleted && <CheckCircle className="h-4 w-4 text-[#00E676]" />}
                            {!isLocked && !isCurrent && !isCompleted && <Play className="h-4 w-4 text-gray-400 dark:text-gray-600" />}
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn("text-[14px] font-bold truncate",
                                isCurrent   && "text-[#1c81ff]",
                                isCompleted && "text-gray-900 dark:text-white",
                                isLocked    && "text-gray-400 dark:text-gray-600",
                                !isLocked && !isCurrent && !isCompleted && "text-gray-900 dark:text-white",
                              )}>
                                {lesson.title}
                              </span>
                              {isCurrent && (
                                <span className="shrink-0 inline-flex items-center rounded-full bg-[#1c81ff] px-2 py-0.5 text-[10px] font-bold text-white">
                                  Sedang Belajar
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-[12px] text-gray-400 dark:text-gray-600">
                              {lesson.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {lesson.duration} menit
                                </span>
                              )}
                              {lesson.challenges_count !== undefined && lesson.challenges_count > 0 && (
                                <span className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  {lesson.challenges_count} challenges
                                </span>
                              )}
                            </div>
                          </div>

                          {isCompleted && <CheckCircle2 className="shrink-0 h-4 w-4 text-[#00E676]" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
