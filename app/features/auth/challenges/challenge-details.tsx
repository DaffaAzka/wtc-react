import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Challenge, ChallengeAttachment } from "@/types/model";

interface ChallengeDetailsProps {
  challenge: Challenge;
  submissionCount: number;
  remainingAttempts: number | typeof Infinity;
}

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: "Multiple Choice",
  essay: "Essay",
  code_editor: "Code Editor",
  file_upload: "File Upload",
  github_submission: "GitHub Submission",
  docker_project: "Docker Project",
  timed_exam: "Timed Exam",
  quiz_group: "Quiz Group",
};

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string }> = {
  easy: { bg: "bg-[#00E676]/10", text: "text-[#00E676]" },
  medium: { bg: "bg-[#f6b60b]/10", text: "text-[#f6b60b]" },
  hard: { bg: "bg-[#ff007b]/10", text: "text-[#ff007b]" },
};

export function ChallengeDetails({
  challenge,
  submissionCount,
  remainingAttempts,
}: ChallengeDetailsProps) {
  const diffStyle = challenge.difficulty
    ? DIFFICULTY_STYLE[challenge.difficulty.toLowerCase()]
    : null;

  return (
    <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 space-y-4">
        <div>
          <h2
            className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-3"
            style={{ letterSpacing: "-0.02em" }}>
            {challenge.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {diffStyle && challenge.difficulty && (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] capitalize ${diffStyle.bg} ${diffStyle.text}`}>
                {challenge.difficulty}
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-[#1c81ff]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#1c81ff]">
              {challenge.max_score} poin
            </span>
            <span className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-0.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">
              {TYPE_LABELS[challenge.type] || challenge.type}
            </span>
          </div>
        </div>

        {/* Content */}
        <div
          className="prose prose-sm max-w-none dark:prose-invert text-[15px] leading-relaxed text-gray-600 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: challenge.content }}
        />
      </div>

      {/* Info panel */}
      <div className="border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-0.5">
              Skor Maks
            </p>
            <p className="text-[15px] font-extrabold text-gray-900 dark:text-white">
              {challenge.max_score}
            </p>
          </div>

          {challenge.allowed_attempts && challenge.allowed_attempts > 0 && (
            <>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-0.5">
                  Maks Percobaan
                </p>
                <p className="text-[15px] font-extrabold text-gray-900 dark:text-white">
                  {challenge.allowed_attempts}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-0.5">
                  Sudah Dikumpul
                </p>
                <p className="text-[15px] font-extrabold text-gray-900 dark:text-white">
                  {submissionCount}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-0.5">
                  Sisa Percobaan
                </p>
                <p
                  className={cn(
                    "text-[15px] font-extrabold",
                    remainingAttempts === 0
                      ? "text-[#ff007b]"
                      : "text-gray-900 dark:text-white",
                  )}>
                  {remainingAttempts === Infinity ? "∞" : remainingAttempts}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Attachments */}
      {challenge.attachments && challenge.attachments.length > 0 && (
        <div className="border-t border-gray-100 dark:border-white/5 p-5 space-y-2">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-3">
            Lampiran
          </p>
          {challenge.attachments.map((attachment: ChallengeAttachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-[#1c81ff]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-gray-900 dark:text-white">
                  {attachment.title}
                </p>
                {attachment.description && (
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {attachment.description}
                  </p>
                )}
              </div>
              <span className="shrink-0 inline-flex items-center rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-0.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 capitalize">
                {attachment.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
