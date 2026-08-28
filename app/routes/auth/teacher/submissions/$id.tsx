import { Link, useParams } from "react-router";
import { useTeacherSubmission } from "@/hooks/teacher";
import { GradingPanel } from "@/features/auth/teacher/grading-panel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import type { TeacherSubmissionStatus } from "@/types/teacher";

// ---------------------------------------------------------------------------
// Status badge variant
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
// Page
// ---------------------------------------------------------------------------

export default function TeacherSubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const submissionId = Number(id);

  const { data: submission, isPending, isError, error } = useTeacherSubmission(submissionId);

  return (
    <div className="space-y-5">
      {/* Back nav */}
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link to="/teacher/submissions">
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            All Submissions
          </Link>
        </Button>
      </div>

      {isPending ? (
        <SubmissionDetailSkeleton />
      ) : isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {(error as { message?: string })?.message ??
              "Failed to load submission."}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-5 lg:grid-cols-5">
          {/* Submission info — left column */}
          <div className="space-y-5 lg:col-span-3">
            <Card className="shadow-sm border-border/40">
              <CardHeader className="pb-3">
                <CardTitle>Submission Info</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div>
                    <dt className="text-muted-foreground mb-0.5">Student</dt>
                    <dd className="font-medium">
                      {submission.profile.display_name ?? `#${submission.profile.id}`}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-muted-foreground mb-0.5">Status</dt>
                    <dd>
                      <Badge
                        variant={STATUS_VARIANT[submission.status]}
                        className="capitalize"
                      >
                        {submission.status}
                      </Badge>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-muted-foreground mb-0.5">Challenge</dt>
                    <dd className="font-medium">{submission.challenge.title}</dd>
                  </div>

                  <div>
                    <dt className="text-muted-foreground mb-0.5">Type</dt>
                    <dd>
                      <Badge variant="outline" className="capitalize">
                        {submission.challenge.type}
                      </Badge>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-muted-foreground mb-0.5">Score</dt>
                    <dd className="tabular-nums font-medium">
                      {submission.score !== null
                        ? `${submission.score} / ${submission.challenge.max_score}`
                        : `— / ${submission.challenge.max_score}`}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-muted-foreground mb-0.5">Submitted</dt>
                    <dd className="tabular-nums">
                      {submission.submitted_at
                        ? new Date(submission.submitted_at).toLocaleString()
                        : "—"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-muted-foreground mb-0.5">Created</dt>
                    <dd className="tabular-nums text-muted-foreground">
                      {new Date(submission.created_at).toLocaleString()}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-muted-foreground mb-0.5">Updated</dt>
                    <dd className="tabular-nums text-muted-foreground">
                      {new Date(submission.updated_at).toLocaleString()}
                    </dd>
                  </div>
                </dl>

                {/* Existing feedback */}
                {submission.feedback && (
                  <div className="mt-4 pt-4 border-t space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Current Feedback
                    </p>
                    <p className="text-xs whitespace-pre-wrap">
                      {submission.feedback}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Grading panel — right column */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-border/40">
              <CardHeader className="pb-3">
                <CardTitle>Grade Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <GradingPanel submission={submission} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function SubmissionDetailSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <Card className="lg:col-span-3 shadow-sm border-border/40">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="lg:col-span-2 shadow-sm border-border/40">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-7 w-full" />
            </div>
          ))}
          <Skeleton className="h-7 w-24" />
        </CardContent>
      </Card>
    </div>
  );
}
