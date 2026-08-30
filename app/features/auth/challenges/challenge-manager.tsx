import { useState } from "react";
import { Link } from "react-router";
import { Plus, Code, ArrowLeft } from "lucide-react";
import {
  useGetChallengesByLesson,
  useGetChallengesByModule,
} from "@/hooks/challenges";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import { ChallengeGridSkeleton } from "@/components/skeletons/challenge-card";
import ChallengeModal from "./modal-add";
import CodingAssignmentModal from "./modal-add-coding-assignment";
import GenerateChallengeModal from "./modal-generate-challenge";
import ChallengeList from "./challenge-list";
import ChallengeEmpty from "./challenge-empty";
import type { GeneratedChallenge } from "@/services/ai";

export type ChallengeContext = {
  type: "lesson" | "module";
  id: number;
  slug: string;
  title: string;
  parentInfo?: { title: string; type: string };
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
  const [isAddCodingAssignmentOpen, setIsAddCodingAssignmentOpen] =
    useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<
    GeneratedChallenge | undefined
  >(undefined);

  const lessonChallenges = useGetChallengesByLesson(
    context.type === "lesson" ? context.id : 0,
  );
  const moduleChallenges = useGetChallengesByModule(
    context.type === "module" ? context.slug : "",
  );

  const { challenges, loading: challengesLoading } =
    context.type === "lesson" ? lessonChallenges : moduleChallenges;

  if (challengesLoading) {
    return (
      <>
        <PageHeaderSkeleton />
        <ChallengeGridSkeleton />
      </>
    );
  }

  const safeChallenges = challenges || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        {/* Back link */}
        <Link
          to={backUrl}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>

        {/* Title + actions */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
              Challenges
            </p>
            <h1
              className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
              style={{ letterSpacing: "-0.02em" }}>
              {context.title}
            </h1>
            <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
              {safeChallenges.length}{" "}
              {safeChallenges.length === 1 ? "challenge" : "challenges"} in this{" "}
              {context.type}
              {context.parentInfo && (
                <>
                  {" "}
                  ·{" "}
                  <span className="text-gray-900 dark:text-white font-bold">
                    {context.parentInfo.title}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 mt-1">
            <button
              onClick={() => setIsAddCodingAssignmentOpen(true)}
              className="flex items-center gap-2 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl py-2.5 px-4 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Coding Assignment</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-2.5 px-4 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 text-[13px]">
              <Plus className="h-4 w-4" />
              Add Challenge
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {safeChallenges.length === 0 ? (
        <ChallengeEmpty
          onAddClick={() => setIsAddModalOpen(true)}
          contextType={context.type}
        />
      ) : (
        <ChallengeList challenges={safeChallenges} context={context} />
      )}

      {/* Modals */}
      {isAddModalOpen && (
        <ChallengeModal
          context={context}
          isOpen={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
        />
      )}
      {isAddCodingAssignmentOpen && (
        <CodingAssignmentModal
          context={context}
          isOpen={isAddCodingAssignmentOpen}
          onOpenChange={setIsAddCodingAssignmentOpen}
        />
      )}

      {/* Generate Challenge with AI Modal */}
      <GenerateChallengeModal
        context={context}
        isOpen={isGenerateModalOpen}
        onOpenChange={setIsGenerateModalOpen}
        onGenerated={(data) => {
          setPrefillData(data);
          setIsGenerateModalOpen(false);
          setTimeout(() => setIsAddModalOpen(true), 50);
        }}
      />
    </div>
  );
}
