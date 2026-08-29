import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useGetSubmission,
  useUpdateSubmission,
  useGetSubmissionFile,
} from "@/hooks/submission";
import {
  Download,
  Calendar,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import type { UpdateSubmissionRequest } from "@/services/submission";

interface GradingModalProps {
  submissionId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  submitted: { bg: "bg-[#f6b60b]/10", text: "text-[#f6b60b]", dot: "bg-[#f6b60b]" },
  graded:    { bg: "bg-[#00E676]/10", text: "text-[#00E676]", dot: "bg-[#00E676]" },
  returned:  { bg: "bg-[#1c81ff]/10", text: "text-[#1c81ff]", dot: "bg-[#1c81ff]" },
  draft:     { bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-500 dark:text-gray-400", dot: "bg-gray-400" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

export default function GradingModal({
  submissionId,
  isOpen,
  onOpenChange,
}: GradingModalProps) {
  const { data, isLoading, error } = useGetSubmission(submissionId || 0);
  const updateSubmission = useUpdateSubmission();
  const getFile = useGetSubmissionFile();

  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [status, setStatus] = useState<string>("submitted");
  const [scoreError, setScoreError] = useState<string>("");

  useEffect(() => {
    if (data) {
      setScore(data.score?.toString() || "");
      setFeedback(data.feedback || "");
      setStatus(data.status || "submitted");
      setScoreError("");
    }
  }, [data]);

  const handleDownloadFile = () => {
    if (submissionId) getFile.mutate(submissionId);
  };

  const validateScore = (value: string): boolean => {
    if (!value) { setScoreError("Score is required"); return false; }
    const numValue = parseFloat(value);
    if (isNaN(numValue)) { setScoreError("Score must be a number"); return false; }
    const maxScore = data?.challenge?.max_score || 100;
    if (numValue < 0 || numValue > maxScore) {
      setScoreError(`Score must be between 0 and ${maxScore}`);
      return false;
    }
    setScoreError("");
    return true;
  };

  const handleSubmit = () => {
    if (!submissionId || !data) return;
    if (!validateScore(score)) return;
    const request: UpdateSubmissionRequest = {
      score: parseFloat(score),
      feedback: feedback.trim() || undefined,
      status: status as "draft" | "submitted" | "graded" | "returned",
    };
    updateSubmission.mutate({ submissionId, request }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  if (!isOpen || !submissionId) return null;

  const submission = data && "submission" in data && data.submission ? data.submission : data;
  const profile = submission?.profile;
  const challenge = submission?.challenge;
  const submissionContent = typeof submission?.content === "string" ? submission.content : "";
  const submissionStatus = submission?.status ?? "submitted";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle
            className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white"
            style={{ letterSpacing: "-0.02em" }}
          >
            Grade Submission
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="h-8 w-8 animate-spin text-[#1c81ff]" />
            <p className="text-[14px] text-gray-500 dark:text-gray-400">Loading submission…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-[14px] text-red-600 dark:text-red-400">Failed to load submission.</p>
          </div>
        ) : submission ? (
          <div className="space-y-5">
            {/* Student info */}
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4">
              <Avatar className="h-10 w-10 ring-1 ring-gray-200 dark:ring-white/10">
                <AvatarImage
                  src={typeof profile?.avatar === "string" ? profile.avatar : profile?.avatar?.url || undefined}
                  alt={profile?.display_name || "Student"}
                />
                <AvatarFallback className="text-sm font-bold bg-[#1c81ff]/10 text-[#1c81ff]">
                  {profile?.display_name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[14px] text-gray-900 dark:text-white">
                  {profile?.display_name || "Unknown Student"}
                </h3>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate">{profile?.email}</p>
              </div>
              <StatusBadge status={submissionStatus} />
            </div>

            {/* Challenge info */}
            <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 space-y-1">
              <p className="font-bold text-[14px] text-gray-900 dark:text-white">{challenge?.title}</p>
              <p className="text-[12px] text-gray-500 dark:text-gray-400">
                {challenge?.type?.replace(/_/g, " ")} · Max {challenge?.max_score} pts
              </p>
            </div>

            {/* Submission details */}
            <div className="space-y-3">
              {submission.submitted_at && (
                <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  Submitted: {format(new Date(submission.submitted_at), "PPp")}
                </div>
              )}
              {submission.file_path && (
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3">
                  <FileText className="h-4 w-4 text-[#1c81ff] shrink-0" />
                  <span className="text-[13px] flex-1 truncate text-gray-700 dark:text-gray-300">
                    {submission.file_path.split("/").pop()}
                  </span>
                  <button
                    onClick={handleDownloadFile}
                    disabled={getFile.isPending}
                    className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              )}
              {submissionContent && (
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
                    Submitted Content
                  </label>
                  <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 text-[13px] text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto font-mono">
                    {submissionContent}
                  </div>
                </div>
              )}
            </div>

            {/* Grading form */}
            <div className="space-y-4 border-t border-gray-100 dark:border-white/5 pt-5">
              {/* Score */}
              <div className="space-y-1.5">
                <label htmlFor="grade-score" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
                  Score <span className="text-red-500">*</span>
                  <span className="ml-1 font-normal text-gray-400 dark:text-gray-600">(max {challenge?.max_score || 100})</span>
                </label>
                <input
                  id="grade-score"
                  type="number"
                  step="0.1"
                  min="0"
                  max={challenge?.max_score || 100}
                  value={score}
                  onChange={(e) => { setScore(e.target.value); setScoreError(""); }}
                  placeholder={`0 – ${challenge?.max_score || 100}`}
                  className={`w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border px-4 py-3 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-1 outline-none transition-all ${
                    scoreError
                      ? "border-red-400 dark:border-red-500/60 focus:border-red-400 focus:ring-red-400"
                      : "border-slate-200 dark:border-gray-800 focus:border-[#1c81ff] focus:ring-[#1c81ff]"
                  }`}
                />
                {scoreError && <p className="text-[12px] text-red-500">{scoreError}</p>}
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label htmlFor="grade-status" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="grade-status"
                    className="rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="graded">Graded</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Feedback */}
              <div className="space-y-1.5">
                <label htmlFor="grade-feedback" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
                  Feedback <span className="font-normal text-gray-400 dark:text-gray-600">(optional)</span>
                </label>
                <textarea
                  id="grade-feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter feedback for the student…"
                  rows={4}
                  className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-3 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl py-2.5 px-5 text-[14px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!submission || updateSubmission.isPending || isLoading}
            className="flex items-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-2.5 px-5 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[14px]"
          >
            {updateSubmission.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
            ) : (
              <><CheckCircle2 className="h-4 w-4" />Save Grade</>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
