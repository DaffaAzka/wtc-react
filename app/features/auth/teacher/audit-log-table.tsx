import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Inbox, TriangleAlert, RefreshCw } from "lucide-react";
import { useTeacherAuditLogs } from "@/hooks/teacher";
import type { AuditLog, AuditLogParams } from "@/types/teacher";

// ---------------------------------------------------------------------------
// Pure utility functions (exported for testing)
// ---------------------------------------------------------------------------

export type ActionBadgeConfig = {
  label: string;
  className: string;
};

export function actionBadgeConfig(action: string): ActionBadgeConfig {
  const a = action.toLowerCase();
  if (a === "created") {
    return { label: "created", className: "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400" };
  }
  if (a === "updated") {
    return { label: "updated", className: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400" };
  }
  if (a === "deleted") {
    return { label: "deleted", className: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400" };
  }
  if (a === "restored") {
    return { label: "restored", className: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400" };
  }
  return { label: action, className: "bg-muted/50 text-muted-foreground border-border" };
}

export function roleBadgeVariant(
  roleName: string,
): "default" | "secondary" | "outline" {
  const r = roleName.toLowerCase();
  if (r === "admin") return "default";
  if (r === "teacher") return "secondary";
  return "outline";
}

export function formatChangedFields(
  changed: Record<string, unknown> | null,
): string {
  if (!changed) return "—";
  const keys = Object.keys(changed);
  if (keys.length === 0) return "—";
  return keys.join(", ");
}

export function formatTimestamp(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const KNOWN_ACTIONS = ["created", "updated", "deleted", "restored"];
const KNOWN_TYPES = [
  "track",
  "module",
  "lesson",
  "challenge",
  "submission",
  "profile",
  "study_class",
  "user",
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ActionBadge({ action }: { action: string }) {
  const cfg = actionBadgeConfig(action);
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

function ActorCell({ actor }: { actor: AuditLog["actor"] }) {
  if (!actor) {
    return <span className="text-xs text-muted-foreground italic">System</span>;
  }

  return (
    <div className="flex items-center gap-2.5">
      <Avatar className="h-7 w-7">
        <AvatarImage
          src={actor.avatar ?? undefined}
          alt={actor.display_name ?? "Actor"}
        />
        <AvatarFallback className="text-xs">
          {actor.display_name?.charAt(0).toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="truncate text-sm font-medium text-foreground leading-tight">
          {actor.display_name ?? <span className="italic text-muted-foreground">Unknown</span>}
        </span>
        <div className="flex flex-wrap gap-1">
          {actor.roles.map((role) => (
            <Badge
              key={role.name}
              variant={roleBadgeVariant(role.name)}
              className="px-1.5 py-0 text-[10px] leading-4 h-4"
            >
              {role.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonRows({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i}>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-5 w-16" />
          </td>
          <td className="hidden px-4 py-3 md:table-cell">
            <Skeleton className="h-4 w-20" />
          </td>
          <td className="hidden px-4 py-3 lg:table-cell">
            <Skeleton className="h-4 w-32" />
          </td>
          <td className="hidden px-4 py-3 xl:table-cell">
            <Skeleton className="h-4 w-36" />
          </td>
        </tr>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AuditLogTable() {
  const [action, setAction] = useState<string>("all");
  const [targetType, setTargetType] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState(1);

  const params: AuditLogParams = {
    page,
    per_page: 15,
  };
  if (action !== "all") params.action = action;
  if (targetType !== "all") params.target_type = targetType;
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;

  const { data, isLoading, isError, refetch } = useTeacherAuditLogs(params);

  const logs: AuditLog[] = data?.data ?? [];
  const meta = data?.meta;

  const handleActionChange = (v: string) => { setAction(v); setPage(1); };
  const handleTypeChange = (v: string) => { setTargetType(v); setPage(1); };
  const handleDateFromChange = (v: string) => { setDateFrom(v); setPage(1); };
  const handleDateToChange = (v: string) => { setDateTo(v); setPage(1); };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="action-filter" className="text-xs font-medium text-muted-foreground">
            Action
          </label>
          <Select value={action} onValueChange={handleActionChange}>
            <SelectTrigger id="action-filter" className="w-36" aria-label="Filter by action">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {KNOWN_ACTIONS.map((a) => (
                <SelectItem key={a} value={a} className="capitalize">
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="type-filter" className="text-xs font-medium text-muted-foreground">
            Type
          </label>
          <Select value={targetType} onValueChange={handleTypeChange}>
            <SelectTrigger id="type-filter" className="w-40" aria-label="Filter by resource type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {KNOWN_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="date-from" className="text-xs font-medium text-muted-foreground">
            From
          </label>
          <Input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => handleDateFromChange(e.target.value)}
            className="w-40"
            aria-label="Filter from date"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="date-to" className="text-xs font-medium text-muted-foreground">
            To
          </label>
          <Input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => handleDateToChange(e.target.value)}
            className="w-40"
            aria-label="Filter to date"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Actor</th>
              <th className="px-4 py-2.5 font-medium">Action</th>
              <th className="hidden px-4 py-2.5 font-medium md:table-cell">Type</th>
              <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Changed Fields</th>
              <th className="hidden px-4 py-2.5 font-medium xl:table-cell">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <SkeletonRows />
            ) : isError ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <TriangleAlert className="h-5 w-5" />
                    <p className="text-sm">Failed to load audit logs.</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Try again
                    </Button>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Inbox className="h-5 w-5" />
                    <p className="text-sm">No audit log entries found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <ActorCell actor={log.actor} />
                  </td>
                  <td className="px-4 py-3">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground capitalize md:table-cell">
                    {log.target_type.replace("_", " ")}
                    {log.target_title && (
                      <div className="truncate max-w-[140px] text-xs text-foreground/70">
                        {log.target_title}
                      </div>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span
                      className="text-xs text-muted-foreground"
                      title={
                        log.changed_fields
                          ? JSON.stringify(log.changed_fields, null, 2)
                          : undefined
                      }
                    >
                      {formatChangedFields(log.changed_fields)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground xl:table-cell whitespace-nowrap">
                    {formatTimestamp(log.created_at)}
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
