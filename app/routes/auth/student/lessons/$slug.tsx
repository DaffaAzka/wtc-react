import { useGetLessons } from "@/hooks/lessons";
import { useGetModule } from "@/hooks/modules";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
} from "lucide-react";
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

  if (!slug || !moduleSlug)
    return (
      <p>Cannot open the lessons because track or module is not specified.</p>
    );

  const { module, loading, error } = useGetModule(moduleSlug);
  const {
    lessons,
    loading: lessonsLoading,
    error: lessonsError,
  } = useGetLessons(module ? { module_id: module.id.toString() } : undefined);

  if (loading || lessonsLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8">Error: {error.message}</div>;
  if (!module) return <div className="p-8">Module not found.</div>;

  if (lessons.length === 0)
    return <div className="p-8">No lessons found for this module.</div>;

  // Sort lessons by order
  const sortedLessons = [...lessons].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  // Find current lesson
  const currentLesson =
    lessonSlug ?
      sortedLessons.find((l) => l.slug === lessonSlug)
    : sortedLessons[0];

  if (!currentLesson) return <div className="p-8">Lesson not found.</div>;

  // Find current lesson index and adjacent lessons
  const currentIndex = sortedLessons.findIndex(
    (l) => l.id === currentLesson.id,
  );
  const previousLesson =
    currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < sortedLessons.length - 1 ?
      sortedLessons[currentIndex + 1]
    : null;

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
      navigate(`/student/classes/${slug}/${moduleSlug}/${nextLesson.slug}`);
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
                <iframe
                  src={currentLesson.video_url}
                  title={currentLesson.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            <ContentView rawJsonData={currentLesson.content} />
          </div>
        </div>

        {/* Right Sidebar - Sticky */}
        <div className="hidden lg:flex lg:w-80 xl:w-96 border-l bg-muted/30">
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
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-colors",
                        "hover:bg-accent/50",
                        isActive && "bg-accent",
                      )}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {isCompleted ?
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          : <Circle
                              className={cn(
                                "h-5 w-5",
                                isActive ?
                                  "fill-white"
                                : "text-muted-foreground",
                              )}
                            />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-muted-foreground">
                              {String(lesson.order ?? index + 1).padStart(
                                2,
                                "0",
                              )}
                            </span>
                          </div>
                          <h3
                            className={cn(
                              "text-sm font-medium line-clamp-2",
                              isActive ? "text-white" : "text-foreground",
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

      {/* Bottom Navigation Bar - Sticky */}
      <div className="sticky bottom-0 z-10 bg-background border-t px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!previousLesson}
            className="min-w-32">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Sebelumnya
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {sortedLessons.length}
          </span>

          <Button
            onClick={handleNext}
            disabled={!nextLesson}
            className="min-w-32">
            Selanjutnya
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
