import { Skeleton } from "@/components/ui/skeleton";
import type { TeacherDashboardStats } from "@/types/teacher";
import { Users, BookOpen, FileText, Target, Clock } from "lucide-react";

export const STAT_ITEMS = [
  {
    key: "total_students" as const,
    label: "Students",
    Icon: Users,
    colorClass: "text-[#1c81ff]",
    bgClass: "bg-[#1c81ff]/10",
  },
  {
    key: "total_tracks" as const,
    label: "Tracks",
    Icon: BookOpen,
    colorClass: "text-[#31c7c8]",
    bgClass: "bg-[#31c7c8]/10",
  },
  {
    key: "total_lessons" as const,
    label: "Lessons",
    Icon: FileText,
    colorClass: "text-[#2548d8]",
    bgClass: "bg-[#2548d8]/10",
  },
  {
    key: "total_challenges" as const,
    label: "Challenges",
    Icon: Target,
    colorClass: "text-[#ff007b]",
    bgClass: "bg-[#ff007b]/10",
  },
  {
    key: "pending_submissions" as const,
    label: "Pending",
    Icon: Clock,
    colorClass: "text-[#f6b60b]",
    bgClass: "bg-[#f6b60b]/10",
  },
] as const;

// ── Stat card grid ──────────────────────────────────────────────────────────

interface DashboardStatsProps {
  stats: TeacherDashboardStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {STAT_ITEMS.map(({ key, label, Icon, colorClass, bgClass }) => (
        <div
          key={key}
          className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div
            className={`w-11 h-11 rounded-full ${bgClass} flex items-center justify-center mb-4`}>
            <Icon className={`h-5 w-5 ${colorClass}`} />
          </div>
          <div
            className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1"
            style={{ letterSpacing: "-0.02em" }}>
            {stats[key]}
          </div>
          <div className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Loading skeleton ────────────────────────────────────────────────────────

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5 space-y-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-8 w-14 rounded-lg" />
          <Skeleton className="h-2.5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
