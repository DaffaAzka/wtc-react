import React, { useState } from "react";
import { Link } from "react-router";
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

// ---------------------------------------------------------------------------
// Pagination row
// ---------------------------------------------------------------------------

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
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">
        {from}–{to} of {total}
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
// Profile expand panel — shows that profile's track breakdown
// ---------------------------------------------------------------------------

function ProfileExpandPanel({ profileId }: { profileId: string }) {
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
        Failed to load track data.
      </p>
    );
  }

  if (data.tracks.length === 0) {
    return (
      <p className="px-4 py-3 text-sm text-muted-foreground">
        No tracks enrolled.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {data.tracks.map((track) => (
        <div key={track.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
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
// BY PROFILE TAB — receives all filter state as props
// ---------------------------------------------------------------------------

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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const params = {
    search: search || undefined,
    sort,
    page,
    per_page: 15,
  };

  const { data, isLoading, isError, refetch } = useProgressProfiles(params);

  const profiles = data?.data ?? [];
  const pagination = data?.meta;

  // Client-side status filter
  const filtered =
    statusFilter === "all"
      ? profiles
      : profiles.filter((p) => {
          if (statusFilter === "completed")
            return (
              p.completed_tracks_count > 0 &&
              p.completed_tracks_count >= p.enrolled_tracks_count
            );
          return p.in_progress_tracks_count > 0;
        });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const skeletonRows = Array.from({ length: 8 });

  return (
    <div className="space-y-4">
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
                          {profile.points.toLocaleString()}
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
                        <td colSpan={6} className="p-0 bg-muted/20">
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

// ---------------------------------------------------------------------------
// Track image placeholder
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
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}
    >
      <BookOpen className="h-8 w-8 text-white/70" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Track card
// ---------------------------------------------------------------------------

function TrackCard({
  track,
  to,
}: {
  track: ProgressTrackSummary;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-foreground/20 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Track image */}
      <div className="relative h-32 w-full overflow-hidden bg-muted">
        {track.image_url ? (
          <img
            src={track.image_url}
            alt={track.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <TrackImagePlaceholder seed={track.id} />
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug text-foreground">
          {track.title}
        </h3>

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
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Unenrolled tracks section
// ---------------------------------------------------------------------------

function UnenrolledTracksSection() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useProgressTracks(
    { enrolled: false, per_page: 50 },
    { enabled: open },
  );

  const tracks = open ? (data?.data ?? []) : [];

  return (
    <div className="mt-6 border-t border-border pt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        Tracks with No Enrollments
      </button>

      {open && (
        <div className="mt-3">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-4 space-y-3 opacity-60"
                >
                  <Skeleton className="h-32 w-full rounded" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <p className="text-sm text-muted-foreground">
              Failed to load unenrolled tracks.
            </p>
          ) : tracks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              All tracks have at least one enrollment.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
              {tracks.map((track: ProgressTrackSummary) => (
                <div
                  key={track.id}
                  className="overflow-hidden rounded-lg border border-border bg-card"
                  aria-label={`${track.title} — no enrollments`}
                >
                  <div className="relative h-32 w-full overflow-hidden bg-muted">
                    {track.image_url ? (
                      <img
                        src={track.image_url}
                        alt={track.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <TrackImagePlaceholder seed={track.id} />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 font-semibold leading-snug text-foreground">
                      {track.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                      No students enrolled
                    </p>
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

// ---------------------------------------------------------------------------
// BY TRACKS TAB — receives filter state as props, navigates to detail page
// ---------------------------------------------------------------------------

interface ByTracksTabProps {
  search: string;
  sort: TrackProgressSort;
  page: number;
  trackBasePath: string;
  onPageChange: (page: number) => void;
}

function ByTracksTab({
  search,
  sort,
  page,
  trackBasePath,
  onPageChange,
}: ByTracksTabProps) {
  const params = {
    search: search || undefined,
    sort,
    page,
    per_page: 12,
  };

  const { data, isLoading, isError, refetch } = useProgressTracks(params);

  const tracks = data?.data ?? [];
  const pagination = data?.meta;

  const skeletonCards = Array.from({ length: 6 });

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skeletonCards.map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-border bg-card space-y-3"
            >
              <Skeleton className="h-32 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-1.5 w-full rounded-full" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
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
          {tracks.map((track: ProgressTrackSummary) => (
            <TrackCard
              key={track.id}
              track={track}
              to={`${trackBasePath}/${track.slug}`}
            />
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

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

type MainTab = "profiles" | "tracks";

export default function StudentProgressPage({
  trackBasePath,
}: {
  trackBasePath: string;
}) {
  const [tab, setTab] = useState<MainTab>("profiles");

  // Profile tab filter state
  const [profileSearchInput, setProfileSearchInput] = useState("");
  const profileSearch = useDebounce(profileSearchInput, 400);
  const [profileSort, setProfileSort] = useState<ProfileProgressSort>("name_asc");
  const [profileStatus, setProfileStatus] = useState<
    "all" | "in_progress" | "completed"
  >("all");
  const [profilePage, setProfilePage] = useState(1);

  // Track tab filter state
  const [trackSearchInput, setTrackSearchInput] = useState("");
  const trackSearch = useDebounce(trackSearchInput, 400);
  const [trackSort, setTrackSort] = useState<TrackProgressSort>("title_asc");
  const [trackPage, setTrackPage] = useState(1);

  const handleTabChange = (value: string) => {
    setTab(value as MainTab);
  };

  const handleProfileSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileSearchInput(e.target.value);
    setProfilePage(1);
  };

  const handleProfileSortChange = (value: string) => {
    setProfileSort(value as ProfileProgressSort);
    setProfilePage(1);
  };

  const handleProfileStatusChange = (value: string) => {
    setProfileStatus(value as "all" | "in_progress" | "completed");
    setProfilePage(1);
  };

  const handleTrackSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTrackSearchInput(e.target.value);
    setTrackPage(1);
  };

  const handleTrackSortChange = (value: string) => {
    setTrackSort(value as TrackProgressSort);
    setTrackPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Student Progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor track enrollments and learning progress across all students.
        </p>
      </div>

      {/* Single toolbar row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: View dropdown */}
        <Select value={tab} onValueChange={handleTabChange}>
          <SelectTrigger className="h-8 w-40 text-sm" aria-label="View">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="profiles">By Profile</SelectItem>
            <SelectItem value="tracks">By Tracks</SelectItem>
          </SelectContent>
        </Select>

        {/* Right: inline filter controls for active tab */}
        {tab === "profiles" ? (
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={profileSearchInput}
                onChange={handleProfileSearchChange}
                placeholder="Search by student name…"
                className="h-8 w-48 rounded-md border border-border bg-transparent py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/30"
              />
            </div>
            {/* Sort */}
            <Select value={profileSort} onValueChange={handleProfileSortChange}>
              <SelectTrigger className="h-8 w-48 text-sm" aria-label="Sort profiles">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">Name A–Z</SelectItem>
                <SelectItem value="progress_desc">Progress High to Low</SelectItem>
                <SelectItem value="progress_asc">Progress Low to High</SelectItem>
                <SelectItem value="points_desc">Points High to Low</SelectItem>
              </SelectContent>
            </Select>
            {/* Status */}
            <Select value={profileStatus} onValueChange={handleProfileStatusChange}>
              <SelectTrigger className="h-8 w-36 text-sm" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in_progress">On Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={trackSearchInput}
                onChange={handleTrackSearchChange}
                placeholder="Search by track title…"
                className="h-8 w-48 rounded-md border border-border bg-transparent py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/30"
              />
            </div>
            {/* Sort */}
            <Select value={trackSort} onValueChange={handleTrackSortChange}>
              <SelectTrigger className="h-8 w-52 text-sm" aria-label="Sort tracks">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title_asc">Name A–Z</SelectItem>
                <SelectItem value="avg_progress_desc">Avg Progress High to Low</SelectItem>
                <SelectItem value="avg_progress_asc">Avg Progress Low to High</SelectItem>
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
