import { Link } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { TeacherSubmission, TeacherSubmissionStatus } from "@/types/teacher";

// ---------------------------------------------------------------------------
// Status badge color map
// ---------------------------------------------------------------------------

const STATUS_VARIANT: Record<
  TeacherSubmissionStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  draft: "outline",
  submitted: "default",
  graded: "secondary",
  returned: "destructive",
};

// ---------------------------------------------------------------------------
// Submission queue table (used on dashboard as a preview)
// ---------------------------------------------------------------------------

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
      <div className="py-8 text-center text-xs text-muted-foreground">
        No pending submissions.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Challenge</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Score</TableHead>
          <TableHead className="text-right">Submitted</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((sub) => (
          <TableRow key={sub.id}>
            <TableCell className="font-medium">
              <Link
                to={`/teacher/submissions/${sub.id}`}
                className="hover:underline text-foreground"
              >
                {sub.profile.display_name ?? `#${sub.profile.id}`}
              </Link>
            </TableCell>
            <TableCell>
              <Link
                to={`/teacher/submissions/${sub.id}`}
                className="hover:underline text-foreground"
              >
                {sub.challenge.title}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {sub.challenge.type}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[sub.status]} className="capitalize">
                {sub.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {sub.score !== null
                ? `${sub.score} / ${sub.challenge.max_score}`
                : `— / ${sub.challenge.max_score}`}
            </TableCell>
            <TableCell className="text-right tabular-nums text-muted-foreground">
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

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

export function SubmissionQueueSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Challenge</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Score</TableHead>
          <TableHead className="text-right">Submitted</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: 6 }).map((_, j) => (
              <TableCell key={j}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
