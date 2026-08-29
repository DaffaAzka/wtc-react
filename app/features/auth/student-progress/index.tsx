import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useProgressProfiles,
  useProgressProfile,
  useProgressTracks,
  useProgressTrack,
} from "@/hooks/student-progress";
import type {
  ProfileProgressSort,
  TrackProgressSort,
  ProgressAvatar,
  ProgressProfileSummary,
  ProgressTrackSummary,
} from "@/types/student-progress";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveAvatar(avatar: ProgressAvatar): string | undefined {
  if (!avatar) return undefined;
  if (typeof avatar === "string") return avatar;
  return avatar.url;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

function ProgressBar({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  const color =
    pct >= 100
      ? "bg-emerald-500"
      : pct >= 60
        ? "bg-blue-500"
        : pct >= 30
          ? "bg-amber-500"
          : "bg-muted-foreground/40";
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-muted ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagination controls (shared)
// ---------------------------------------------------------------------------

function PaginationRow({
  page,
  lastPage,
  from,
  to,
  total,
  loading,
  onPrev,
  onNext,
}: {
  page: number;
  lastPage: number;
  from: number | null;
  to: number | null;
  total: number;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (lastPage <= 1) return null;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">
        {from ?? 0}–{to ?? 0} of {total}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={page === 1 || loading}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="tabular-nums text-muted-foreground">
          {page} / {lastPage}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page === lastPage || loading}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty / error states
// ---------------------------------------------------------------------------

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Inbox;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile row expand panel — fetches detail on demand
// ---------------------------------------------------------------------------

function ProfileExpandPanel({ profileId }: { profileId: number }) {
  const { data, isLoading, isError } = useProgressProfile(profileId);

  if (isLoading) {
    return (
      <div className="space-y-2 px-4 py-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-1.5 flex-1 rounded-full" />
            <Skeleton className="h-3.5 w-10" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="px-4 py-3 text-sm text-muted-foreground">
        Failed to load track progress.
      </p>
    );
  }

  if (data.tracks.length === 0) {
    return (
      <p className="px-4 py-3 text-sm text-muted-foreground">
        No track enrollments found.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border bg-muted/20">
      {data.tracks.map((track) => (
        <div
          key={track.id}
          className="flex items-center gap-3 px-6 py-2.5 text-sm"
        >
          <span className="w-48 truncate font-medium text-foreground lg:w-64">
            {track.title}
          </span>
          <ProgressBar value={track.progress_percentage} className="flex-1" />
          <span className="w-10 text-right tabular-nums text-xs text-muted-foreground">
            {track.progress_percentage}%
          </span>
          <Badge
            variant={track.status === "completed" ? "default" : "secondary"}
            className="hidden w-24 justify-center text-xs sm:flex"
          >
            {track.status === "completed" ? "Completed" : "In Progress"}
          </Badge>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Track card expand panel — fetches detail on demand
// ---------------------------------------------------------------------------

function TrackExpandPanel({ trackSlug }: { trackSlug: string }) {
  const { data, isLoading, isError } = useProgressTrack(trackSlug);

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-1.5 flex-1 rounded-full" />
            <Skeleton className="h-3.5 w-10" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        Failed to load enrolled students.
      </p>
    );
  }

  if (data.profiles.length === 0) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        No students enrolled in this track.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {data.profiles.map((profile) => (
        <div
          key={profile.id}
          className="flex items-center gap-3 p-3 text-sm"
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage
              src={resolveAvatar(profile.avatar)}
              alt={profile.display_name}
            />
            <AvatarFallback className="text-xs">
              {initials(profile.display_name)}
            </AvatarFallback>
          </Avatar>
          <span className="w-36 truncate font-medium text-foreground lg:w-48">
            {profile.display_name}
          </span>
          <ProgressBar
            value={profile.progress_percentage}
            className="flex-1"
          />
          <span className="w-10 text-right tabular-nums text-xs text-muted-foreground">
            {profile.progress_percentage}%
          </span>
          <Badge
            variant={profile.status === "completed" ? "default" : "secondary"}
            className="hidden w-24 justify-center text-xs sm:flex"
          >
            {profile.status === "completed" ? "Completed" : "In Progress"}
          </Badge>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BY PROFILE TAB
// ---------------------------------------------------------------------------

function ByProfileTab() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [sort, setSort] = useState<ProfileProgressSort>("name_asc");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "in_progress" | "completed"
  >("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const params = {
    search: search || undefined,
    sort,
    page,
    per_page: 15,
  };

  const { data, isLoading, isError, refetch } = useProgressProfiles(params);

  const profiles = data?.profiles ?? [];
  const pagination = data?.pagination;

  // Client-side status filter (server doesn't filter profiles by status,
  // only the profile detail endpoint does — so we filter after fetch)
  const filtered =
    statusFilter === "all"
      ? profiles
      : profiles.filter((p) => {
          if (statusFilter === "completed")
            return p.completed_tracks_count > 0 &&
              p.completed_tracks_count >= p.enrolled_tracks_count;
          return p.in_progress_tracks_count > 0;
        });

  const handleSortChange = (value: string) => {
    setSort(value as ProfileProgressSort);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setPage(1);
  };

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const skeletonRows = Array.from({ length: 8 });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search by student name…"
            className="w-full rounded-md border border-border bg-transparent py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/30"
          />
        </div>

        {/* Sort */}
        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-52" aria-label="Sort profiles">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Name A–Z</SelectItem>
            <SelectItem value="progress_desc">Progress High to Low</SelectItem>
            <SelectItem value="progress_asc">Progress Low to High</SelectItem>
            <SelectItem value="points_desc">Points High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
        {(
          [
            { value: "all", label: "All" },
            { value: "in_progress", label: "On Progress" },
            { value: "completed", label: "Completed" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border border-border">
        {isLoading ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Student</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Enrolled</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">Completed</th>
                <th className="px-4 py-2.5 font-medium">Progress</th>
                <th className="hidden px-4 py-2.5 text-right font-medium md:table-cell">Points</th>
                <th className="w-8 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {skeletonRows.map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </td>
                  <td className="hidden px-4 py-3 text-right md:table-cell">
                    <Skeleton className="ml-auto h-4 w-12" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : isError ? (
          <EmptyState
            icon={TriangleAlert}
            title="Couldn't load students"
            description="Something went wrong while fetching student progress."
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Try again
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No students found"
            description={
              search
                ? `No students match "${search}".`
                : "No students to display for this filter."
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Student</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Enrolled</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">Completed</th>
                <th className="px-4 py-2.5 font-medium">Progress</th>
                <th className="hidden px-4 py-2.5 text-right font-medium md:table-cell">Points</th>
                <th className="w-8 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((profile: ProgressProfileSummary) => {
                const isExpanded = expandedId === profile.id;
                const progressRatio =
                  profile.enrolled_tracks_count > 0
                    ? Math.round(
                        (profile.completed_tracks_count /
                          profile.enrolled_tracks_count) *
                          100,
                      )
                    : 0;

                return (
                  <React.Fragment key={profile.id}>
                    <tr
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => toggleExpand(profile.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage
                              src={resolveAvatar(profile.avatar)}
                              alt={profile.display_name}
                            />
                            <AvatarFallback className="text-xs">
                              {initials(profile.display_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">
                            {profile.display_name}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span className="tabular-nums text-muted-foreground">
                          {profile.enrolled_tracks_count}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="tabular-nums text-muted-foreground">
                          {profile.completed_tracks_count}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={progressRatio} className="w-24" />
                          <span className="w-8 text-right tabular-nums text-xs text-muted-foreground">
                            {progressRatio}%
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-right md:table-cell">
                        <span className="tabular-nums font-medium text-blue-600 dark:text-blue-400">
                          {profile.total_points.toLocaleString()}
                          <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                            pts
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${profile.id}-expand`}>
                        <td colSpan={6} className="p-0">
                          <ProfileExpandPanel profileId={profile.id} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <PaginationRow
          page={pagination.current_page}
          lastPage={pagination.last_page}
          from={pagination.from}
          to={pagination.to}
          total={pagination.total}
          loading={isLoading}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() =>
            setPage((p) => Math.min(pagination.last_page, p + 1))
          }
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BY TRACKS TAB
// ---------------------------------------------------------------------------

function ByTracksTab() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [sort, setSort] = useState<TrackProgressSort>("title_asc");
  const [page, setPage] = useState(1);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const params = {
    search: search || undefined,
    sort,
    page,
    per_page: 12,
  };

  const { data, isLoading, isError, refetch } = useProgressTracks(params);

  const tracks = data?.tracks ?? [];
  const pagination = data?.pagination;

  const handleSortChange = (value: string) => {
    setSort(value as TrackProgressSort);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setPage(1);
  };

  const toggleExpand = (slug: string) => {
    setExpandedSlug((prev) => (prev === slug ? null : slug));
  };

  const skeletonCards = Array.from({ length: 6 });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search by track title…"
            className="w-full rounded-md border border-border bg-transparent py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/30"
          />
        </div>

        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-56" aria-label="Sort tracks">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title_asc">Name A–Z</SelectItem>
            <SelectItem value="avg_progress_desc">
              Avg Progress High to Low
            </SelectItem>
            <SelectItem value="avg_progress_asc">
              Avg Progress Low to High
            </SelectItem>
            <SelectItem value="enrolled_desc">Most Enrolled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skeletonCards.map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-4 space-y-3"
            >
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-1.5 w-full rounded-full" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={TriangleAlert}
          title="Couldn't load tracks"
          description="Something went wrong while fetching track progress."
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Try again
            </Button>
          }
        />
      ) : tracks.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No tracks found"
          description={
            search
              ? `No tracks match "${search}".`
              : "No tracks with enrollments yet."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track: ProgressTrackSummary) => {
            const isExpanded = expandedSlug === track.slug;
            return (
              <div
                key={track.id}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                {/* Card header — clickable */}
                <button
                  type="button"
                  className="w-full p-4 text-left hover:bg-muted/40 transition-colors"
                  onClick={() => toggleExpand(track.slug)}
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
                      {track.title}
                    </h3>
                    {isExpanded ? (
                      <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Avg Progress</span>
                      <span className="tabular-nums font-medium text-foreground">
                        {track.avg_progress_percentage}%
                      </span>
                    </div>
                    <ProgressBar value={track.avg_progress_percentage} />
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        <span className="tabular-nums font-medium text-foreground">
                          {track.enrolled_count}
                        </span>{" "}
                        enrolled
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>
                        <span className="tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                          {track.completed_count}
                        </span>{" "}
                        completed
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded student list */}
                {isExpanded && (
                  <div className="border-t border-border">
                    <TrackExpandPanel trackSlug={track.slug} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <PaginationRow
          page={pagination.current_page}
          lastPage={pagination.last_page}
          from={pagination.from}
          to={pagination.to}
          total={pagination.total}
          loading={isLoading}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() =>
            setPage((p) => Math.min(pagination.last_page, p + 1))
          }
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

type MainTab = "profiles" | "tracks";

export default function StudentProgressPage() {
  const [tab, setTab] = useState<MainTab>("profiles");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Student Progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor track enrollments and learning progress across all students.
        </p>
      </div>

      {/* Main tabs — same pill/border style used across admin pages */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab("profiles")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "profiles"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          By Profile
        </button>
        <button
          type="button"
          onClick={() => setTab("tracks")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "tracks"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          By Tracks
        </button>
      </div>

      {/* Tab content */}
      {tab === "profiles" ? <ByProfileTab /> : <ByTracksTab />}
    </div>
  );
}
