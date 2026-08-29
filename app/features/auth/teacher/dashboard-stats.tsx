import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TeacherDashboardStats } from "@/types/teacher";
import { Users, BookOpen, FileText, Target, Clock } from "lucide-react";

// ---------------------------------------------------------------------------
// Stat item config — order matches visual layout left-to-right
// ---------------------------------------------------------------------------

export const STAT_ITEMS = [
  {
    key: "total_students" as const,
    label: "Students",
    Icon: Users,
    colorClass: "text-blue-500",
    bgClass: "bg-blue-500/10",
  },
  {
    key: "total_tracks" as const,
    label: "Tracks",
    Icon: BookOpen,
    colorClass: "text-sky-500",
    bgClass: "bg-sky-500/10",
  },
  {
    key: "total_lessons" as const,
    label: "Lessons",
    Icon: FileText,
    colorClass: "text-indigo-500",
    bgClass: "bg-indigo-500/10",
  },
  {
    key: "total_challenges" as const,
    label: "Challenges",
    Icon: Target,
    colorClass: "text-purple-500",
    bgClass: "bg-purple-500/10",
  },
  {
    key: "pending_submissions" as const,
    label: "Pending",
    Icon: Clock,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
  },
] as const;

// ---------------------------------------------------------------------------
// Stat card grid
// ---------------------------------------------------------------------------

interface DashboardStatsProps {
  stats: TeacherDashboardStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {STAT_ITEMS.map(({ key, label, Icon, colorClass, bgClass }) => (
        <Card key={key} className="shadow-sm border-border/40">
          <CardContent className="p-4">
            <div className="mb-3">
              <div className={`inline-flex p-2 rounded-full ${bgClass}`}>
                <Icon className={`h-4 w-4 ${colorClass}`} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-0.5">{stats[key]}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              {label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="shadow-sm border-border/40">
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-10" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
