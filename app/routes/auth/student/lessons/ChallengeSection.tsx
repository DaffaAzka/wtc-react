import { useState } from "react";
import { toast } from "sonner";
import type { Challenge } from "@/types/model";
import { useMySubmissions, useSubmitChallenge } from "@/hooks/submission";
import { useTrackContext } from "@/contexts/track-context";
import { ChallengeDetails } from "@/features/auth/challenges/challenge-details";
import { SubmissionForm } from "@/features/auth/challenges/submission-form";
import { SubmissionHistory } from "@/features/auth/challenges/submission-history";
import { Target } from "lucide-react";

// Each submission form hands back a string. multiple_choice sends a bare key
// ("B") and essay sends raw text; everything else already sends JSON — including
// a legacy multiple_choice challenge with >1 question, which renders QuizGroupForm.
const toSubmittedContent = (type: string, raw: string) => {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // not JSON — fall through to the per-type wrapping below
  }
  if (type === "multiple_choice") return { answers: [raw] };
  return { text: raw };
};

interface ChallengeSectionProps {
  challenge: Challenge;
  index: number;
  total: number;
}

export function ChallengeSection({ challenge, index, total }: ChallengeSectionProps) {
  const { data: submissions = [] } = useMySubmissions(challenge.id);
  const { mutate: submitChallenge, isPending: isSubmitting } = useSubmitChallenge();
  const { refreshTrackOverview } = useTrackContext();

  // Bumped on every successful submit so the form remounts with empty answers.
  // The submissions refetch is async, so keying off submissionCount alone left a
  // window where the old answers were still on screen and re-submittable.
  const [formResetKey, setFormResetKey] = useState(0);

  const submissionCount = submissions.length;
  const allowedAttempts = challenge.allowed_attempts || 0;
  const remainingAttempts = allowedAttempts > 0 ? allowedAttempts - submissionCount : Infinity;
  const canSubmitChallenge = remainingAttempts > 0 || allowedAttempts === 0;

  const handleChallengeSubmit = (file: File | null, content: string) => {
    if (isSubmitting) return;

    submitChallenge(
      {
        challengeId: challenge.id,
        request: {
          file: file || undefined,
          submitted_content: toSubmittedContent(challenge.type, content),
        },
      },
      {
        onSuccess: (submission) => {
          // Clear the answers before anything else so a second click cannot
          // resend the same content.
          setFormResetKey((k) => k + 1);

          const score = submission.score;
          toast.success(
            score !== null && score !== undefined
              ? `Challenge ${index + 1} terkirim: ${score}/${challenge.max_score} poin`
              : `Challenge ${index + 1} terkirim, menunggu penilaian`,
          );
          // Passing a challenge can unlock the next lesson — refresh so the
          // sidebar and bottom nav pick that up without a page reload.
          refreshTrackOverview();
          document
            .getElementById(`submission-history-${challenge.id}`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        },
        onError: (error) => {
          toast.error(`Gagal submit challenge ${index + 1}`, {
            description: error.message || "Terjadi kesalahan saat submit",
          });
        },
      }
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215] shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] px-6 py-4">
        <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
          <Target className="h-4 w-4 text-[#1c81ff]" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
            Challenge {index + 1} dari {total}
          </p>
          <h3 className="text-[14px] font-extrabold text-gray-900 dark:text-white" style={{ letterSpacing: "-0.01em" }}>
            {challenge.title}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        <ChallengeDetails
          challenge={challenge}
          submissionCount={submissionCount}
          remainingAttempts={remainingAttempts}
        />

        <div id={`submission-history-${challenge.id}`}>
          <SubmissionHistory submissions={submissions} maxScore={challenge.max_score} />
        </div>

        <SubmissionForm
          key={`${challenge.id}-${formResetKey}`}
          challenge={challenge}
          canSubmit={canSubmitChallenge}
          isSubmitting={isSubmitting}
          onSubmit={handleChallengeSubmit}
        />
      </div>
    </div>
  );
}
