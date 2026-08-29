import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Plus, Code } from "lucide-react";
import { useGetChallengesByLesson, useGetChallengesByModule } from "@/hooks/challenges";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import { ChallengeGridSkeleton } from "@/components/skeletons/challenge-card";
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
      <div className="space-y-3">
        {/* Breadcrumb - Proper Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {/* Root: Modules */}
          {/* <Link to="/modules" className="hover:text-foreground transition-colors">
            Modules
          </Link> */}

          {/* Parent Module (if exists) */}
          {context.parentInfo && (
            <>
              <span>•</span>
              <Link
                to={`/modules/${context.parentInfo.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="hover:text-foreground transition-colors"
              >
                {context.parentInfo.title}
              </Link>
            </>
          )}

          {/* Current Context (Lesson/Module) */}
          {/* {context.type === "module" ? (
            <>
              <span>•</span>
              <Link to={backUrl} className="hover:text-foreground transition-colors">
                {context.title}
              </Link>
            </>
          ) : (
            <>
              <span>•</span>
              <Link to={backUrl} className="hover:text-foreground transition-colors">
                {context.title}
              </Link>
            </>
          )} */}

          {/* Current Page */}
          {/* <span>•</span> */}
          {/* <span className="text-foreground">Challenges</span> */}
        </div>

        {/* Title & Actions - Bold Title + Normal Context */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold">Challenges</h1>
            <span className="text-lg text-muted-foreground font-normal">
              in {context.title}
            </span>
            <span className="text-sm text-muted-foreground">
              • {safeChallenges.length} {safeChallenges.length === 1 ? "challenge" : "challenges"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Challenge
            </Button>
            <Button
              onClick={() => setIsAddCodingAssignmentOpen(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Code className="h-4 w-4" />
              Coding Assignment
            </Button>
          </div>
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
