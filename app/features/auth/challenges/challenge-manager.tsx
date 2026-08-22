import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Code } from "lucide-react";
import { useGetChallengesByLesson, useGetChallengesByModule } from "@/hooks/challenges";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import { ChallengeGridSkeleton } from "@/components/skeletons/challenge-card";
import ErrorState from "@/components/custom/error-state";
import ChallengeModal from "./modal-add";
import CodingAssignmentModal from "./modal-add-coding-assignment";
import ChallengeList from "./challenge-list";
import ChallengeEmpty from "./challenge-empty";

export type ChallengeContext = {
  type: "lesson" | "module";
  id: number;
  slug: string;
  title: string;
  parentInfo?: {
    title: string;
    type: string;
  };
};

type Props = {
  context: ChallengeContext;
  backUrl: string;
  backLabel?: string;
};

export default function ChallengeManager({
  context,
  backUrl,
  backLabel = "Back",
}: Props) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCodingAssignmentOpen, setIsAddCodingAssignmentOpen] = useState(false);

  // Conditional fetching based on context type
  const lessonChallenges = useGetChallengesByLesson(
    context.type === "lesson" ? context.id : 0
  );
  const moduleChallenges = useGetChallengesByModule(
    context.type === "module" ? context.slug : ""
  );

  const {
    challenges,
    loading: challengesLoading,
    error: challengesError,
    refresh: refreshChallenges,
  } =
    context.type === "lesson" ? lessonChallenges : moduleChallenges;

  if (challengesLoading) {
    return (
      <>
        <PageHeaderSkeleton />
        <ChallengeGridSkeleton />
      </>
    );
  }

  // Handle undefined challenges (404 or other errors)
  const safeChallenges = challenges || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to={backUrl}>
              <Button
                variant="ghost"
                size="icon"
                aria-label={backLabel}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
              {context.parentInfo && (
                <p className="text-muted-foreground text-sm">
                  {context.parentInfo.type}:{" "}
                  <span className="font-medium">{context.parentInfo.title}</span>
                </p>
              )}
              <p className="text-muted-foreground text-sm">
                {context.type === "lesson" ? "Lesson" : "Module"}:{" "}
                <span className="font-medium">{context.title}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Challenge
          </Button>
          <Button
            onClick={() => setIsAddCodingAssignmentOpen(true)}
            variant="outline"
          >
            <Code className="h-4 w-4 mr-2" />
            Add Coding Assignment
          </Button>
        </div>
      </div>

      {/* Challenges List */}
      {safeChallenges.length === 0 ? (
        <ChallengeEmpty
          onAddClick={() => setIsAddModalOpen(true)}
          contextType={context.type}
        />
      ) : (
        <ChallengeList challenges={safeChallenges} context={context} />
      )}

      {/* Add Challenge Modal */}
      {isAddModalOpen && (
        <ChallengeModal
          context={context}
          isOpen={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
        />
      )}

      {/* Add Coding Assignment Modal */}
      {isAddCodingAssignmentOpen && (
        <CodingAssignmentModal
          context={context}
          isOpen={isAddCodingAssignmentOpen}
          onOpenChange={setIsAddCodingAssignmentOpen}
        />
      )}
    </div>
  );
}
