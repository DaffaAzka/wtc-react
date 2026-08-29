import React, { useState } from "react";
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

// ── Track image placeholder ─────────────────────────────────────────────────

const PATTERN_COLORS = [
  "from-[#1c81ff]/20 to-[#2548d8]/20",
  "from-[#31c7c8]/20 to-[#1c81ff]/20",
  "from-[#2548d8]/20 to-[#31c7c8]/20",
  "from-[#ff007b]/20 to-[#2548d8]/20",
  "from-[#f6b60b]/20 to-[#ff007b]/20",
  "from-[#00E676]/20 to-[#31c7c8]/20",
];

function TrackImagePlaceholder({ seed }: { seed: number }) {
  const gradient = PATTERN_COLORS[seed % PATTERN_COLORS.length];
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}>
      <BookOpen className="h-8 w-8 text-white/50" />
    </div>
  );
}

// ── Track detail ─────────────────────────────────────────────────────────────

interface TrackDetailProps {
  slug: string;
  /** Kept for backwards compatibility — back button now uses navigate(-1) */
  backTo?: string;
}

export default function TrackDetail({ slug }: TrackDetailProps) {
  const navigate = useNavigate();
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
    ? allProfiles.filter((p) => p.display_name.toLowerCase().includes(searchInput.trim().toLowerCase()))
    : allProfiles;

  const skeletonRows = Array.from({ length: 8 });

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Student Progress
        </Button>
      </div>

      {/* Track header */}
      {isLoading ? (
        <div className="flex items-start gap-4">
          <Skeleton className="h-20 w-32 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-64" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 dark:border-white/5 last:border-0">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-36 rounded-lg" />
              <Skeleton className="hidden h-1.5 flex-1 rounded-full sm:block" />
              <Skeleton className="hidden h-4 w-12 rounded-md md:block" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (isError || !track) {
    return (
      <div className="space-y-6">
        <Link to={backTo}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Student Progress
        </Link>
        <div className="flex flex-col items-center gap-3 py-16 text-center rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215]">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <TriangleAlert className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-[14px] font-bold text-gray-900 dark:text-white">Couldn't load track</p>
          <p className="text-[13px] text-gray-500 dark:text-gray-400">Something went wrong fetching this track.</p>
          <button onClick={() => refetch()}
            className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Back */}
      <Link to={backTo}
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Student Progress
      </Link>

      {/* Track header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="h-28 w-44 shrink-0 overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215]">
          {track.image_url ? (
            <img src={track.image_url} alt={track.title} className="h-full w-full object-cover"
              onError={(e) => { e.currentTarget.style.display = "none"; }} />
          ) : (
            <TrackImagePlaceholder seed={track.id} />
          )}
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-1.5">Track</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white" style={{ letterSpacing: "-0.02em" }}>
              {track.title}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-[14px] text-gray-500 dark:text-gray-400">
              <BookOpen className="h-4 w-4 text-[#1c81ff]" />
              <span className="tabular-nums font-extrabold text-gray-900 dark:text-white">{track.total_lessons}</span>
              lessons
            </div>
            <div className="flex items-center gap-1.5 text-[14px] text-gray-500 dark:text-gray-400">
              <Users className="h-4 w-4 text-[#31c7c8]" />
              <span className="tabular-nums font-extrabold text-gray-900 dark:text-white">{track.enrolled_count}</span>
              enrolled
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-600" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by student name…"
            className="h-9 w-48 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 py-1.5 pl-9 pr-3 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
          <SelectTrigger className="h-9 w-36 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 text-[13px] font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as any)}>
          <SelectTrigger className="h-9 w-48 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 text-[13px] font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]" aria-label="Sort students">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="name_asc">Name A–Z</SelectItem>
            <SelectItem value="progress_desc">Progress High to Low</SelectItem>
            <SelectItem value="progress_asc">Progress Low to High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Students table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
        {profiles.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students found"
            description={searchInput ? `No students match "${searchInput}".` : "No students match the current filter."}
          />
        ) : (
          <table className="w-full text-sm bg-white dark:bg-[#0b1215]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Student</th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 sm:table-cell">Status</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Progress</th>
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
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] ${
                      profile.status === "completed"
                        ? "bg-[#00E676]/10 text-[#00E676]"
                        : "bg-[#1c81ff]/10 text-[#1c81ff]"
                    }`}>
                      {profile.status === "completed" ? "Completed" : "In Progress"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <ProgressBar value={profile.progress_percentage} className="w-24 sm:w-36" />
                      <span className="w-10 text-right tabular-nums text-[12px] font-bold text-gray-400 dark:text-gray-600">
                        {profile.progress_percentage}%
                      </span>
                      <span className="hidden text-[12px] text-gray-400 dark:text-gray-600 md:inline">
                        ({profile.completed_lessons}/{profile.total_lessons} lessons)
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3.5 text-right md:table-cell">
                    <span className="tabular-nums font-extrabold text-[#1c81ff]">
                      {profile.points.toLocaleString()}
                      <span className="ml-0.5 text-[11px] font-normal text-gray-400 dark:text-gray-600"> pts</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
