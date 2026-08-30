import { useQuery } from "@tanstack/react-query";
import {
  teacherDashboard,
  leaderboard,
  auditLogs,
} from "@/services/teacher";
import type { LeaderboardParams, AuditLogParams } from "@/types/teacher";
import { teacherKeys } from "./keys";

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export function useTeacherDashboard() {
  return useQuery({
    queryKey: teacherKeys.dashboard(),
    queryFn: teacherDashboard,
  });
}

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------

export function useTeacherLeaderboard(params?: LeaderboardParams) {
  return useQuery({
    queryKey: teacherKeys.leaderboard(params),
    queryFn: () => leaderboard(params),
  });
}

// ---------------------------------------------------------------------------
// Audit logs
// ---------------------------------------------------------------------------

export function useTeacherAuditLogs(params?: AuditLogParams) {
  return useQuery({
    queryKey: teacherKeys.auditLogs(params),
    queryFn: () => auditLogs(params),
  });
}
