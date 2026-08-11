import { useGetModule } from "@/hooks/modules";
import { useGetLesson } from "@/hooks/lessons";
import { useGetChallengesByLesson } from "@/hooks/challenges";
import type { Route } from "./+types/index";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import { ChallengeGridSkeleton } from "@/components/skeletons/challenge-card";
import ErrorState from "@/components/custom/error-state";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import ChallengeModal from "@/features/auth/challenges/modal-add";
import ChallengeList from "@/features/auth/challenges/challenge-list";
import ChallengeEmpty from "@/features/auth/challenges/challenge-empty";

export default function ChallengePage({ params }: Route.ComponentProps) {
  const { module, loading: moduleLoading, error: moduleError, refresh: refreshModule } = useGetModule(params.moduleSlug);
  const { lesson, loading: lessonLoading, error: lessonError, refresh: refreshLesson } = useGetLesson(params.lessonSlug);
  const { 
    challenges, 
    loading: challengesLoading, 
    error: challengesError, 
    refresh: refreshChallenges 
  } = useGetChallengesByLesson(lesson?.id ?? 0);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loading = moduleLoading || lessonLoading;
  const error = moduleError || lessonError;

  // Loading state for module and lesson
  if (loading) {
    return (
      <>
        <PageHeaderSkeleton />
        <ChallengeGridSkeleton />
      </>
    );
  }

  // Error state for module or lesson
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
          message={error.message || "An error occurred while loading the lesson data."}
          onRetry={() => {
            refreshModule();
            refreshLesson();
          }}
        />
      </>
    );
  }

  // Not found states
  if (!module) {
    return (
      <>
        <div className="mb-6">
          <Link to="../..">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Modules
            </Button>
          </Link>
        </div>
        <ErrorState
          title="Module not found"
          message="The requested module could not be found."
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="..">
              <Button variant="ghost" size="icon" aria-label="Back to lessons">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
              <p className="text-muted-foreground text-sm">
                Module: <span className="font-medium">{module.title}</span>
              </p>
              <p className="text-muted-foreground text-sm">
                Lesson: <span className="font-medium">{lesson.title}</span>
              </p>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Challenge
        </Button>
      </div>

      {/* Challenges List */}
      {challengesLoading ? (
        <ChallengeGridSkeleton />
      ) : challengesError ? (
        <ErrorState
          title="Unable to load challenges"
          message={challengesError.message || "An error occurred while loading challenges for this lesson."}
          onRetry={refreshChallenges}
        />
      ) : challenges.length === 0 ? (
        <ChallengeEmpty onAddClick={() => setIsAddModalOpen(true)} />
      ) : (
        <ChallengeList challenges={challenges} lesson={lesson} />
      )}

      {/* Add Challenge Modal */}
      {isAddModalOpen && (
        <ChallengeModal
          lesson={lesson}
          isOpen={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
        />
      )}
    </div>
  );
}
