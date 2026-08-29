import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { useTeacherSubmissions } from "@/hooks/teacher";
import { useGetChallenges } from "@/hooks/challenges";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  Inbox,
  X,
} from "lucide-react";
import type { TeacherSubmissionStatus } from "@/types/teacher";

const STATUS_STYLE: Record<TeacherSubmissionStatus, { bg: string; text: string; dot: string }> = {
  draft:     { bg: "bg-gray-100 dark:bg-white/5",  text: "text-gray-500 dark:text-gray-400", dot: "bg-gray-400" },
  submitted: { bg: "bg-[#1c81ff]/10",              text: "text-[#1c81ff]",                   dot: "bg-[#1c81ff]" },
  graded:    { bg: "bg-[#00E676]/10",              text: "text-[#00E676]",                   dot: "bg-[#00E676]" },
  returned:  { bg: "bg-[#ff007b]/10",              text: "text-[#ff007b]",                   dot: "bg-[#ff007b]" },
};

function StatusBadge({ status }: { status: TeacherSubmissionStatus }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

const ALL_STATUSES: TeacherSubmissionStatus[] = ["draft", "submitted", "graded", "returned"];

export default function TeacherSubmissionsIndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const statusParam = searchParams.get("status") as TeacherSubmissionStatus | null;
  const challengeParam = searchParams.get("challenge_id");
  const searchParam = searchParams.get("search") ?? "";
  const pageParam = Number(searchParams.get("page") ?? "1");
  const [searchInput, setSearchInput] = useState(searchParam);

  const { challenges } = useGetChallenges();

  const filters = {
    status: statusParam ?? undefined,
    challenge_id: challengeParam ? Number(challengeParam) : undefined,
    search: searchParam || undefined,
    page: pageParam,
    per_page: 20,
  };

  const { data, isPending, isError, error } = useTeacherSubmissions(filters);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  function setParam(key: string, value: string | null) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!value || value === "all") next.delete(key);
      else next.set(key, value);
      next.delete("page");
      return next;
    });
  }

  function setPage(p: number) {
    setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set("page", String(p)); return next; });
  }

  function applySearch() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (searchInput.trim()) next.set("search", searchInput.trim());
      else next.delete("search");
      next.delete("page");
      return next;
    });
  }

  function clearAll() { setSearchInput(""); setSearchParams({}); }

  const currentPage = data?.meta.current_page ?? pageParam;
  const lastPage = data?.meta.last_page ?? 1;
  const hasFilters = !!(statusParam || challengeParam || searchParam);

  return (
    <div className={`space-y-8 transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Teacher</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
            Submissions
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            Review and grade student submissions.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-600 pointer-events-none" />
            <input
              className="w-48 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 pl-9 pr-3 py-2 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
              placeholder="Search student…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
            />
          </div>

          {/* Status filter */}
          <Select value={statusParam ?? "all"} onValueChange={(v) => setParam("status", v)}>
            <SelectTrigger className="w-36 h-9 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 text-[13px] font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All statuses</SelectItem>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Challenge filter */}
          <Select value={challengeParam ?? "all"} onValueChange={(v) => setParam("challenge_id", v)}>
            <SelectTrigger className="w-44 h-9 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 text-[13px] font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
              <SelectValue placeholder="All challenges" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All challenges</SelectItem>
              {(challenges ?? []).map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
        {isPending ? (
          <table className="w-full text-sm bg-white dark:bg-[#0b1215]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                {["Student", "Challenge", "Type", "Status", "Score", "Submitted"].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 ${i >= 4 ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-5 py-3.5"><Skeleton className="h-4 w-full rounded-lg" /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center bg-white dark:bg-[#0b1215]">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-[14px] text-gray-500 dark:text-gray-400">
              {(error as { message?: string })?.message ?? "Failed to load submissions."}
            </p>
          </div>
        ) : data.data.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center bg-white dark:bg-[#0b1215]">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <Inbox className="h-5 w-5 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-[14px] font-bold text-gray-900 dark:text-white">No submissions found</p>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">Try adjusting your filters.</p>
          </div>
        ) : (
          <table className="w-full text-sm bg-white dark:bg-[#0b1215]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                {["Student", "Challenge", "Type", "Status", "Score", "Submitted"].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 ${i >= 4 ? "text-right" : "text-left"} ${i === 1 ? "hidden sm:table-cell" : ""} ${i === 2 ? "hidden md:table-cell" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {data.data.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link to={`/teacher/submissions/${sub.id}`} className="font-bold text-[14px] text-gray-900 dark:text-white hover:text-[#1c81ff] transition-colors">
                      {sub.profile.display_name ?? `#${sub.profile.id}`}
                    </Link>
                  </td>
                  <td className="hidden sm:table-cell px-5 py-3.5">
                    <Link to={`/teacher/submissions/${sub.id}`} className="text-[14px] text-gray-600 dark:text-gray-300 hover:text-[#1c81ff] transition-colors">
                      {sub.challenge.title}
                    </Link>
                  </td>
                  <td className="hidden md:table-cell px-5 py-3.5">
                    <span className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-0.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 capitalize">
                      {sub.challenge.type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={sub.status} /></td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-[14px] font-bold">
                    {sub.score !== null ? (
                      <><span className="text-[#1c81ff]">{sub.score}</span><span className="text-gray-400 dark:text-gray-600">/{sub.challenge.max_score}</span></>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">—/{sub.challenge.max_score}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-gray-500 dark:text-gray-400 tabular-nums">
                    {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!isPending && !isError && lastPage > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-gray-500 dark:text-gray-400">
            Page <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span> of {lastPage}
            {data && <> · <span className="font-bold text-gray-900 dark:text-white">{data.meta.total}</span> total</>}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= lastPage}
              className="flex items-center gap-1 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
