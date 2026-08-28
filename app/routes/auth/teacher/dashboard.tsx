import { Link } from "react-router";
import { useTeacherDashboard } from "@/hooks/teacher";
import { DashboardStats, DashboardStatsSkeleton } from "@/features/auth/teacher/dashboard-stats";
import {
  SubmissionQueue,
  SubmissionQueueSkeleton,
} from "@/features/auth/teacher/submission-queue";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function TeacherDashboardPage() {
  const { data, isPending, isError, error } = useTeacherDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your teaching workspace.
        </p>
      </div>

      {/* Stats */}
      {isPending ? (
        <DashboardStatsSkeleton />
      ) : isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {(error as { message?: string })?.message ??
              "Failed to load dashboard."}
          </AlertDescription>
        </Alert>
      ) : (
        <DashboardStats stats={data.stats} />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending queue preview */}
        <Card className="lg:col-span-2 shadow-sm border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Pending Submissions</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/teacher/submissions?status=submitted">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <SubmissionQueueSkeleton rows={3} />
            ) : isError ? null : (
              <SubmissionQueue
                submissions={data.pending_submissions}
                preview
              />
            )}
          </CardContent>
        </Card>

        {/* Leaderboard preview */}
        <Card className="shadow-sm border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Leaderboard</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/teacher/leaderboard">
                Full board
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 shrink-0" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-10 shrink-0" />
                  </div>
                ))}
              </div>
            ) : isError ? null : data.leaderboard_preview.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No leaderboard data yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.leaderboard_preview.map((entry) => (
                    <TableRow key={entry.profile_id}>
                      <TableCell>
                        <Badge variant="outline" className="tabular-nums">
                          {entry.rank}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.display_name ?? `#${entry.profile_id}`}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {entry.points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
