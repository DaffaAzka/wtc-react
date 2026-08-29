import { useNavigate, useParams, useLocation } from "react-router";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Lock,
  Loader2,
  Download,
  PlayCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContentView from "@/components/custom/content-view";
import { cn } from "@/lib/utils";
import { TrackProvider, useTrackContext } from "@/contexts/track-context";
import { useLessonCompletion } from "@/hooks/lessons";
import { useGetLesson } from "@/hooks/lessons";
import { useGetChallengesByLesson } from "@/hooks/challenges";
import { ChallengeSection } from "./ChallengeSection";
import { toast } from "sonner";
import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";

function LessonDetailContent({
  lessonSlug,
  bypassLockCheck,
}: {
  lessonSlug: string;
  bypassLockCheck?: boolean;
}) {
  const navigate = useNavigate();
  const { setOpen } = useSidebar();

  const {
    trackOverview,
    loading: trackLoading,
    findLessonBySlug,
    getNextLesson,
    refreshTrackOverview,
  } = useTrackContext();
  const { mutate: completeLesson, isPending: completing } = useLessonCompletion();

  const trackSlug = trackOverview?.track.slug;

  const findModuleSlugForLesson = (slug: string): string | null => {
    if (!trackOverview) return null;
    for (const module of trackOverview.modules) {
      if (module.lessons.find((l) => l.slug === slug)) return module.slug;
    }
    return null;
  };

  const lessonWithState = lessonSlug ? findLessonBySlug(lessonSlug) : null;
  const { lesson: fullLesson, loading: lessonLoading } = useGetLesson(lessonSlug || "");

  const lessonId = lessonWithState?.id;
  const { challenges, loading: challengesLoading } = useGetChallengesByLesson(lessonId || 0);
  const hasLessonChallenges = challenges && challenges.length > 0;

  useEffect(() => {
    if (bypassLockCheck) return;
    if (!trackLoading && lessonWithState && lessonWithState.state === "locked") {
      toast.error("Lesson terkunci. Selesaikan lesson sebelumnya dulu.");
      navigate(`/student/classes/${trackSlug}`);
    }
  }, [lessonWithState, trackLoading, navigate, trackSlug, bypassLockCheck, lessonSlug]);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (trackLoading || lessonLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#1c81ff]" />
          <p className="text-[14px] text-gray-500 dark:text-gray-400">Memuat lesson…</p>
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────────
  if (!lessonWithState || !fullLesson) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
        <div className="text-center space-y-4">
          <p className="text-[15px] font-bold text-gray-900 dark:text-white">
            Lesson tidak ditemukan
          </p>
          <button
            onClick={() => {
              setOpen(true);
              setTimeout(() => navigate(`/student/classes/${trackSlug}`), 0);
            }}
            className="flex items-center gap-1.5 mx-auto bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-4 py-2 text-[14px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Kelas
          </button>
        </div>
      </div>
    );
  }

  if (lessonWithState.state === "locked") return null;

  const currentModule = trackOverview?.modules.find((m) =>
    m.lessons.some((l) => l.slug === lessonSlug)
  );

  const allLessons = trackOverview?.modules.flatMap((m) => m.lessons) || [];
  const currentIndex = allLessons.findIndex((l) => l.slug === lessonSlug);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleComplete = async () => {
    if (!lessonSlug) return;
    completeLesson(lessonSlug, {
      onSuccess: async () => {
        await refreshTrackOverview();
        const next = getNextLesson(lessonSlug);
        if (next) {
          const nextModuleSlug = findModuleSlugForLesson(next.slug);
          if (nextModuleSlug && trackSlug) {
            navigate(`/student/classes/${trackSlug}/${nextModuleSlug}/${next.slug}`, {
              state: { bypassLockCheck: true },
            });
          } else {
            toast.error("Tidak dapat membuka lesson selanjutnya");
            navigate(`/student/classes/${trackSlug}`);
          }
        } else {
          navigate(`/student/classes/${trackSlug}`);
        }
      },
    });
  };

  const handlePrevious = () => {
    if (previousLesson && trackSlug) {
      const prevModuleSlug = findModuleSlugForLesson(previousLesson.slug);
      if (prevModuleSlug)
        navigate(`/student/classes/${trackSlug}/${prevModuleSlug}/${previousLesson.slug}`);
    }
  };

  const handleNext = () => {
    if (nextLesson && nextLesson.state !== "locked" && trackSlug) {
      const nextModuleSlug = findModuleSlugForLesson(nextLesson.slug);
      if (nextModuleSlug)
        navigate(`/student/classes/${trackSlug}/${nextModuleSlug}/${nextLesson.slug}`);
    }
  };

  const isCompleted = lessonWithState.state === "completed";
  const canMarkComplete = lessonWithState.state === "current" || lessonWithState.state === "completed";

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden -m-6 md:-m-8">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-[#0a0f12]/90 backdrop-blur-md px-5">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => { setOpen(true); setTimeout(() => navigate(`/student/classes/${trackSlug}`), 0); }}
            className="shrink-0 flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Kembali</span>
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-white/10" />
          <div className="flex items-center gap-2 min-w-0">
            {isCompleted && <CheckCircle2 className="shrink-0 h-4 w-4 text-[#00E676]" />}
            <h1 className="text-[14px] font-extrabold text-gray-900 dark:text-white truncate" style={{ letterSpacing: "-0.01em" }}>
              {fullLesson.title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] ${
              isCompleted
                ? "bg-[#00E676]/10 text-[#00E676]"
                : "bg-[#1c81ff]/10 text-[#1c81ff]"
            }`}
          >
            {isCompleted ? "Selesai" : "Sedang Belajar"}
          </span>
          <span className="text-[12px] font-bold text-gray-400 dark:text-gray-600 tabular-nums">
            {currentIndex + 1}/{allLessons.length}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6 md:p-8 pb-24 space-y-6">
            {/* Video */}
            {fullLesson.video_url && (
              <div className="overflow-hidden rounded-2xl bg-black shadow-lg">
                <div className="aspect-video">
                  <iframe
                    src={fullLesson.video_url}
                    title={fullLesson.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 md:p-8">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <ContentView rawJsonData={fullLesson.content} />
              </div>
            </div>

            {/* Attachments */}
            {fullLesson.attachments && fullLesson.attachments.length > 0 && (
              <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/5">
                  <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
                    <Download className="h-4 w-4 text-[#1c81ff]" />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">Materi Tambahan</span>
                </div>
                <div className="p-4 space-y-2">
                  {fullLesson.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={`/api/attachments/${attachment.id}/download`}
                      className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-gray-900 dark:text-white group-hover:text-[#1c81ff] transition-colors truncate">
                          {attachment.title}
                        </p>
                        {attachment.description && (
                          <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{attachment.description}</p>
                        )}
                        <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-0.5 font-mono">
                          {attachment.file_name}
                          {attachment.size && ` · ${attachment.size}`}
                        </p>
                      </div>
                      <Download className="shrink-0 h-4 w-4 text-gray-400 dark:text-gray-600 group-hover:text-[#1c81ff] transition-colors ml-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Challenge section */}
            {hasLessonChallenges && !isCompleted && canMarkComplete && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-10 rounded-full bg-gradient-to-b from-[#1c81ff] to-[#31c7c8]" />
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white" style={{ letterSpacing: "-0.02em" }}>
                      {challenges.length === 1 ? "Challenge untuk Lesson Ini" : `${challenges.length} Challenges`}
                    </h2>
                    <p className="text-[14px] text-gray-500 dark:text-gray-400">
                      Selesaikan {challenges.length === 1 ? "challenge ini" : "semua challenges"} untuk menyelesaikan lesson
                    </p>
                  </div>
                </div>
                {challenges.map((challenge, index) => (
                  <ChallengeSection key={challenge.id} challenge={challenge} index={index} total={challenges.length} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="hidden lg:flex w-72 xl:w-80 border-l border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0f12] h-full flex-col">
          {/* Module header */}
          <div className="px-5 py-4 border-b border-gray-200 dark:border-white/10 space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-600 mb-1">
                {currentModule?.title ?? "Module"}
              </p>
              <div className="flex items-center justify-between gap-2">
                <Progress
                  value={trackOverview?.progress.percent || 0}
                  className="h-1.5 flex-1 bg-gray-100 dark:bg-white/10 [&>div]:bg-[#1c81ff]"
                />
                <span className="shrink-0 text-[11px] font-extrabold text-[#1c81ff] tabular-nums">
                  {Math.round(trackOverview?.progress.percent || 0)}%
                </span>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1">
                {trackOverview?.progress.completed_lessons}/{trackOverview?.progress.total_lessons} lessons selesai
              </p>
            </div>
          </div>

          {/* Lessons list */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {allLessons.map((lesson, index) => {
                const isActive = lesson.slug === lessonSlug;
                const isLocked = lesson.state === "locked";
                const isDone = lesson.state === "completed";

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      if (!isLocked && trackSlug) {
                        const lessonModuleSlug = findModuleSlugForLesson(lesson.slug);
                        if (lessonModuleSlug)
                          navigate(`/student/classes/${trackSlug}/${lessonModuleSlug}/${lesson.slug}`);
                      } else if (isLocked) {
                        toast.error("Lesson ini masih terkunci");
                      }
                    }}
                    disabled={isLocked}
                    className={cn(
                      "w-full flex items-start gap-3 rounded-xl p-3 text-left transition-all",
                      isActive && "bg-[#1c81ff]/10 border border-[#1c81ff]/20",
                      !isActive && !isLocked && "hover:bg-gray-50 dark:hover:bg-white/5",
                      isLocked && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isLocked ? (
                        <Lock className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                      ) : isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-[#00E676]" />
                      ) : (
                        <Circle className={cn("h-4 w-4", isActive ? "text-[#1c81ff] fill-[#1c81ff]" : "text-gray-300 dark:text-white/20")} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block font-mono text-[10px] text-gray-400 dark:text-gray-600 mb-0.5">
                        {String(lesson.order ?? index + 1).padStart(2, "0")}
                      </span>
                      <span className={cn(
                        "block text-[13px] font-bold line-clamp-2",
                        isActive ? "text-[#1c81ff]" : "text-gray-700 dark:text-gray-300",
                        isLocked && "text-gray-400 dark:text-gray-600",
                      )}>
                        {lesson.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* ── Bottom navigation ── */}
      <div className="border-t border-gray-200 dark:border-white/10 bg-white/90 dark:bg-[#0a0f12]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={!previousLesson}
            className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-w-28"
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </button>

          <div className="flex items-center gap-3">
            {!hasLessonChallenges && !isCompleted && canMarkComplete && (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="flex items-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-2 px-5 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[13px]"
              >
                {completing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Tandai Selesai
                  </>
                )}
              </button>
            )}
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00E676]/10 px-4 py-2 text-[13px] font-bold text-[#00E676]">
                <CheckCircle2 className="h-4 w-4" />
                Selesai
              </span>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={!nextLesson || nextLesson.state === "locked"}
            className="flex items-center gap-1.5 bg-[#1c81ff] text-white font-bold rounded-xl px-4 py-2 text-[13px] shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none min-w-28 justify-end"
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LessonsPage() {
  const { slug: trackSlug, moduleSlug, lessonSlug } = useParams<{
    slug: string;
    moduleSlug: string;
    lessonSlug?: string;
  }>();
  const location = useLocation();
  const bypassLockCheck = location.state?.bypassLockCheck as boolean | undefined;

  if (!trackSlug || !lessonSlug) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[15px] text-gray-500 dark:text-gray-400">
          Tidak dapat membuka lesson. Silakan akses melalui halaman track.
        </p>
      </div>
    );
  }

  return (
    <TrackProvider trackSlug={trackSlug}>
      <LessonDetailContent lessonSlug={lessonSlug} bypassLockCheck={bypassLockCheck} />
    </TrackProvider>
  );
}
