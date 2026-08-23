import { useGetLessons, useLessonCompletion } from "@/hooks/lessons";
import { useGetModule } from "@/hooks/modules";
import { useGetChallengesByModule } from "@/hooks/challenges";
import { useAllMySubmissions } from "@/hooks/submission";
import { getChallengeCompletionStatus } from "@/lib/challenge-completion";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import ContentView from "@/components/custom/content-view";
import { cn } from "@/lib/utils";

export default function LessonsPage() {
  const navigate = useNavigate();
  const { slug, moduleSlug, lessonSlug } = useParams<{
    slug: string;
    moduleSlug: string;
    lessonSlug?: string;
  }>();

  if (!slug || !moduleSlug) return <p>Cannot open the lessons because track or module is not specified.</p>;

  const { module, loading, error } = useGetModule(moduleSlug);
  const { lessons, loading: lessonsLoading, error: lessonsError } = useGetLessons(module ? { module_id: module.id.toString() } : undefined);

  // Lesson completion hook
  const { mutate: completeLesson, isPending: completing } = useLessonCompletion();

  // Fetch challenges for this module
  const { challenges, loading: challengesLoading, error: challengesError } = useGetChallengesByModule(moduleSlug || "");

  // Fetch all user submissions to check challenge completion status
  const { data: allSubmissions = [] } = useAllMySubmissions();

  // DEBUG: Log to console
  console.log('🔍 DEBUG Challenges:', {
    moduleSlug,
    challenges,
    challengesCount: challenges?.length || 0,
    loading: challengesLoading,
    error: challengesError,
  });

  if (loading || lessonsLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8">Error: {error.message}</div>;
  if (!module) return <div className="p-8">Module not found.</div>;

  if (lessons.length === 0) return <div className="p-8">No lessons found for this module.</div>;

  // Sort lessons by order
  const sortedLessons = [...lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Find current lesson
  const currentLesson = lessonSlug ? sortedLessons.find((l) => l.slug === lessonSlug) : sortedLessons[0];

  if (!currentLesson) return <div className="p-8">Lesson not found.</div>;

  // Find current lesson index and adjacent lessons
  const currentIndex = sortedLessons.findIndex((l) => l.id === currentLesson.id);
  const previousLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  // Check if this is the last lesson and there are challenges
  const isLastLesson = !nextLesson;
  const firstChallenge = challenges && challenges.length > 0 ? challenges[0] : null;
  const hasNextTarget = nextLesson || (isLastLesson && firstChallenge);

  const handleLessonClick = (lesson: (typeof sortedLessons)[0]) => {
    navigate(`/student/classes/${slug}/${moduleSlug}/${lesson.slug}`);
  };

  const handlePrevious = () => {
    if (previousLesson) {
      navigate(`/student/classes/${slug}/${moduleSlug}/${previousLesson.slug}`);
    }
  };

  const handleNext = () => {
    if (nextLesson) {
      // Go to next lesson
      navigate(`/student/classes/${slug}/${moduleSlug}/${nextLesson.slug}`);
    } else if (isLastLesson && firstChallenge) {
      // Go to first challenge (last lesson → challenge flow)
      navigate(`/student/challenges/${firstChallenge.id}`);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] overflow-hidden">
      {/* Top Bar - Sticky */}
      {/* <div className="sticky top-0 z-10 bg-background border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/student/classes/${slug}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Kelas
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-lg font-semibold line-clamp-1">
            {currentLesson.title}
          </h1>
        </div>
      </div> */}

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 pb-24">
            {currentLesson.video_url && (
              <div className="mb-6 aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe src={currentLesson.video_url} title={currentLesson.title} className="w-full h-full" allowFullScreen />
              </div>
            )}

            <ContentView rawJsonData={currentLesson.content} />
          </div>
        </div>

        {/* Right Sidebar - Sticky */}
        <div className="hidden lg:flex lg:w-80 xl:w-96 border-l bg-muted/30 h-full">
          <div className="flex flex-col w-full h-full">
            {/* Module Info */}
            <div className="p-6 border-b bg-background">
              <div className="space-y-2">
                <Badge variant="outline" className="mb-2">
                  Modul
                </Badge>
                <h2 className="text-xl font-bold">{module.title}</h2>
                {/* {module.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {module.description}
                  </p>
                )} */}
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-sm font-medium">
                    {currentIndex + 1} / {sortedLessons.length} Pelajaran
                  </span>
                </div>
              </div>
            </div>

            {/* Lessons List - Scrollable */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {sortedLessons.map((lesson, index) => {
                  const isActive = lesson.id === currentLesson.id;
                  const isCompleted = index < currentIndex; // Simple completion logic

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson)}
                      className={cn("w-full text-left p-3 rounded-lg transition-colors", "hover:bg-accent/50", isActive && "bg-accent")}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {isCompleted ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Circle className={cn("h-5 w-5", isActive ? "fill-white" : "text-muted-foreground")} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-muted-foreground">{String(lesson.order ?? index + 1).padStart(2, "0")}</span>
                          </div>
                          <h3 className={cn("text-sm font-medium line-clamp-2", isActive ? "text-white" : "text-foreground")}>{lesson.title}</h3>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Challenges Section */}
              {challenges && challenges.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="px-3 mb-3">
                    <h3 className="text-sm font-semibold text-foreground">Tantangan</h3>
                    <p className="text-xs text-muted-foreground mt-1">Selesaikan tantangan untuk membuka modul berikutnya</p>
                  </div>
                  <div className="space-y-2">
                    {challenges.map((challenge, index) => (
                      <Link
                        key={challenge.id}
                        to={`/student/challenges/${challenge.id}`}
                        className="block"
                      >
                        <button className="w-full text-left p-3 rounded-lg transition-colors hover:bg-accent/50">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {(() => {
                                // Filter submissions for this specific challenge
                                const challengeSubmissions = allSubmissions.filter(
                                  (sub) => sub.challenge_id === challenge.id
                                );

                                // Get completion status
                                const status = getChallengeCompletionStatus(challenge, challengeSubmissions);

                                // Render icon based on status
                                if (status === "passed") {
                                  return <CheckCircle2 className="h-5 w-5 text-green-600" />;
                                } else if (status === "failed") {
                                  return <XCircle className="h-5 w-5 text-red-600" />;
                                } else {
                                  return <Circle className="h-5 w-5 text-muted-foreground" />;
                                }
                              })()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                  {challenge.type.replace(/_/g, " ")}
                                </span>
                              </div>
                              <h3 className="text-sm font-medium text-foreground line-clamp-2">{challenge.title}</h3>
                            </div>
                          </div>
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar - Sticky */}
      <div className="sticky bottom-0 z-10 bg-background border-t px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button variant="outline" onClick={handlePrevious} disabled={!previousLesson} className="min-w-32">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Sebelumnya
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {sortedLessons.length}
            </span>
            {currentLesson && (
              <Button variant="default" size="sm" onClick={() => completeLesson(currentLesson.slug)} disabled={completing}>
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
          </div>

          <Button onClick={handleNext} disabled={!hasNextTarget} className="min-w-32">
            {isLastLesson && firstChallenge ? "Ke Tantangan" : "Selanjutnya"}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
