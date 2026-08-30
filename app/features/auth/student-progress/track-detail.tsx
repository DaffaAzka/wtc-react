import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
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
  ArrowLeft,
  BookOpen,
  RefreshCw,
  Search,
  TriangleAlert,
  Users,
} from "lucide-react";
import { useProgressTrack } from "@/hooks/student-progress";
import type {
  GetProgressTrackDetailParams,
  TrackProfileProgress,
} from "@/types/student-progress";
import { resolveAvatar, initials, ProgressBar, EmptyState } from "./_shared";

// ---------------------------------------------------------------------------
// Certificate grade badge
// ---------------------------------------------------------------------------

const CERT_GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  "A+": { bg: "bg-[#00E676]/10", text: "text-[#00E676]" },
  "A":  { bg: "bg-[#00E676]/10", text: "text-[#00E676]" },
  "B+": { bg: "bg-[#1c81ff]/10", text: "text-[#1c81ff]" },
  "B":  { bg: "bg-[#1c81ff]/10", text: "text-[#1c81ff]" },
  "C+": { bg: "bg-[#f6b60b]/10", text: "text-[#f6b60b]" },
  "C":  { bg: "bg-[#f6b60b]/10", text: "text-[#f6b60b]" },
  "D":  { bg: "bg-[#ff007b]/10", text: "text-[#ff007b]" },
  "F":  { bg: "bg-red-500/10",   text: "text-red-500"   },
};

