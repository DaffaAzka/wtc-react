import { useState } from "react";
import { toast } from "sonner";
import type { Challenge } from "@/types/model";
import { useMySubmissions, useSubmitChallenge } from "@/hooks/submission";
import { ChallengeDetails } from "@/features/auth/challenges/challenge-details";
import { SubmissionForm } from "@/features/auth/challenges/submission-form";
import { SubmissionHistory } from "@/features/auth/challenges/submission-history";

interface ChallengeSectionProps {
  challenge: Challenge;
  index: number;
  total: number;
}

export function ChallengeSection({ challenge, index, total }: ChallengeSectionProps) {
  // Fetch submissions for this specific challenge
  const { data: submissions = [] } = useMySubmissions(challenge.id);
  const { mutate: submitChallenge, isPending: isSubmitting } = useSubmitChallenge();

  // Calculate remaining attempts for this challenge
  const submissionCount = submissions.length;
  const allowedAttempts = challenge.allowed_attempts || 0;
  const remainingAttempts = allowedAttempts > 0 ? allowedAttempts - submissionCount : Infinity;
  const canSubmitChallenge = remainingAttempts > 0 || allowedAttempts === 0;

  // Challenge submission handler
  const handleChallengeSubmit = (file: File | null, content: string) => {
    submitChallenge({
      challengeId: challenge.id,
      request: {
        file: file || undefined,
        content: content || undefined
      }
    }, {
      onSuccess: () => {
        toast.success(`Challenge ${index + 1} berhasil dikumpulkan! 🎉`);
        // Note: Lesson completion might be automatic after all challenges are graded
      },
      onError: (error) => {
        toast.error(`Gagal submit challenge ${index + 1}`, {
          description: error.message || "Terjadi kesalahan saat submit"
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Challenge Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Challenge {index + 1} dari {total}
          </h2>
          <p className="text-sm text-muted-foreground">
            {challenge.title}
          </p>
        </div>
      </div>

      {/* Challenge Details */}
      <ChallengeDetails
        challenge={challenge}
        submissionCount={submissionCount}
        remainingAttempts={remainingAttempts}
      />

      {/* Submission History */}
      <SubmissionHistory
        submissions={submissions}
        maxScore={challenge.max_score}
      />

      {/* Submission Form */}
      <SubmissionForm
        challenge={challenge}
        canSubmit={canSubmitChallenge}
        isSubmitting={isSubmitting}
        onSubmit={handleChallengeSubmit}
      />
    </div>
  );
}
