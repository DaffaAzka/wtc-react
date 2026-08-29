import { useParams, useNavigate } from "react-router";
import { useGetChallenge } from "@/hooks/challenges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Pencil,
  FileText,
  CheckCircle2,
  Circle,
  AlignLeft,
} from "lucide-react";
import { ChallengeDetails } from "@/features/auth/challenges/challenge-details";
import ErrorState from "@/components/custom/error-state";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";

function getDifficultyVariant(difficulty?: string) {
  if (difficulty === "easy") return "default";
  if (difficulty === "medium") return "secondary";
  if (difficulty === "hard") return "destructive";
  return "outline";
}

export default function AdminChallengeViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const challengeId = Number(id);

  const { challenge, loading, error } = useGetChallenge(challengeId);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <ErrorState
        title="Unable to load challenge"
        message={error?.message || "Challenge not found"}
        onRetry={() => navigate(-1)}
      />
    );
  }

  const questions: any[] = (challenge.metadata as any)?.questions ?? [];

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-1 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{challenge.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              /{challenge.slug}
            </span>
            {challenge.difficulty && (
              <Badge
                variant={getDifficultyVariant(challenge.difficulty)}
                className="text-xs capitalize">
                {challenge.difficulty}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {challenge.type.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/submissions/${challenge.id}`)}>
            <FileText className="h-4 w-4 mr-1.5" />
            Submissions
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`/admin/challenges/${challenge.id}/edit`)}>
            <Pencil className="h-4 w-4 mr-1.5" />
            Edit
          </Button>
        </div>
      </div>

      {/* Challenge Details - matches student view */}
      <ChallengeDetails
        challenge={challenge}
        submissionCount={0}
        remainingAttempts={Infinity}
      />

      {/* Questions (read-only) */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlignLeft className="h-4 w-4" />
              Questions
              <Badge variant="secondary" className="ml-1">
                {questions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question: any, index: number) => (
              <div key={index} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium leading-relaxed">
                      {question.question || question.text || "No question text"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {question.type || "unknown"}
                    </Badge>
                    {question.score !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {question.score} pts
                      </span>
                    )}
                  </div>
                </div>

                {/* MCQ options */}
                {question.options && Array.isArray(question.options) && (
                  <div className="ml-9 space-y-1.5">
                    {question.options.map((option: any, optIdx: number) => {
                      const text =
                        typeof option === "string" ? option
                        : option.text || option.value || "";
                      const isCorrect =
                        typeof option === "object" &&
                        (option.is_correct || option.isCorrect);
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                            isCorrect
                              ? "bg-green-500/10 text-green-700 dark:text-green-400"
                              : "bg-muted/50 text-muted-foreground"
                          }`}>
                          {isCorrect ?
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
                          : <Circle className="h-3.5 w-3.5 shrink-0" />}
                          <span>{text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Essay / explanation */}
                {question.explanation && (
                  <div className="ml-9 rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    <span className="font-medium">Explanation: </span>
                    {question.explanation}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Scoring summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scoring & Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Max Score</p>
              <p className="font-semibold">{challenge.max_score}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Min Score</p>
              <p className="font-semibold">
                {(challenge.settings as any)?.minimum_score ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Points (EXP)</p>
              <p className="font-semibold">{challenge.points ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Allowed Attempts
              </p>
              <p className="font-semibold">
                {challenge.allowed_attempts === null ||
                challenge.allowed_attempts === -1 ?
                  "Unlimited"
                : challenge.allowed_attempts}
              </p>
            </div>
          </div>

          {questions.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total Questions</p>
                  <p className="font-semibold">{questions.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">MCQ</p>
                  <p className="font-semibold">
                    {
                      questions.filter(
                        (q) => q.type === "multiple_choice",
                      ).length
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Essay</p>
                  <p className="font-semibold">
                    {questions.filter((q) => q.type === "essay").length}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
