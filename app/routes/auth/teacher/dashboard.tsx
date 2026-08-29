import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTeacherDashboard } from "@/hooks/teacher";
import {
  DashboardStats,
  DashboardStatsSkeleton,
} from "@/features/auth/teacher/dashboard-stats";
import {
  SubmissionQueue,
  SubmissionQueueSkeleton,
} from "@/features/auth/teacher/submission-queue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Trophy,
  ClipboardList,
  AlertCircle,
} from "lucide-react";

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const { data, isPending, isError, error } = useTeacherDashboard();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isPending) {
      const t = setTimeout(() => setMounted(true), 60);
      return () => clearTimeout(t);
    }
  }, [isPending]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 15) return "Good Afternoon";
    if (hour < 18) return "Good Evening";
    return "Good Evening";
  };

  const avatarSrc =
    typeof user?.avatar === "string"
      ? user.avatar
      : user?.avatar && "url" in user.avatar
        ? user.avatar.url
        : undefined;

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* ── Welcome ── */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
            {getGreeting()}
          </p>
          <h1
            className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            {user?.display_name?.trim() || user?.name || "Teacher"} 👋
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            Overview of your teaching workspace.
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-[#1c81ff]/20">
            <AvatarImage
              src={avatarSrc}
              alt={user?.display_name || user?.name || "Teacher"}
            />
            <AvatarFallback className="text-lg font-bold bg-[#1c81ff]/10 text-[#1c81ff]">
              {(user?.display_name || user?.name)
                ?.charAt(0)
                ?.toUpperCase() || "T"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold text-gray-900 dark:text-white">
              {user?.display_name?.trim() || user?.name || "Teacher"}
            </div>
            {user?.roles && user.roles.length > 0 && (
              <div className="text-[13px] text-gray-500 dark:text-gray-400">
                {user.roles[0].display_name || user.roles[0].name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      {isPending ? (
        <DashboardStatsSkeleton />
      ) : isError ? (
        <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[15px] text-red-600 dark:text-red-400">
            {(error as { message?: string })?.message ??
              "Failed to load dashboard."}
          </p>
        </div>
      ) : (
        <DashboardStats stats={data!.stats} />
      )}

      {/* ── Main content ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Submissions */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f6b60b]/10 flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-[#f6b60b]" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                Pending Submissions
              </span>
            </div>
            <Link
              to="/teacher/submissions?status=submitted"
              className="flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.1em] text-[#1c81ff] hover:opacity-75 transition-opacity"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Content */}
          <div className="p-4">
            {isPending ? (
              <SubmissionQueueSkeleton rows={3} />
            ) : isError ? null : (
              <SubmissionQueue
                submissions={data!.pending_submissions}
                preview
              />
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f6b60b]/10 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-[#f6b60b]" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                Leaderboard
              </span>
            </div>
            <Link
              to="/teacher/leaderboard"
              className="flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.1em] text-[#1c81ff] hover:opacity-75 transition-opacity"
            >
              Full Board
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Content */}
          <div className="p-4">
            {isPending ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 shrink-0 rounded-md" />
                    <Skeleton className="h-4 flex-1 rounded-lg" />
                    <Skeleton className="h-4 w-10 shrink-0 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : isError ? null : (data?.leaderboard ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-[13px] text-gray-500 dark:text-gray-400">
                  No leaderboard data yet.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 dark:border-white/5 hover:bg-transparent">
                    <TableHead className="w-8 text-[12px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">
                      #
                    </TableHead>
                    <TableHead className="text-[12px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">
                      Student
                    </TableHead>
                    <TableHead className="text-right text-[12px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">
                      Pts
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.leaderboard ?? []).map((entry, idx) => (
                    <TableRow
                      key={entry.profile_id}
                      className="border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <TableCell>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold ${
                            idx === 0
                              ? "bg-[#f6b60b]/15 text-[#f6b60b]"
                              : idx === 1
                                ? "bg-gray-200/60 dark:bg-white/10 text-gray-500 dark:text-gray-400"
                                : idx === 2
                                  ? "bg-[#ff7b3d]/15 text-[#ff7b3d]"
                                  : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600"
                          }`}
                        >
                          {entry.rank}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-[14px] text-gray-900 dark:text-white">
                        {entry.display_name ?? `#${entry.profile_id}`}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-bold text-[#1c81ff] text-[14px]">
                        {entry.points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
