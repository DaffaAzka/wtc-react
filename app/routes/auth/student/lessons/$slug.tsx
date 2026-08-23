import { useNavigate, useParams, Link, useLocation } from "react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Circle, Lock, Loader2, Download, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import ContentView from "@/components/custom/content-view";
import { cn } from "@/lib/utils";
import { TrackProvider, useTrackContext } from "@/contexts/track-context";
import { useLessonCompletion } from "@/hooks/lessons";
import { useGetLesson } from "@/hooks/lessons";
import { useGetChallengesByLesson } from "@/hooks/challenges";
import { useMySubmissions, useSubmitChallenge } from "@/hooks/submission";
import { ChallengeDetails } from "@/features/auth/challenges/challenge-details";
import { SubmissionForm } from "@/features/auth/challenges/submission-form";
import { SubmissionHistory } from "@/features/auth/challenges/submission-history";
import { toast } from "sonner";
import { useEffect } from "react";

function LessonDetailContent({ lessonSlug, bypassLockCheck }: { lessonSlug: string; bypassLockCheck?: boolean }) {
  const navigate = useNavigate();

  const { trackOverview, loading: trackLoading, findLessonBySlug, getNextLesson, refreshTrackOverview } = useTrackContext();
  const { mutate: completeLesson, isPending: completing } = useLessonCompletion();

  // Get track slug from context
  const trackSlug = trackOverview?.track.slug;

  // Helper: Find module slug for a given lesson slug
  const findModuleSlugForLesson = (lessonSlug: string): string | null => {
    if (!trackOverview) return null;

    for (const module of trackOverview.modules) {
      const lesson = module.lessons.find((l) => l.slug === lessonSlug);
      if (lesson) return module.slug;
    }

    return null;
  };

  // Get lesson state from track overview
  const lessonWithState = lessonSlug ? findLessonBySlug(lessonSlug) : null;

  // Also fetch full lesson content for display
  const { lesson: fullLesson, loading: lessonLoading } = useGetLesson(lessonSlug || "");

  // 🎯 LESSON CHALLENGES: Fetch challenges assigned to this specific lesson
  const lessonId = lessonWithState?.id;
  const { challenges, loading: challengesLoading } = useGetChallengesByLesson(lessonId || 0);
  const hasLessonChallenges = challenges && challenges.length > 0;

  // For lesson challenges: fetch submissions for the first challenge
  const firstChallenge = hasLessonChallenges ? challenges[0] : null;
  const { data: submissions = [] } = useMySubmissions(firstChallenge?.id || 0);
  const { mutate: submitChallenge, isPending: isSubmitting } = useSubmitChallenge();

  // 🚨 ROUTE GUARD: Block if locked (unless bypassed after completion)
  useEffect(() => {
    if (bypassLockCheck) {
      console.log("✅ Route guard BYPASSED - just completed previous lesson");
      return;
    }

    if (!trackLoading && lessonWithState && lessonWithState.state === "locked") {
      console.log("🚫 ROUTE GUARD: Lesson is LOCKED, redirecting back to track overview");
      console.log("🚫 Locked lesson:", lessonSlug, lessonWithState);
      toast.error("Lesson terkunci. Selesaikan lesson sebelumnya dulu.");
      navigate(`/student/classes/${trackSlug}`);
    }
  }, [lessonWithState, trackLoading, navigate, trackSlug, bypassLockCheck, lessonSlug]);

  if (trackLoading || lessonLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="text-sm text-muted-foreground">Memuat lesson...</p>
        </div>
      </div>
    );
  }

  if (!lessonWithState || !fullLesson) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">Lesson tidak ditemukan</p>
          <Button variant="outline" onClick={() => navigate(`/student/classes/${trackSlug}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Kelas
          </Button>
        </div>
      </div>
    );
  }

  // Guard check - should not reach here if locked (useEffect handles redirect)
  if (lessonWithState.state === "locked") {
    return null;
  }

  // Find current module and lesson position
  const currentModule = trackOverview?.modules.find(m =>
    m.lessons.some(l => l.slug === lessonSlug)
  );

  // Get all lessons in order for navigation
  const allLessons = trackOverview?.modules.flatMap(m => m.lessons) || [];
  const currentIndex = allLessons.findIndex(l => l.slug === lessonSlug);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleComplete = async () => {
    if (!lessonSlug) return;

    completeLesson(lessonSlug, {
      onSuccess: async () => {
        console.log("✅ Lesson completed successfully");

        // Refresh track overview to update lesson states
        await refreshTrackOverview();
        console.log("🔄 Track overview refreshed");

        // Navigate to next lesson if available
        const next = getNextLesson(lessonSlug);
        console.log("🔍 Next lesson:", next);
        console.log("🔍 Next lesson STATE:", next?.state);

        if (next) {
          const nextModuleSlug = findModuleSlugForLesson(next.slug);
          console.log("📁 Next module slug:", nextModuleSlug);
          console.log("📚 Track slug:", trackSlug);

          if (nextModuleSlug && trackSlug) {
            console.log("➡️ Navigating to:", `/student/classes/${trackSlug}/${nextModuleSlug}/${next.slug}`);
            // Pass flag to bypass route guard since we just completed previous lesson
            navigate(`/student/classes/${trackSlug}/${nextModuleSlug}/${next.slug}`, {
              state: { bypassLockCheck: true }
            });
          } else {
            console.error("❌ Cannot navigate: missing module or track slug");
            toast.error("Tidak dapat membuka lesson selanjutnya");
            // Fallback to track overview
            navigate(`/student/classes/${trackSlug}`);
          }
        } else {
          console.log("🏁 No next lesson, going back to track overview");
          navigate(`/student/classes/${trackSlug}`);
        }
      },
    });
  };

  const handlePrevious = () => {
    if (previousLesson && trackSlug) {
      const prevModuleSlug = findModuleSlugForLesson(previousLesson.slug);
      if (prevModuleSlug) {
        navigate(`/student/classes/${trackSlug}/${prevModuleSlug}/${previousLesson.slug}`);
      }
    }
  };

  const handleNext = () => {
    if (nextLesson && nextLesson.state !== "locked" && trackSlug) {
      const nextModuleSlug = findModuleSlugForLesson(nextLesson.slug);
      if (nextModuleSlug) {
        navigate(`/student/classes/${trackSlug}/${nextModuleSlug}/${nextLesson.slug}`);
      }
    }
  };

  // Challenge submission handler
  const handleChallengeSubmit = (file: File | null, content: string) => {
    if (!firstChallenge) return;

    submitChallenge({
      challengeId: firstChallenge.id,
      request: {
        file: file || undefined,
        content: content || undefined
      }
    }, {
      onSuccess: () => {
        toast.success("Challenge berhasil dikumpulkan! 🎉");
        // Note: Lesson completion might be automatic after challenge is graded by instructor
      }
    });
  };

  // Calculate remaining attempts for challenge
  const submissionCount = submissions.length;
  const allowedAttempts = firstChallenge?.allowed_attempts || 0;
  const remainingAttempts = allowedAttempts > 0 ? allowedAttempts - submissionCount : Infinity;
  const canSubmitChallenge = remainingAttempts > 0 || allowedAttempts === 0;

  const isCompleted = lessonWithState.state === "completed";
  const canMarkComplete = lessonWithState.state === "current" || lessonWithState.state === "completed";

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-blue-950/20">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/student/classes/${trackSlug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Kelas
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              {isCompleted && (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              )}
              <h1 className="text-lg font-semibold line-clamp-1">
                {fullLesson.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isCompleted ? "default" : "secondary"} className="hidden sm:flex">
              {isCompleted ? "Selesai" : "Sedang Belajar"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {allLessons.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 pb-24 space-y-6">
            {/* Video Section */}
            {fullLesson.video_url && (
              <Card className="border-none shadow-sm overflow-hidden bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
                <CardContent className="p-0">
                  <div className="aspect-video rounded-lg overflow-hidden bg-slate-900">
                    <iframe
                      src={fullLesson.video_url}
                      title={fullLesson.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lesson Content */}
            <Card className="border-none shadow-sm">
              <CardContent className="p-8">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <ContentView rawJsonData={fullLesson.content} />
                </div>
              </CardContent>
            </Card>

            {/* Attachments Section */}
            {fullLesson.attachments && fullLesson.attachments.length > 0 && (
              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Download className="h-5 w-5 text-blue-500" />
                    Materi Tambahan
                  </h3>
                  <div className="space-y-3">
                    {fullLesson.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={`/api/attachments/${attachment.id}/download`}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors group"
                      >
                        <div className="flex-1">
                          <p className="font-medium group-hover:text-blue-600 transition-colors">
                            {attachment.title}
                          </p>
                          {attachment.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {attachment.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {attachment.file_name} • {attachment.size}
                          </p>
                        </div>
                        <Download className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 transition-colors flex-shrink-0 ml-4" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 🎯 LESSON CHALLENGE SECTION - Replaces "Tandai Selesai" button */}
            {hasLessonChallenges && !isCompleted && canMarkComplete && firstChallenge && (
              <div className="mt-8 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Challenge untuk Lesson Ini</h2>
                    <p className="text-sm text-muted-foreground">Selesaikan challenge ini untuk menyelesaikan lesson</p>
                  </div>
                </div>

                <ChallengeDetails
                  challenge={firstChallenge}
                  submissionCount={submissionCount}
                  remainingAttempts={remainingAttempts}
                />

                <SubmissionHistory
                  submissions={submissions}
                  maxScore={firstChallenge.max_score}
                />

                <SubmissionForm
                  challenge={firstChallenge}
                  canSubmit={canSubmitChallenge}
                  isSubmitting={isSubmitting}
                  onSubmit={handleChallengeSubmit}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Lesson Navigation */}
        <div className="hidden lg:flex lg:w-80 xl:w-96 border-l bg-background/50 backdrop-blur">
          <div className="flex flex-col w-full h-full">
            {/* Module Info */}
            <div className="p-6 border-b bg-background">
              <div className="space-y-3">
                <Badge variant="outline" className="mb-2">
                  {currentModule?.title || "Module"}
                </Badge>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                      style={{ width: `${trackOverview?.progress.percent || 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {Math.round(trackOverview?.progress.percent || 0)}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {trackOverview?.progress.completed_lessons} / {trackOverview?.progress.total_lessons} Lessons
                </p>
              </div>
            </div>

            {/* Lessons List */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {allLessons.map((lesson, index) => {
                  const isActive = lesson.slug === lessonSlug;
                  const isLocked = lesson.state === "locked";
                  const isLessonCompleted = lesson.state === "completed";

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        if (!isLocked && trackSlug) {
                          const lessonModuleSlug = findModuleSlugForLesson(lesson.slug);
                          if (lessonModuleSlug) {
                            navigate(`/student/classes/${trackSlug}/${lessonModuleSlug}/${lesson.slug}`);
                          }
                        } else if (isLocked) {
                          toast.error("Lesson ini masih terkunci");
                        }
                      }}
                      disabled={isLocked}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-all",
                        "hover:bg-accent/70",
                        isActive && "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200 dark:border-blue-800",
                        isLocked && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {isLocked ? (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          ) : isLessonCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className={cn(
                              "h-5 w-5",
                              isActive ? "fill-blue-500 text-blue-500" : "text-muted-foreground"
                            )} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-muted-foreground">
                              {String(lesson.order ?? index + 1).padStart(2, "0")}
                            </span>
                          </div>
                          <h3 className={cn(
                            "text-sm font-medium line-clamp-2",
                            isActive && "text-blue-600 dark:text-blue-400 font-semibold"
                          )}>
                            {lesson.title}
                          </h3>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!previousLesson}
            className="min-w-32"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Sebelumnya
          </Button>

          <div className="flex items-center gap-3">
            {/* Only show "Tandai Selesai" button when there are NO lesson challenges */}
            {!hasLessonChallenges && !isCompleted && canMarkComplete && (
              <Button
                onClick={handleComplete}
                disabled={completing}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                {completing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Tandai Selesai
                  </>
                )}
              </Button>
            )}
            {isCompleted && (
              <Badge variant="default" className="px-4 py-2 bg-green-600">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Selesai
              </Badge>
            )}
          </div>

          <Button
            onClick={handleNext}
            disabled={!nextLesson || nextLesson.state === "locked"}
            className="min-w-32 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function LessonsPage() {
  // Route pattern: /student/classes/:slug/:moduleSlug/:lessonSlug?
  // :slug = track slug, :moduleSlug = module slug, :lessonSlug = lesson slug
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
        <p className="text-muted-foreground">Tidak dapat membuka lesson. Silakan akses melalui halaman track.</p>
      </div>
    );
  }

  return (
    <TrackProvider trackSlug={trackSlug}>
      <LessonDetailContent lessonSlug={lessonSlug} bypassLockCheck={bypassLockCheck} />
    </TrackProvider>
  );
}
