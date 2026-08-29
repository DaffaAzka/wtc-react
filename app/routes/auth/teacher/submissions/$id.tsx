import { Link, useParams } from "react-router";
import { useTeacherSubmission } from "@/hooks/teacher";
import { GradingPanel } from "@/features/auth/teacher/grading-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, FileText, Clock, Calendar, AlertCircle } from "lucide-react";
import type { TeacherSubmissionStatus } from "@/types/teacher";

const STATUS_STYLE: Record<TeacherSubmissionStatus, { bg: string; text: string; dot: string }> = {
  draft:     { bg: "bg-gray-100 dark:bg-white/5",  text: "text-gray-500 dark:text-gray-400", dot: "bg-gray-400" },
  submitted: { bg: "bg-[#1c81ff]/10",              text: "text-[#1c81ff]",                   dot: "bg-[#1c81ff]" },
  graded:    { bg: "bg-[#00E676]/10",              text: "text-[#00E676]",                   dot: "bg-[#00E676]" },
  returned:  { bg: "bg-[#ff007b]/10",              text: "text-[#ff007b]",                   dot: "bg-[#ff007b]" },
};

function StatusBadge({ status }: { status: TeacherSubmissionStatus }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function SkeletonDetail() {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3 rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 space-y-5">
        <Skeleton className="h-5 w-36 rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 space-y-5">
        <Skeleton className="h-5 w-36 rounded-lg" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3.5 w-20 rounded-md" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        ))}
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}

export default function TeacherSubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const submissionId = Number(id);
  const { data: submission, isPending, isError, error } = useTeacherSubmission(submissionId);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Back nav */}
      <div>
        <Link
          to="/teacher/submissions"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Submissions
        </Link>
      </div>

      {isPending ? (
        <SkeletonDetail />
      ) : isError ? (
        <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[15px] text-red-600 dark:text-red-400">
            {(error as { message?: string })?.message ?? "Failed to load submission."}
          </p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
                Submission #{submission.id}
              </p>
              <h1
                className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
                style={{ letterSpacing: "-0.02em" }}
              >
                {submission.challenge.title}
              </h1>
              <div className="flex items-center gap-2 mt-3">
                <StatusBadge status={submission.status} />
                <span className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-0.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 capitalize">
                  {submission.challenge.type.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Submission info */}
            <div className="lg:col-span-3 space-y-6">
              <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/5">
                  <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-[#1c81ff]" />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">Submission Info</span>
                </div>
                <div className="p-6">
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1">Student</dt>
                      <dd className="text-[14px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-gray-400 dark:text-gray-600" />
                        {submission.profile.display_name ?? `#${submission.profile.id}`}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1">Status</dt>
                      <dd><StatusBadge status={submission.status} /></dd>
                    </div>

                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1">Challenge</dt>
                      <dd className="text-[14px] font-bold text-gray-900 dark:text-white">{submission.challenge.title}</dd>
                    </div>

                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1">Score</dt>
                      <dd className="text-[14px] font-bold tabular-nums">
                        {submission.score !== null ? (
                          <><span className="text-[#1c81ff]">{submission.score}</span><span className="text-gray-400 dark:text-gray-600">/{submission.challenge.max_score}</span></>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600">—/{submission.challenge.max_score}</span>
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />Submitted
                      </dt>
                      <dd className="text-[13px] text-gray-600 dark:text-gray-300 tabular-nums">
                        {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : "—"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />Updated
                      </dt>
                      <dd className="text-[13px] text-gray-500 dark:text-gray-400 tabular-nums">
                        {new Date(submission.updated_at).toLocaleString()}
                      </dd>
                    </div>
                  </dl>

                  {/* Existing feedback */}
                  {submission.feedback && (
                    <div className="mt-5 pt-5 border-t border-gray-100 dark:border-white/5 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                        Current Feedback
                      </p>
                      <p className="text-[14px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {submission.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grading panel */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden sticky top-20">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/5">
                  <div className="w-8 h-8 rounded-full bg-[#f6b60b]/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-[#f6b60b]" />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">Grade Submission</span>
                </div>
                <div className="p-6">
                  <GradingPanel submission={submission} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
