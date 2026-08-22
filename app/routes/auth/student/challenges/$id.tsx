import { useParams, Link } from "react-router";
import { useGetChallenge } from "@/hooks/challenges";
import { useSubmitChallenge, useMySubmissions } from "@/hooks/submission";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { ChallengeDetails } from "@/features/auth/challenges/challenge-details";
import { SubmissionHistory } from "@/features/auth/challenges/submission-history";
import { SubmissionForm } from "@/features/auth/challenges/submission-form";

export default function ChallengeDetailPage() {
  // Get challenge ID from URL params
  const { id } = useParams<{ id: string }>();
  const challengeId = Number(id);

  // Hooks for data fetching
  const { challenge, loading, error } = useGetChallenge(challengeId);
  const { data: submissions = [], isLoading: submissionsLoading } = useMySubmissions(challengeId);
  const { mutate: submitChallenge, isPending: isSubmitting } = useSubmitChallenge();

  // Submit handler for SubmissionForm component
  const handleSubmitChallenge = (file: File | null, content: string) => {
    submitChallenge({
      challengeId,
      request: {
        file: file || undefined,
        content: content || undefined,
      },
    });
  };

  // Calculate remaining attempts
  const submissionCount = submissions.length;
  const allowedAttempts = challenge?.allowed_attempts || 0;
  const remainingAttempts = allowedAttempts > 0 ? allowedAttempts - submissionCount : Infinity;
  const canSubmit = remainingAttempts > 0 || allowedAttempts === 0;

  // Loading state
  if (loading || submissionsLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Error state
  if (error || !challenge) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || "Challenge not found"}
          </AlertDescription>
        </Alert>
        <Button variant="ghost" className="mt-4" asChild>
          <Link to="/student/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link to="/student/dashboard">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Dashboard
        </Link>
      </Button>

      {/* Challenge Details */}
      <ChallengeDetails
        challenge={challenge}
        submissionCount={submissionCount}
        remainingAttempts={remainingAttempts}
      />

      {/* Previous Submissions */}
      <SubmissionHistory
        submissions={submissions}
        maxScore={challenge.max_score}
      />

      {/* Submission Form */}
      <SubmissionForm
        challenge={challenge}
        canSubmit={canSubmit}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitChallenge}
      />
    </div>
  );
}
