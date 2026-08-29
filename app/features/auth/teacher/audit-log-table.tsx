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
  Inbox,
  TriangleAlert,
  RefreshCw,
} from "lucide-react";
import { useTeacherAuditLogs } from "@/hooks/teacher";
import type { AuditLog, AuditLogParams } from "@/types/teacher";

// ── Pure utils (exported for testing) ─────────────────────────────────────

export type ActionBadgeConfig = { label: string; bg: string; text: string };

export function actionBadgeConfig(action: string): ActionBadgeConfig {
  const a = action.toLowerCase();
  if (a === "created")  return { label: "created",  bg: "bg-[#00E676]/10", text: "text-[#00E676]" };
  if (a === "updated")  return { label: "updated",  bg: "bg-[#1c81ff]/10", text: "text-[#1c81ff]" };
  if (a === "deleted")  return { label: "deleted",  bg: "bg-[#ff007b]/10", text: "text-[#ff007b]" };
  if (a === "restored") return { label: "restored", bg: "bg-[#31c7c8]/10", text: "text-[#31c7c8]" };
  return { label: action, bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-500 dark:text-gray-400" };
}

export function formatChangedFields(changed: Record<string, unknown> | null): string {
  if (!changed) return "—";
  const keys = Object.keys(changed);
  return keys.length === 0 ? "—" : keys.join(", ");
}

export function formatTimestamp(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const KNOWN_ACTIONS = ["created", "updated", "deleted", "restored"];
const KNOWN_TYPES = ["track", "module", "lesson", "challenge", "submission", "profile", "study_class", "user"];

// ── Sub-components ─────────────────────────────────────────────────────────

function ActionBadge({ action }: { action: string }) {
  const cfg = actionBadgeConfig(action);
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] capitalize ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function ActorCell({ actor }: { actor: AuditLog["actor"] }) {
  if (!actor) {
    return <span className="text-[12px] text-gray-400 dark:text-gray-600 italic">System</span>;
  }
  return (
    <div className="flex items-center gap-2.5">
      <Avatar className="h-8 w-8 shrink-0 ring-1 ring-gray-200 dark:ring-white/10">
        <AvatarImage src={actor.avatar ?? undefined} alt={actor.display_name ?? "Actor"} />
        <AvatarFallback className="text-xs font-bold bg-[#1c81ff]/10 text-[#1c81ff]">
          {actor.display_name?.charAt(0).toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="truncate text-[14px] font-bold text-gray-900 dark:text-white leading-tight">
          {actor.display_name ?? <span className="italic text-gray-400 dark:text-gray-600">Unknown</span>}
        </span>
        <div className="flex flex-wrap gap-1">
          {actor.roles.map((role) => (
            <span key={role.name}
              className="inline-flex items-center rounded-full bg-[#1c81ff]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#1c81ff] capitalize">
              {role.name}
            </span>
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
        <tr key={i} className="border-b border-gray-100 dark:border-white/5">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28 rounded-md" />
                <Skeleton className="h-3 w-14 rounded-md" />
              </div>
            </div>
          </td>
          <td className="px-5 py-3.5"><Skeleton className="h-5 w-16 rounded-full" /></td>
          <td className="hidden px-5 py-3.5 md:table-cell"><Skeleton className="h-4 w-20 rounded-lg" /></td>
          <td className="hidden px-5 py-3.5 lg:table-cell"><Skeleton className="h-4 w-32 rounded-lg" /></td>
          <td className="hidden px-5 py-3.5 xl:table-cell"><Skeleton className="h-4 w-36 rounded-lg" /></td>
        </tr>
      ))}
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function AuditLogTable() {
  const [action, setAction] = useState<string>("all");
  const [targetType, setTargetType] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [page, setPage] = useState(1);

  const params: AuditLogParams = { page, per_page: 15 };
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
    <div className="space-y-5 p-5">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        {[
          {
            id: "action-filter", label: "Action", value: action,
            onChange: handleActionChange, width: "w-36",
            items: KNOWN_ACTIONS.map((a) => ({ value: a, label: a })),
            placeholder: "All Actions",
          },
          {
            id: "type-filter", label: "Type", value: targetType,
            onChange: handleTypeChange, width: "w-40",
            items: KNOWN_TYPES.map((t) => ({ value: t, label: t.replace("_", " ") })),
            placeholder: "All Types",
          },
        ].map(({ id, label, value, onChange, width, items, placeholder }) => (
          <div key={id} className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{label}</label>
            <Select value={value} onValueChange={onChange}>
              <SelectTrigger id={id}
                className={`h-9 ${width} rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 text-[13px] font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]`}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="capitalize">{placeholder}</SelectItem>
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.value} className="capitalize">{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        {[
          { id: "date-from", label: "From", value: dateFrom, onChange: handleDateFromChange },
          { id: "date-to",   label: "To",   value: dateTo,   onChange: handleDateToChange },
        ].map(({ id, label, value, onChange }) => (
          <div key={id} className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-[13px] font-bold text-gray-700 dark:text-gray-300">{label}</label>
            <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)}
              className="h-9 w-36 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-3 text-[13px] text-gray-900 dark:text-white focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
            />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
              <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Actor</th>
              <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Action</th>
              <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 md:table-cell">Type</th>
              <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 lg:table-cell">Changed Fields</th>
              <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 xl:table-cell">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : isError ? (
              <tr>
                <td colSpan={5} className="py-16">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                      <TriangleAlert className="h-5 w-5 text-red-500" />
                    </div>
                    <p className="text-[14px] text-gray-500 dark:text-gray-400">Failed to load audit logs.</p>
                    <button onClick={() => refetch()}
                      className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                      <RefreshCw className="h-3.5 w-3.5" /> Try again
                    </button>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                      <Inbox className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-[14px] font-bold text-gray-900 dark:text-white">No audit log entries</p>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400">Try adjusting the filters above.</p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <ActorCell actor={log.actor} />
                  </td>
                  <td className="px-5 py-3.5">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="hidden px-5 py-3.5 md:table-cell">
                    <span className="text-[14px] text-gray-600 dark:text-gray-300 capitalize">
                      {log.target_type.replace("_", " ")}
                    </span>
                    {log.target_title && (
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 max-w-[140px] truncate mt-0.5">
                        {log.target_title}
                      </p>
                    )}
                  </td>
                  <td className="hidden px-5 py-3.5 lg:table-cell">
                    <span className="text-[13px] text-gray-500 dark:text-gray-400 font-mono"
                      title={log.changed_fields ? JSON.stringify(log.changed_fields, null, 2) : undefined}>
                      {formatChangedFields(log.changed_fields)}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3.5 xl:table-cell tabular-nums text-[13px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
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
              className="flex items-center gap-1 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <span className="tabular-nums text-[13px] font-bold text-gray-500 dark:text-gray-400 px-1">
              {meta.current_page} / {meta.last_page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page || isLoading}
              className="flex items-center gap-1 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
