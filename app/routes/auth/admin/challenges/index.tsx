import { useGetModules } from "@/hooks/modules";
import { useGetLesson } from "@/hooks/lessons";
import type { Route } from "./+types/index";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import { ChallengeGridSkeleton } from "@/components/skeletons/challenge-card";
import ErrorState from "@/components/custom/error-state";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import ChallengeManager from "@/features/auth/challenges/challenge-manager";

export default function ChallengePage({ params }: Route.ComponentProps) {
  const {
    lesson,
    loading: lessonLoading,
    error: lessonError,
    refresh: refreshLesson,
  } = useGetLesson(params.lessonSlug);

  // Fetch all modules (track context endpoint also returns 404, so just use this)
  const {
    modules,
    loading: moduleLoading,
    error: moduleError,
    refresh: refreshModule,
  } = useGetModules();

  const module = lesson ? modules.find((m) => m.id === lesson.module_id) : undefined;

  const loading = moduleLoading || lessonLoading;
  const error = moduleError || lessonError;

  if (loading) {
    return (
      <>
        <PageHeaderSkeleton />
        <ChallengeGridSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="mb-6">
          <Link to="..">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lessons
            </Button>
          </Link>
        </div>
        <ErrorState
          title="Unable to load lesson"
          message={
            error.message || "An error occurred while loading the lesson data."
          }
          onRetry={() => {
            refreshModule();
            refreshLesson();
          }}
        />
      </>
    );
  }

  if (!lesson) {
    return (
      <>
        <div className="mb-6">
          <Link to="..">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lessons
            </Button>
          </Link>
        </div>
        <ErrorState
          title="Lesson not found"
          message="The requested lesson could not be found."
        />
      </>
    );
  }

  // Log for debugging if module not found (backend filtering issue)
  if (!module) {
    console.warn('Module not found for lesson - Backend filtering issue:', {
      lesson_id: lesson.id,
      lesson_slug: lesson.slug,
      lesson_module_id: lesson.module_id,
      available_modules: modules.map(m => ({ id: m.id, slug: m.slug, title: m.title })),
      track_slug: params.slug || 'none (direct access)',
    });
  }

  // Always render ChallengeManager (module context not critical for managing challenges)
  return (
    <ChallengeManager
      context={{
        type: "lesson",
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        ...(module && {
          parentInfo: {
            title: module.title,
            type: "Module",
          },
        }),
      }}
      backUrl=".."
      backLabel="Back to Lessons"
    />
  );
}
