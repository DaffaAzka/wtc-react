import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useTeacherSubmissions } from "@/hooks/teacher";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TeacherSubmissionStatus } from "@/types/teacher";

// ---------------------------------------------------------------------------
// Status variant helper (mirrors submission-queue)
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

const ALL_STATUSES: TeacherSubmissionStatus[] = [
  "draft",
  "submitted",
  "graded",
  "returned",
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TeacherSubmissionsIndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive filter state from URL so back/forward works
  const statusParam = searchParams.get("status") as TeacherSubmissionStatus | null;
  const challengeParam = searchParams.get("challenge_id");
  const pageParam = Number(searchParams.get("page") ?? "1");

  // Local input state — challenge title search, no UUID
  const [challengeInput, setChallengeInput] = useState(challengeParam ?? "");

  const filters = {
    status: statusParam ?? undefined,
    challenge_id: challengeParam ? Number(challengeParam) : undefined,
    page: pageParam,
    per_page: 20,
  };

  const { data, isPending, isError, error } = useTeacherSubmissions(filters);

  function setParam(key: string, value: string | null) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === null || value === "" || value === "all") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      next.delete("page"); // reset page on filter change
      return next;
    });
  }

  function setPage(p: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(p));
      return next;
    });
  }

  function applyNumericFilters() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (challengeInput) next.set("challenge_id", challengeInput);
      else next.delete("challenge_id");
      next.delete("page");
      return next;
    });
  }

  const currentPage = data?.meta.current_page ?? pageParam;
  const lastPage = data?.meta.last_page ?? 1;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Submissions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and grade student submissions.
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border-border/40">
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <Select
                value={statusParam ?? "all"}
                onValueChange={(v) => setParam("status", v)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Challenge ID */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Challenge ID
              </label>
              <Input
                type="number"
                placeholder="e.g. 42"
                value={challengeInput}
                onChange={(e) => setChallengeInput(e.target.value)}
                className="w-28"
              />
            </div>

            <Button size="sm" variant="outline" onClick={applyNumericFilters}>
              Apply
            </Button>

            {(statusParam || challengeParam) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setChallengeInput("");
                  setSearchParams({});
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-sm border-border/40">
        <CardContent className="pt-4">
          {isPending ? (
            <SubmissionsTableSkeleton />
          ) : isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                {(error as { message?: string })?.message ??
                  "Failed to load submissions."}
              </AlertDescription>
            </Alert>
          ) : data.data.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No submissions match the selected filters.
            </p>
          ) : (
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
                {data.data.map((sub) => (
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
                      <Badge
                        variant={STATUS_VARIANT[sub.status]}
                        className="capitalize"
                      >
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
          )}

          {/* Pagination */}
          {!isPending && !isError && lastPage > 1 && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <p className="text-xs text-muted-foreground">
                Page {currentPage} of {lastPage}
                {data && ` · ${data.meta.total} total`}
              </p>
              <div className="flex gap-1">
                <Button
                  size="icon-sm"
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  disabled={currentPage >= lastPage}
                  onClick={() => setPage(currentPage + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function SubmissionsTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {["Student", "Challenge", "Type", "Status", "Score", "Submitted"].map(
            (h) => (
              <TableHead key={h}>{h}</TableHead>
            )
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
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
