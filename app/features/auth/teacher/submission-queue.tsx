import { Link } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox } from "lucide-react";
import type { TeacherSubmission, TeacherSubmissionStatus } from "@/types/teacher";

// ── Status badge styling ────────────────────────────────────────────────────

const STATUS_STYLE: Record<
  TeacherSubmissionStatus,
  { bg: string; text: string; dot: string }
> = {
  draft:     { bg: "bg-gray-100 dark:bg-white/5",       text: "text-gray-500 dark:text-gray-400",  dot: "bg-gray-400" },
  submitted: { bg: "bg-[#1c81ff]/10",                   text: "text-[#1c81ff]",                    dot: "bg-[#1c81ff]" },
  graded:    { bg: "bg-[#00E676]/10",                   text: "text-[#00E676]",                    dot: "bg-[#00E676]" },
  returned:  { bg: "bg-[#ff007b]/10",                   text: "text-[#ff007b]",                    dot: "bg-[#ff007b]" },
};

function StatusBadge({ status }: { status: TeacherSubmissionStatus }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400 capitalize">
      {type}
    </span>
  );
}

// ── Submission queue table ──────────────────────────────────────────────────

interface SubmissionQueueProps {
  submissions: TeacherSubmission[];
  /** When true, only the first 5 rows are shown */
  preview?: boolean;
}

export function SubmissionQueue({
  submissions,
  preview = false,
}: SubmissionQueueProps) {
  const rows = preview ? submissions.slice(0, 5) : submissions;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
          <Inbox className="h-5 w-5 text-gray-400 dark:text-gray-600" />
        </div>
        <p className="text-[13px] text-gray-500 dark:text-gray-400">
          No pending submissions.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100 dark:border-white/5 hover:bg-transparent">
          {["Student", "Challenge", "Type", "Status", "Score", "Submitted"].map(
            (h, i) => (
              <TableHead
                key={h}
                className={`text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 ${i >= 4 ? "text-right" : ""}`}
              >
                {h}
              </TableHead>
            )
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((sub) => (
          <TableRow
            key={sub.id}
            className="border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <TableCell>
              <Link
                to={`/teacher/submissions/${sub.id}`}
                className="font-bold text-[14px] text-gray-900 dark:text-white hover:text-[#1c81ff] transition-colors"
              >
                {sub.profile.display_name ?? `#${sub.profile.id}`}
              </Link>
            </TableCell>
            <TableCell>
              <Link
                to={`/teacher/submissions/${sub.id}`}
                className="text-[14px] text-gray-600 dark:text-gray-300 hover:text-[#1c81ff] transition-colors"
              >
                {sub.challenge.title}
              </Link>
            </TableCell>
            <TableCell>
              <TypeBadge type={sub.challenge.type} />
            </TableCell>
            <TableCell>
              <StatusBadge status={sub.status} />
            </TableCell>
            <TableCell className="text-right tabular-nums text-[14px] font-bold text-gray-900 dark:text-white">
              {sub.score !== null ? (
                <>
                  <span className="text-[#1c81ff]">{sub.score}</span>
                  <span className="text-gray-400 dark:text-gray-600">
                    /{sub.challenge.max_score}
                  </span>
                </>
              ) : (
                <span className="text-gray-400 dark:text-gray-600">
                  —/{sub.challenge.max_score}
                </span>
              )}
            </TableCell>
            <TableCell className="text-right tabular-nums text-[13px] text-gray-500 dark:text-gray-400">
              {sub.submitted_at
                ? new Date(sub.submitted_at).toLocaleDateString()
                : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ── Loading skeleton ────────────────────────────────────────────────────────

export function SubmissionQueueSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100 dark:border-white/5 hover:bg-transparent">
          {["Student", "Challenge", "Type", "Status", "Score", "Submitted"].map(
            (h, i) => (
              <TableHead
                key={h}
                className={`text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 ${i >= 4 ? "text-right" : ""}`}
              >
                {h}
              </TableHead>
            )
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i} className="border-gray-100 dark:border-white/5">
            {Array.from({ length: 6 }).map((_, j) => (
              <TableCell key={j}>
                <Skeleton className="h-4 w-full rounded-lg" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