function CertGradeBadge({ grade }: { grade: string }) {
  const c = CERT_GRADE_COLORS[grade] ?? {
    bg: "bg-gray-100 dark:bg-white/5",
    text: "text-gray-500 dark:text-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide ${c.bg} ${c.text}`}
    >
      {grade}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Track image placeholder — same gradients as index
// ---------------------------------------------------------------------------

const GRADIENT_PLACEHOLDERS = [
  "from-violet-500 to-indigo-600",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-fuchsia-500 to-purple-600",
];

function TrackImagePlaceholder({ seed }: { seed: number }) {
  const gradient = GRADIENT_PLACEHOLDERS[seed % GRADIENT_PLACEHOLDERS.length];
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}>
      <BookOpen className="h-10 w-10 text-white/70" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Track detail component
// ---------------------------------------------------------------------------

interface TrackDetailProps {
  slug: string;
  backTo?: string;
}

export default function TrackDetail({ slug }: TrackDetailProps) {
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<"all" | "in_progress" | "completed">("all");
  const [sort, setSort] = useState<"progress_desc" | "progress_asc" | "name_asc">("name_asc");

  const params: GetProgressTrackDetailParams = {
    status: status === "all" ? undefined : status,
    sort,
  };

  const { data, isLoading, isError, refetch } = useProgressTrack(slug, params);

  const track = data?.track;
  const allProfiles = data?.profiles ?? [];

  const profiles = searchInput.trim()
    ? allProfiles.filter((p) =>
        p.display_name.toLowerCase().includes(searchInput.trim().toLowerCase()),
      )
    : allProfiles;

  const skeletonRows = Array.from({ length: 8 });

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Student Progress
        </button>
      </div>

      {/* Track header */}
      {isLoading ? (
        <div className="flex items-start gap-4">
          <Skeleton className="h-24 w-36 rounded-xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-64 rounded-lg" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
          </div>
        </div>
      ) : isError || !track ? (
        <EmptyState
          icon={TriangleAlert}
          title="Couldn't load track"
          description="Something went wrong fetching this track."
          action={
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
          }
        />
      ) : (
        <>
          {/* Track meta */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5">
              {track.image_url ? (
                <img src={track.image_url} alt={track.title} className="h-full w-full object-cover" />
              ) : (
                <TrackImagePlaceholder seed={track.id} />
              )}
            </div>
            <div>
              <h1
                className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
                style={{ letterSpacing: "-0.02em" }}
              >
                {track.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-[13px] text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[#1c81ff]" />
                  <span>
                    <span className="tabular-nums font-bold text-gray-900 dark:text-white">
                      {track.total_lessons}
                    </span>{" "}lessons
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#1c81ff]" />
                  <span>
                    <span className="tabular-nums font-bold text-gray-900 dark:text-white">
                      {track.enrolled_count}
                    </span>{" "}enrolled
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-600" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by student name…"
                className="h-9 w-48 rounded-lg bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 py-1.5 pl-9 pr-3 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
              />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as "all" | "in_progress" | "completed")}>
              <SelectTrigger
                className="!h-9 w-36 rounded-lg bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 text-[13px] font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]"
                aria-label="Filter by status"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as "progress_desc" | "progress_asc" | "name_asc")}>
              <SelectTrigger
                className="!h-9 w-52 rounded-lg bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 text-[13px] font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]"
                aria-label="Sort students"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="name_asc">Name A–Z</SelectItem>
                <SelectItem value="progress_desc">Progress High–Low</SelectItem>
                <SelectItem value="progress_asc">Progress Low–High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
            {isLoading ? (
              <table className="w-full text-sm bg-white dark:bg-[#0b1215]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                    {["Student", "Status", "Progress", "Points"].map((h, i) => (
                      <th
                        key={i}
                        className={`px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 ${i === 1 ? "hidden sm:table-cell" : ""} ${i === 3 ? "hidden text-right md:table-cell" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {skeletonRows.map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-32 rounded-lg" />
                        </div>
                      </td>
                      <td className="hidden px-5 py-3.5 sm:table-cell">
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </td>
                      <td className="px-5 py-3.5">
                        <Skeleton className="h-1.5 w-full rounded-full" />
                      </td>
                      <td className="hidden px-5 py-3.5 text-right md:table-cell">
                        <Skeleton className="ml-auto h-4 w-12 rounded-md" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : profiles.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No students found"
                description={
                  searchInput
                    ? `No students match "${searchInput}".`
                    : "No students match the current filter."
                }
              />
            ) : (
              <table className="w-full text-sm bg-white dark:bg-[#0b1215]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Student</th>
                    <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 sm:table-cell">Status</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Progress</th>
                    <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 md:table-cell">Certificate</th>
                    <th className="hidden px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 md:table-cell">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {profiles.map((profile: TrackProfileProgress) => (
                    <tr key={profile.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 shrink-0 ring-1 ring-gray-200 dark:ring-white/10">
                            <AvatarImage src={resolveAvatar(profile.avatar)} alt={profile.display_name} />
                            <AvatarFallback className="text-xs font-bold bg-[#1c81ff]/10 text-[#1c81ff]">
                              {initials(profile.display_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-[14px] text-gray-900 dark:text-white">
                            {profile.display_name}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3.5 sm:table-cell">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            profile.status === "completed"
                              ? "bg-[#00E676]/10 text-[#00E676]"
                              : "bg-[#1c81ff]/10 text-[#1c81ff]"
                          }`}
                        >
                          {profile.status === "completed" ? "Completed" : "In Progress"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={profile.progress_percentage} className="w-24 sm:w-36" />
                          <span className="w-9 text-right tabular-nums text-[12px] font-bold text-gray-400 dark:text-gray-600">
                            {profile.progress_percentage}%
                          </span>
                          <span className="hidden text-[12px] text-gray-400 dark:text-gray-600 md:inline">
                            ({profile.completed_lessons}/{profile.total_lessons} lessons)
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3.5 md:table-cell">
                        {profile.certificate_status ? (
                          <CertGradeBadge grade={profile.certificate_status} />
                        ) : (
                          <span className="text-[13px] text-gray-400 dark:text-gray-600">—</span>
                        )}
                      </td>
                      <td className="hidden px-5 py-3.5 text-right md:table-cell">
                        <span className="tabular-nums font-extrabold text-[#1c81ff]">
                          {profile.points.toLocaleString()}
                          <span className="ml-0.5 text-[11px] font-bold text-gray-400 dark:text-gray-600"> pts</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
