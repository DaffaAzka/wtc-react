import { toast } from "sonner";
import type { Challenge } from "@/types/model";
import { useMySubmissions, useSubmitChallenge } from "@/hooks/submission";
import { ChallengeDetails } from "@/features/auth/challenges/challenge-details";
import { SubmissionForm } from "@/features/auth/challenges/submission-form";
import { SubmissionHistory } from "@/features/auth/challenges/submission-history";
import { Target } from "lucide-react";

interface ChallengeSectionProps {
  challenge: Challenge;
  index: number;
  total: number;
}

export function ChallengeSection({ challenge, index, total }: ChallengeSectionProps) {
  const { data: submissions = [] } = useMySubmissions(challenge.id);
  const { mutate: submitChallenge, isPending: isSubmitting } = useSubmitChallenge();

  const submissionCount = submissions.length;
  const allowedAttempts = challenge.allowed_attempts || 0;
  const remainingAttempts = allowedAttempts > 0 ? allowedAttempts - submissionCount : Infinity;
  const canSubmitChallenge = remainingAttempts > 0 || allowedAttempts === 0;

  const handleChallengeSubmit = (file: File | null, content: string) => {
    submitChallenge(
      {
        challengeId: challenge.id,
        request: { file: file || undefined, content: content || undefined },
      },
      {
        onSuccess: () => {
          toast.success(`Challenge ${index + 1} berhasil dikumpulkan! 🎉`);
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

        <SubmissionHistory submissions={submissions} maxScore={challenge.max_score} />

        <SubmissionForm
          challenge={challenge}
          canSubmit={canSubmitChallenge}
          isSubmitting={isSubmitting}
          onSubmit={handleChallengeSubmit}
        />
      </div>
    </div>
  );
}
