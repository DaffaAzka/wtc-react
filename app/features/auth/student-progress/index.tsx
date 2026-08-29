import React, { useState } from "react";
import { Link, useSearchParams } from "react-router";
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Inbox,
  RefreshCw,
  Search,
  TriangleAlert,
  Users,
  BookOpen,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useProgressProfiles,
  useProgressProfile,
  useProgressTracks,
} from "@/hooks/student-progress";
import type {
  ProfileProgressSort,
  TrackProgressSort,
  ProgressProfileSummary,
  ProgressTrackSummary,
} from "@/types/student-progress";
import { resolveAvatar, initials, ProgressBar, EmptyState } from "./_shared";

// ── Pagination row ──────────────────────────────────────────────────────────

function PaginationRow({
  page,
  lastPage,
  total,
  perPage,
  loading,
  onPrev,
  onNext,
}: {
  page: number;
  lastPage: number;
  total: number;
  perPage: number;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (lastPage <= 1) return null;
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-gray-500 dark:text-gray-400">
        {from}–{to}{" "}
        <span className="text-gray-400 dark:text-gray-600">of</span> {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={page === 1 || loading}
          aria-label="Previous page"
          className="flex items-center gap-1 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <span className="tabular-nums text-[13px] font-bold text-gray-500 dark:text-gray-400 px-1">
          {page} / {lastPage}
        </span>
        <button
          onClick={onNext}
          disabled={page === lastPage || loading}
          aria-label="Next page"
          className="flex items-center gap-1 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Profile expand panel ────────────────────────────────────────────────────

function ProfileExpandPanel({ profileId }: { profileId: string }) {
  const { data, isLoading, isError } = useProgressProfile(profileId);

  if (isLoading) {
    return (
      <div className="space-y-2 px-5 py-3 bg-gray-50 dark:bg-white/[0.02]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-3.5 w-40 rounded-lg" />
            <Skeleton className="h-1.5 flex-1 rounded-full" />
            <Skeleton className="h-3.5 w-10 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="px-5 py-3 text-[13px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.02]">
        Failed to load track data.
      </p>
    );
  }

  if (data.tracks.length === 0) {
    return (
      <p className="px-5 py-3 text-[13px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.02]">
        No tracks enrolled.
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-white/5 bg-gray-50 dark:bg-white/[0.02]">
      {data.tracks.map((track) => (
        <div
          key={track.id}
          className="flex items-center gap-3 px-5 py-3"
        >
          <span className="w-48 truncate text-[13px] font-bold text-gray-900 dark:text-white lg:w-64">
            {track.title}
          </span>
          <ProgressBar value={track.progress_percentage} className="flex-1" />
          <span className="w-10 text-right tabular-nums text-[11px] font-bold text-gray-400 dark:text-gray-600">
            {track.progress_percentage}%
          </span>
          <span
            className={`hidden w-24 items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-bold sm:flex ${
              track.status === "completed"
                ? "bg-[#00E676]/10 text-[#00E676]"
                : "bg-[#1c81ff]/10 text-[#1c81ff]"
            }`}
          >
            {track.status === "completed" ? "Completed" : "In Progress"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── By Profile tab ──────────────────────────────────────────────────────────

interface ByProfileTabProps {
  search: string;
  sort: ProfileProgressSort;
  statusFilter: "all" | "in_progress" | "completed";
  page: number;
  onPageChange: (page: number) => void;
}

function ByProfileTab({
  search,
  sort,
  statusFilter,
  page,
  onPageChange,
}: ByProfileTabProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const params = { search: search || undefined, sort, page, per_page: 15 };
  const { data, isLoading, isError, refetch } = useProgressProfiles(params);

  const profiles = data?.data ?? [];
  const pagination = data?.meta;

  const filtered =
    statusFilter === "all"
      ? profiles
      : profiles.filter((p) => {
          if (statusFilter === "completed")
            return p.completed_tracks_count > 0 && p.completed_tracks_count >= p.enrolled_tracks_count;
          return p.in_progress_tracks_count > 0;
        });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const skeletonRows = Array.from({ length: 8 });

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
        {isLoading ? (
          <table className="w-full text-sm bg-white dark:bg-[#0b1215]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                {["Student", "Enrolled", "Completed", "Progress", "Points", ""].map((h, i) => (
                  <th key={i}
                    className={`px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 text-left ${i >= 4 ? "text-right" : ""} ${i === 1 || i === 2 ? "hidden sm:table-cell" : ""} ${i === 3 || i === 4 ? "hidden md:table-cell" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32 rounded-lg" />
                    </div>
                  </td>
                  <td className="hidden px-5 py-3.5 sm:table-cell"><Skeleton className="h-4 w-8 rounded-md" /></td>
                  <td className="hidden px-5 py-3.5 sm:table-cell"><Skeleton className="h-4 w-8 rounded-md" /></td>
                  <td className="hidden px-5 py-3.5 md:table-cell"><Skeleton className="h-1.5 w-full rounded-full" /></td>
                  <td className="hidden px-5 py-3.5 md:table-cell text-right"><Skeleton className="ml-auto h-4 w-12 rounded-md" /></td>
                  <td className="px-5 py-3.5"><Skeleton className="h-4 w-4 rounded-md" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center bg-white dark:bg-[#0b1215]">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <TriangleAlert className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-[14px] text-gray-500 dark:text-gray-400">Couldn't load students.</p>
            <button onClick={() => refetch()}
              className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
              <RefreshCw className="h-3.5 w-3.5" /> Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center bg-white dark:bg-[#0b1215]">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <Inbox className="h-5 w-5 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-[14px] font-bold text-gray-900 dark:text-white">No students found</p>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              {search ? `No students match "${search}".` : "No students to display for this filter."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm bg-white dark:bg-[#0b1215]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Student</th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 sm:table-cell">Enrolled</th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 sm:table-cell">Completed</th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 md:table-cell">Progress</th>
                <th className="hidden px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 md:table-cell">Points</th>
                <th className="w-8 px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((profile: ProgressProfileSummary) => {
                const isExpanded = expandedIds.has(profile.id);
                const progressRatio = profile.overall_progress ?? 0;

                return (
                  <React.Fragment key={profile.id}>
                    <tr
                      className="border-b border-gray-100 dark:border-white/5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      onClick={() => toggleExpand(profile.id)}
                    >
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
                      <td className="hidden px-5 py-3.5 tabular-nums text-[14px] text-gray-500 dark:text-gray-400 sm:table-cell">
                        {profile.enrolled_tracks_count}
                      </td>
                      <td className="hidden px-5 py-3.5 tabular-nums text-[14px] text-gray-500 dark:text-gray-400 sm:table-cell">
                        {profile.completed_tracks_count}
                      </td>
                      <td className="hidden px-5 py-3.5 md:table-cell">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={progressRatio} className="w-24" />
                          <span className="w-9 text-right tabular-nums text-[12px] font-bold text-gray-400 dark:text-gray-600">
                            {progressRatio}%
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3.5 text-right md:table-cell">
                        <span className="tabular-nums font-extrabold text-[#1c81ff]">
                          {profile.points.toLocaleString()}
                          <span className="ml-0.5 text-[11px] font-bold text-gray-400 dark:text-gray-600"> pts</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {isExpanded
                          ? <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                          : <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-600" />}
                      </td>
                    </tr>
                    <tr key={`${profile.id}-expand`}>
                      <td colSpan={6} className="p-0 overflow-hidden">
                        <div className={`overflow-hidden transition-all duration-200 bg-muted/20 ${isExpanded ? "max-h-96" : "max-h-0"}`}>
                          <ProfileExpandPanel profileId={profile.id} />
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {pagination && (
        <PaginationRow
          page={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          perPage={pagination.per_page}
          loading={isLoading}
          onPrev={() => onPageChange(Math.max(1, page - 1))}
          onNext={() => onPageChange(Math.min(pagination.last_page, page + 1))}
        />
      )}
    </div>
  );
}

// ── Track card ──────────────────────────────────────────────────────────────

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

function TrackCard({ track, to }: { track: ProgressTrackSummary; to: string }) {
  return (
    <Link
      to={to}
      className="group overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-36 w-full overflow-hidden">
        {track.image_url ? (
          <img src={track.image_url} alt={track.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <TrackImagePlaceholder seed={track.id} />
        )}
      </div>

      {/* Body */}
      <div className="p-5 space-y-3">
        <h3 className="line-clamp-2 font-extrabold text-[15px] text-gray-900 dark:text-white group-hover:text-[#1c81ff] transition-colors leading-snug" style={{ letterSpacing: "-0.01em" }}>
          {track.title}
        </h3>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-gray-400 dark:text-gray-600">Avg Progress</span>
            <span className="tabular-nums text-[12px] font-extrabold text-[#1c81ff]">
              {track.avg_progress_percentage}%
            </span>
          </div>
          <ProgressBar value={track.avg_progress_percentage} />
        </div>

        <div className="flex items-center gap-4 pt-1 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
            <Users className="h-3.5 w-3.5 text-[#1c81ff]" />
            <span className="tabular-nums font-bold text-gray-900 dark:text-white">{track.enrolled_count}</span>
            {" "}enrolled
          </div>
          <div className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
            <span className="tabular-nums font-bold text-[#00E676]">{track.completed_count}</span>
            {" "}completed
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Unenrolled tracks section ───────────────────────────────────────────────

function UnenrolledTracksSection() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useProgressTracks(
    { enrolled: false, per_page: 50 },
    { enabled: open },
  );
  const tracks = open ? (data?.data ?? []) : [];

  return (
    <div className="border-t border-gray-100 dark:border-white/5 pt-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        Tracks with No Enrollments
      </button>

      {open && (
        <div className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215] overflow-hidden space-y-3 opacity-60">
                  <Skeleton className="h-36 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-40 rounded-lg" />
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <p className="text-[13px] text-gray-500 dark:text-gray-400">Failed to load unenrolled tracks.</p>
          ) : tracks.length === 0 ? (
            <p className="text-[13px] text-gray-500 dark:text-gray-400">All tracks have at least one enrollment.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
              {tracks.map((track: ProgressTrackSummary) => (
                <div key={track.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215]"
                  aria-label={`${track.title} — no enrollments`}
                >
                  <div className="relative h-36 w-full overflow-hidden">
                    {track.image_url ? (
                      <img src={track.image_url} alt={track.title} className="h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    ) : (
                      <TrackImagePlaceholder seed={track.id} />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 font-bold text-[14px] text-gray-900 dark:text-white">{track.title}</h3>
                    <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400">No students enrolled</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── By Tracks tab ───────────────────────────────────────────────────────────

interface ByTracksTabProps {
  search: string;
  sort: TrackProgressSort;
  page: number;
  trackBasePath: string;
  onPageChange: (page: number) => void;
}

function ByTracksTab({ search, sort, page, trackBasePath, onPageChange }: ByTracksTabProps) {
  const params = { search: search || undefined, sort, page, per_page: 12 };
  const { data, isLoading, isError, refetch } = useProgressTracks(params);

  const tracks = data?.data ?? [];
  const pagination = data?.meta;

  return (
    <div className="space-y-5">
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215] overflow-hidden">
              <Skeleton className="h-36 w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-40 rounded-lg" />
                <Skeleton className="h-1.5 w-full rounded-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-3.5 w-20 rounded-md" />
                  <Skeleton className="h-3.5 w-20 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215]">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <TriangleAlert className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-[14px] text-gray-500 dark:text-gray-400">Couldn't load tracks.</p>
          <button onClick={() => refetch()}
            className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215]">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
            <Inbox className="h-5 w-5 text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-[14px] font-bold text-gray-900 dark:text-white">No tracks found</p>
          <p className="text-[13px] text-gray-500 dark:text-gray-400">
            {search ? `No tracks match "${search}".` : "No tracks with enrollments yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track: ProgressTrackSummary) => (
            <TrackCard key={track.id} track={track} to={`${trackBasePath}/${track.slug}`} />
          ))}
        </div>
      )}

      {pagination && (
        <PaginationRow
          page={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          perPage={pagination.per_page}
          loading={isLoading}
          onPrev={() => onPageChange(Math.max(1, page - 1))}
          onNext={() => onPageChange(Math.min(pagination.last_page, page + 1))}
        />
      )}

      <UnenrolledTracksSection />
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

type MainTab = "profiles" | "tracks";

export default function StudentProgressPage({
  trackBasePath,
}: {
  trackBasePath: string;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get("view") as MainTab) ?? "profiles";

  const [profileSearchInput, setProfileSearchInput] = useState("");
  const profileSearch = useDebounce(profileSearchInput, 400);
  const [profileSort, setProfileSort] = useState<ProfileProgressSort>("name_asc");
  const [profileStatus, setProfileStatus] = useState<"all" | "in_progress" | "completed">("all");
  const [profilePage, setProfilePage] = useState(1);

  const [trackSearchInput, setTrackSearchInput] = useState("");
  const trackSearch = useDebounce(trackSearchInput, 400);
  const [trackSort, setTrackSort] = useState<TrackProgressSort>("title_asc");
  const [trackPage, setTrackPage] = useState(1);

  const handleTabChange = (value: string) => {
    setSearchParams((prev) => { prev.set("view", value); return prev; });
  };

  const handleProfileSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileSearchInput(e.target.value);
    setProfilePage(1);
  };
  const handleTrackSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrackSearchInput(e.target.value);
    setTrackPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: tab selector */}
        <Select value={tab} onValueChange={(v) => setTab(v as MainTab)}>
          <SelectTrigger className="h-9 w-40 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 text-[13px] font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]" aria-label="View">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="profiles">By Profile</SelectItem>
            <SelectItem value="tracks">By Tracks</SelectItem>
          </SelectContent>
        </Select>

        {/* Right: filters */}
        {tab === "profiles" ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-600" />
              <input
                value={profileSearchInput}
                onChange={handleProfileSearchChange}
                placeholder="Search by student name…"
                className="h-9 w-48 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 py-1.5 pl-9 pr-3 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
              />
            </div>
            <Select value={profileSort} onValueChange={(v) => { setProfileSort(v as ProfileProgressSort); setProfilePage(1); }}>
              <SelectTrigger className="h-9 w-48 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 text-[13px] font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="name_asc">Name A–Z</SelectItem>
                <SelectItem value="progress_desc">Progress High–Low</SelectItem>
                <SelectItem value="progress_asc">Progress Low–High</SelectItem>
                <SelectItem value="points_desc">Points High–Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={profileStatus} onValueChange={(v) => { setProfileStatus(v as any); setProfilePage(1); }}>
              <SelectTrigger className="h-9 w-36 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 text-[13px] font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in_progress">On Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-600" />
              <input
                value={trackSearchInput}
                onChange={handleTrackSearchChange}
                placeholder="Search by track title…"
                className="h-9 w-48 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 py-1.5 pl-9 pr-3 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
              />
            </div>
            <Select value={trackSort} onValueChange={(v) => { setTrackSort(v as TrackProgressSort); setTrackPage(1); }}>
              <SelectTrigger className="h-9 w-52 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 text-[13px] font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="title_asc">Name A–Z</SelectItem>
                <SelectItem value="avg_progress_desc">Avg Progress High–Low</SelectItem>
                <SelectItem value="avg_progress_asc">Avg Progress Low–High</SelectItem>
                <SelectItem value="enrolled_desc">Most Enrolled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Tab content */}
      {tab === "profiles" ? (
        <ByProfileTab
          search={profileSearch}
          sort={profileSort}
          statusFilter={profileStatus}
          page={profilePage}
          onPageChange={setProfilePage}
        />
      ) : (
        <ByTracksTab
          search={trackSearch}
          sort={trackSort}
          page={trackPage}
          trackBasePath={trackBasePath}
          onPageChange={setTrackPage}
        />
      )}
    </div>
  );
}
