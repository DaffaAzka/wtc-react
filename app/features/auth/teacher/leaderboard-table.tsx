import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Trophy, Inbox, TriangleAlert, RefreshCw } from "lucide-react";
import { useTeacherLeaderboard } from "@/hooks/teacher";
import { useGetStudyClasses } from "@/hooks/study-classes";
import type { LeaderboardEntry, LeaderboardParams, LeaderboardPeriod } from "@/types/teacher";

// ---------------------------------------------------------------------------
// Pure utility functions (exported for testing)
// ---------------------------------------------------------------------------

export type RankBadgeConfig = {
  label: string;
  className: string;
};

export function rankBadgeConfig(rank: number): RankBadgeConfig {
  if (rank === 1) {
    return { label: "#1", className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" };
  }
  if (rank === 2) {
    return { label: "#2", className: "bg-slate-400/10 text-slate-500 border-slate-400/20" };
  }
  if (rank === 3) {
    return { label: "#3", className: "bg-amber-700/10 text-amber-700 border-amber-700/20" };
  }
  return { label: `#${rank}`, className: "bg-muted/50 text-muted-foreground border-border" };
}

const PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
  "all-time": "All Time",
  monthly: "Monthly",
  weekly: "Weekly",
};

export function formatPeriodLabel(period: LeaderboardPeriod): string {
  return PERIOD_LABELS[period];
}

export function buildLeaderboardParams(opts: {
  period: LeaderboardPeriod;
  classId: number | null;
  page: number;
  perPage?: number;
}): LeaderboardParams {
  const params: LeaderboardParams = {
    period: opts.period,
    page: opts.page,
    per_page: opts.perPage ?? 15,
  };
  if (opts.classId !== null) {
    params.study_class_id = opts.classId;
  }
  return params;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RankCell({ rank }: { rank: number }) {
  const cfg = rankBadgeConfig(rank);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums ${cfg.className}`}
    >
      {rank <= 3 && <Trophy className="mr-1 h-3 w-3" />}
      {cfg.label}
    </span>
  );
}

function SkeletonRows({ count = 10 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i}>
          <td className="px-4 py-3">
            <Skeleton className="h-5 w-10" />
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </td>
          <td className="px-4 py-3 text-right">
            <Skeleton className="ml-auto h-5 w-16" />
          </td>
        </tr>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LeaderboardTable() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("all-time");
  const [classId, setClassId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const params = buildLeaderboardParams({ period, classId, page });

  const { data, isLoading, isError, refetch } = useTeacherLeaderboard(params);
  const { studyClasses } = useGetStudyClasses();

  const entries: LeaderboardEntry[] = (data as any)?.data?.leaderboard ?? [];
  const meta = (data as any)?.data?.pagination;

  const handlePeriodChange = (value: string) => {
    setPeriod(value as LeaderboardPeriod);
    setPage(1);
  };

  const handleClassChange = (value: string) => {
    setClassId(value === "all" ? null : Number(value));
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="period-filter" className="text-sm font-medium text-muted-foreground">
            Period
          </label>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger
              id="period-filter"
              className="w-36"
              aria-label="Filter by period"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {studyClasses.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="class-filter" className="text-sm font-medium text-muted-foreground">
              Class
            </label>
            <Select
              value={classId === null ? "all" : String(classId)}
              onValueChange={handleClassChange}
            >
              <SelectTrigger
                id="class-filter"
                className="w-48"
                aria-label="Filter by study class"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {studyClasses.map((sc) => (
                  <SelectItem key={sc.id} value={String(sc.id)}>
                    {sc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Rank</th>
              <th className="px-4 py-2.5 font-medium">Student</th>
              <th className="px-4 py-2.5 text-right font-medium">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <SkeletonRows />
            ) : isError ? (
              <tr>
                <td colSpan={3} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <TriangleAlert className="h-5 w-5" />
                    <p className="text-sm">Failed to load leaderboard.</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Try again
                    </Button>
                  </div>
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Inbox className="h-5 w-5" />
                    <p className="text-sm">No entries for this period.</p>
                  </div>
                </td>
              </tr>
            ) : (
              (entries ?? []).map((entry) => (
                <tr key={entry.profile_id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <RankCell rank={entry.rank} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={entry.avatar ?? undefined}
                          alt={entry.display_name ?? "Student"}
                        />
                        <AvatarFallback className="text-xs">
                          {entry.display_name?.charAt(0).toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">
                        {entry.display_name ?? <span className="text-muted-foreground italic">Unknown</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                      {entry.points.toLocaleString()}
                      <span className="text-xs font-normal text-muted-foreground">pts</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {meta.from ?? 0}–{meta.to ?? 0} of {meta.total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="tabular-nums text-muted-foreground">
              {meta.current_page} / {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page || isLoading}
              aria-label="Next page"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
