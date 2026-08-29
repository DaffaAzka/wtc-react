import { useState } from "react";
import { toast } from "sonner";
import LoadingButton from "@/components/custom/loading-button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGradeSubmission } from "@/hooks/teacher";
import type { TeacherSubmission, GradeSubmissionRequest } from "@/types/teacher";

// ---------------------------------------------------------------------------
// Grading panel — inline form for scoring and status updates
// ---------------------------------------------------------------------------

interface GradingPanelProps {
  submission: TeacherSubmission;
}

export function GradingPanel({ submission }: GradingPanelProps) {
  const { mutate, isPending, error } = useGradeSubmission();

  const [score, setScore] = useState<string>(
    submission.score !== null ? String(submission.score) : ""
  );
  const [feedback, setFeedback] = useState<string>(submission.feedback ?? "");
  const [status, setStatus] = useState<GradeSubmissionRequest["status"]>(
    submission.status === "graded" || submission.status === "returned"
      ? submission.status
      : "graded"
  );

  const maxScore = submission.challenge.max_score;

  const scoreNum = score === "" ? null : Number(score);
  const scoreInvalid =
    scoreNum !== null && (isNaN(scoreNum) || scoreNum < 0 || scoreNum > maxScore);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (scoreInvalid) return;

    const payload: GradeSubmissionRequest = {
      status,
      feedback: feedback || undefined,
    };
    if (scoreNum !== null) {
      payload.score = scoreNum;
    }

    mutate(
      { id: submission.id, data: payload },
      {
        onSuccess: () => {
          toast.success("Submission graded successfully.");
        },
        onError: (err) => {
          toast.error(err.message ?? "Failed to grade submission.");
        },
      }
    );
  }

  const serverError =
    error?.message ??
    (error?.errors ? Object.values(error.errors).flat().join(" ") : null);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Score */}
      <div className="space-y-1.5">
        <Label htmlFor="manual_score">
          Score{" "}
          <span className="font-normal text-muted-foreground">
            (max {maxScore})
          </span>
        </Label>
        <Input
          id="manual_score"
          type="number"
          min={0}
          max={maxScore}
          step="any"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          aria-invalid={scoreInvalid || undefined}
          placeholder={`0 – ${maxScore}`}
          className="w-32"
        />
        {scoreInvalid && (
          <p className="text-xs text-destructive">
            Score must be between 0 and {maxScore}.
          </p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label htmlFor="grade-status">Status</Label>
        <Select
          value={status}
          onValueChange={(v) =>
            setStatus(v as GradeSubmissionRequest["status"])
          }
        >
          <SelectTrigger id="grade-status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="graded">Graded</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback */}
      <div className="space-y-1.5">
        <Label htmlFor="feedback">Feedback</Label>
        <Textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Optional feedback for the student…"
          rows={4}
        />
      </div>

      <LoadingButton
        text="Save Grade"
        loading={isPending}
        disabled={scoreInvalid}
      />
    </form>
  );
}
