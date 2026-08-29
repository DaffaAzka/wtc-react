import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import type { Submission } from "@/types/submission";

interface SubmissionHistoryProps {
  submissions: Submission[];
  maxScore: number;
}

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string; icon: typeof Clock }> = {
  submitted: { bg: "bg-[#f6b60b]/10",  text: "text-[#f6b60b]",  dot: "bg-[#f6b60b]",  icon: Clock },
  graded:    { bg: "bg-[#00E676]/10",  text: "text-[#00E676]",  dot: "bg-[#00E676]",  icon: CheckCircle2 },
  returned:  { bg: "bg-[#1c81ff]/10",  text: "text-[#1c81ff]",  dot: "bg-[#1c81ff]",  icon: AlertCircle },
  failed:    { bg: "bg-[#ff007b]/10",  text: "text-[#ff007b]",  dot: "bg-[#ff007b]",  icon: XCircle },
  draft:     { bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-500 dark:text-gray-400", dot: "bg-gray-400", icon: Clock },
};

export function SubmissionHistory({ submissions, maxScore }: SubmissionHistoryProps) {
  if (submissions.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/5">
        <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
          <Clock className="h-4 w-4 text-[#1c81ff]" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white">Riwayat Pengumpulan</span>
        <span className="ml-1 inline-flex items-center rounded-full bg-gray-100 dark:bg-white/5 px-2 py-0.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">
          {submissions.length}
        </span>
      </div>

      {/* Submissions */}
      <div className="p-4 space-y-2">
        {submissions.map((submission, index) => {
          const s = STATUS_STYLE[submission.status ?? "draft"] ?? STATUS_STYLE.draft;
          const StatusIcon = s.icon;
          const scorePercent =
            submission.score !== null && submission.score !== undefined
              ? Math.round((submission.score / maxScore) * 100)
              : null;

          return (
            <div
              key={submission.id}
              className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              {/* Icon */}
              <div className={`shrink-0 w-8 h-8 rounded-full ${s.bg} flex items-center justify-center mt-0.5`}>
                <StatusIcon className={`h-4 w-4 ${s.text}`} />
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[14px] font-bold text-gray-900 dark:text-white">
                    Percobaan #{index + 1}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] ${s.bg} ${s.text}`}>
                    <span className={`w-1 h-1 rounded-full ${s.dot}`} />
                    {submission.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[12px] text-gray-500 dark:text-gray-400 flex-wrap">
                  {submission.submitted_at && (
                    <span className="flex items-center gap-1 tabular-nums">
                      <Clock className="h-3 w-3" />
                      {new Date(submission.submitted_at).toLocaleString("id-ID")}
                    </span>
                  )}
                  {submission.score !== null && submission.score !== undefined && (
                    <span className="flex items-center gap-1 font-bold text-[#1c81ff] tabular-nums">
                      <CheckCircle2 className="h-3 w-3" />
                      {submission.score}/{maxScore}
                      {scorePercent !== null && (
                        <span className="text-gray-400 dark:text-gray-600">({scorePercent}%)</span>
                      )}
                    </span>
                  )}
                </div>

                {submission.feedback && (
                  <div className="mt-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-2">
                    <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">
                      <span className="font-bold text-gray-700 dark:text-gray-200">Feedback: </span>
                      {submission.feedback}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
