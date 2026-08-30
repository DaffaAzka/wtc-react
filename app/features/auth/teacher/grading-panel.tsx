import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGradeSubmission } from "@/hooks/teacher";
import type {
  TeacherSubmission,
  GradeSubmissionRequest,
} from "@/types/teacher";
import { CheckCircle2, Loader2 } from "lucide-react";

interface GradingPanelProps {
  submission: TeacherSubmission;
}

export function GradingPanel({ submission }: GradingPanelProps) {
  const { mutate, isPending, error } = useGradeSubmission();

  const maxScore = submission.challenge.max_score;

  const [score, setScore] = useState<string>(
    submission.score !== null ? String(submission.score) : "",
  );
  const [feedback, setFeedback] = useState<string>(submission.feedback ?? "");
  const [status, setStatus] = useState<GradeSubmissionRequest["status"]>(
    submission.status === "graded" || submission.status === "returned"
      ? submission.status
      : "graded",
  );

  const scoreNum = score === "" ? null : Number(score);
  const scoreInvalid =
    scoreNum !== null &&
    (isNaN(scoreNum) || scoreNum < 0 || scoreNum > maxScore);

  const serverError =
    error?.message ??
    (error?.errors ? Object.values(error.errors).flat().join(" ") : null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (scoreInvalid) return;
    const payload: GradeSubmissionRequest = {
      status,
      feedback: feedback || undefined,
    };
    if (scoreNum !== null) payload.score = scoreNum;
    mutate(
      { id: submission.id, data: payload },
      {
        onSuccess: () => toast.success("Submission graded successfully."),
        onError: (err) =>
          toast.error(err.message ?? "Failed to grade submission."),
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error banner */}
      {serverError && (
        <div className="rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 px-4 py-3">
          <p className="text-[14px] text-red-600 dark:text-red-400">
            {serverError}
          </p>
        </div>
      )}

      {/* Score */}
      <div className="space-y-1.5">
        <label
          htmlFor="manual_score"
          className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
          Score{" "}
          <span className="font-normal text-gray-400 dark:text-gray-600">
            (max {maxScore})
          </span>
        </label>
        <div className="flex items-center gap-2">
          <input
            id="manual_score"
            type="number"
            min={0}
            max={maxScore}
            step="any"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            aria-invalid={scoreInvalid || undefined}
            placeholder={`0 – ${maxScore}`}
            className="w-28 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-2.5 text-[14px] font-bold text-gray-900 dark:text-white focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
          />
          {score && !scoreInvalid && (
            <span className="text-[13px] text-gray-400 dark:text-gray-600 tabular-nums">
              / {maxScore} = {Math.round((Number(score) / maxScore) * 100)}%
            </span>
          )}
        </div>
        {scoreInvalid && (
          <p className="text-[12px] text-[#ff007b]">
            Score must be between 0 and {maxScore}.
          </p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <label
          htmlFor="grade-status"
          className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
          Status
        </label>
        <Select
          value={status}
          onValueChange={(v) =>
            setStatus(v as GradeSubmissionRequest["status"])
          }>
          <SelectTrigger
            id="grade-status"
            className="rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="graded">Graded</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback */}
      <div className="space-y-1.5">
        <label
          htmlFor="feedback"
          className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
          Feedback{" "}
          <span className="font-normal text-gray-400 dark:text-gray-600">
            (optional)
          </span>
        </label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide feedback for the student…"
          rows={4}
          className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-3 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || scoreInvalid}
        className="w-full flex items-center justify-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-2.5 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[14px]">
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Save Grade
          </>
        )}
      </button>
    </form>
  );
}
