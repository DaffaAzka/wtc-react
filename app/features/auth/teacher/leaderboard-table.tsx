import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Inbox,
  TriangleAlert,
  RefreshCw,
} from "lucide-react";
import { useTeacherLeaderboard } from "@/hooks/teacher";
import { useGetStudyClasses } from "@/hooks/study-classes";
import type {
  LeaderboardEntry,
  LeaderboardParams,
  LeaderboardPeriod,
} from "@/types/teacher";

// ---------------------------------------------------------------------------
// Pure utility functions (exported for testing)
// ---------------------------------------------------------------------------

export type RankBadgeConfig = {
  label: string;
  bg: string;
  text: string;
};

export function rankBadgeConfig(rank: number): RankBadgeConfig {
  if (rank === 1)
    return { label: "#1", bg: "bg-[#f6b60b]/15", text: "text-[#f6b60b]" };
  if (rank === 2)
    return { label: "#2", bg: "bg-gray-200/60 dark:bg-white/10", text: "text-gray-500 dark:text-gray-400" };
  if (rank === 3)
    return { label: "#3", bg: "bg-[#ff7b3d]/15", text: "text-[#ff7b3d]" };
  return { label: `#${rank}`, bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-400 dark:text-gray-600" };
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
    <div
      className={`inline-flex items-center justify-center gap-1 w-10 h-7 rounded-lg text-[11px] font-extrabold ${cfg.bg} ${cfg.text}`}
    >
      {rank <= 3 && <Trophy className="h-2.5 w-2.5" />}
      {cfg.label}
    </div>
  );
}

function SkeletonRows({ count = 10 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100 dark:border-white/5">
          <td className="px-5 py-3.5">
            <Skeleton className="h-7 w-10 rounded-lg" />
          </td>
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-lg" />
            </div>
          </td>
          <td className="px-5 py-3.5 text-right">
            <Skeleton className="ml-auto h-5 w-16 rounded-lg" />
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
    <div className="space-y-6">
      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor="period-filter"
            className="text-[13px] font-bold text-gray-700 dark:text-gray-300"
          >
            Period
          </label>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger
              id="period-filter"
              className="w-36 h-9 rounded-xl border-gray-200 dark:border-white/20 bg-slate-50 dark:bg-[#1a1a1a] text-sm font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]"
              aria-label="Filter by period"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {studyClasses.length > 0 && (
          <div className="flex items-center gap-2">
            <label
              htmlFor="class-filter"
              className="text-[13px] font-bold text-gray-700 dark:text-gray-300"
            >
              Class
            </label>
            <Select
              value={classId === null ? "all" : String(classId)}
              onValueChange={handleClassChange}
            >
              <SelectTrigger
                id="class-filter"
                className="w-48 h-9 rounded-xl border-gray-200 dark:border-white/20 bg-slate-50 dark:bg-[#1a1a1a] text-sm font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]"
                aria-label="Filter by study class"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
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

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
              <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                Rank
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                Student
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {isLoading ? (
              <SkeletonRows />
            ) : isError ? (
              <tr>
                <td colSpan={3} className="py-14 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                      <TriangleAlert className="h-5 w-5 text-red-500" />
                    </div>
                    <p className="text-[14px] text-gray-500 dark:text-gray-400">
                      Failed to load leaderboard.
                    </p>
                    <button
                      onClick={() => refetch()}
                      className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Try again
                    </button>
                  </div>
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-14 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                      <Inbox className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-[14px] text-gray-500 dark:text-gray-400">
                      No entries for this period.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr
                  key={(entry as any).profile?.id ?? entry.rank}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <RankCell rank={entry.rank} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-1 ring-gray-200 dark:ring-white/10">
                        <AvatarImage
                          src={(entry as any).profile?.avatar?.url ?? undefined}
                          alt={(entry as any).profile?.display_name ?? "Student"}
                        />
                        <AvatarFallback className="text-xs font-bold bg-[#1c81ff]/10 text-[#1c81ff]">
                          {(
                            (entry as any).profile?.display_name ?? "?"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-[14px] text-gray-900 dark:text-white">
                        {(entry as any).profile?.display_name ?? (
                          <span className="italic text-gray-400 dark:text-gray-600">
                            Unknown
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 font-extrabold tabular-nums text-[#1c81ff]">
                      {entry.points.toLocaleString()}
                      <span className="text-[11px] font-bold text-gray-400 dark:text-gray-600">
                        pts
                      </span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-gray-500 dark:text-gray-400">
            {meta.from ?? 0}–{meta.to ?? 0}{" "}
            <span className="text-gray-400 dark:text-gray-600">of</span>{" "}
            {meta.total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              aria-label="Previous page"
              className="flex items-center gap-1 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <span className="tabular-nums text-[13px] font-bold text-gray-500 dark:text-gray-400 px-1">
              {meta.current_page} / {meta.last_page}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(meta.last_page, p + 1))
              }
              disabled={page === meta.last_page || isLoading}
              aria-label="Next page"
              className="flex items-center gap-1 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
