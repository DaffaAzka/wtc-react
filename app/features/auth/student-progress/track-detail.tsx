import React, { useState } from "react";
import { useNavigate } from "react-router";
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
// Track image placeholder — reuse same gradients as index
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
      <BookOpen className="h-10 w-10 text-white/70" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Track detail component
// ---------------------------------------------------------------------------

interface TrackDetailProps {
  /** Track slug from URL params */
  slug: string;
  /** Kept for backwards compatibility — back button now uses navigate(-1) */
  backTo?: string;
}

export default function TrackDetail({ slug }: TrackDetailProps) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<"all" | "in_progress" | "completed">(
    "all",
  );
  const [sort, setSort] = useState<
    "progress_desc" | "progress_asc" | "name_asc"
  >("name_asc");

  const params: GetProgressTrackDetailParams = {
    status: status === "all" ? undefined : status,
    sort,
  };

  const { data, isLoading, isError, refetch } = useProgressTrack(slug, params);

  const track = data?.track;
  const allProfiles = data?.profiles ?? [];

  // Client-side search filter (name search)
  const profiles = searchInput.trim()
    ? allProfiles.filter((p) =>
        p.display_name
          .toLowerCase()
          .includes(searchInput.trim().toLowerCase()),
      )
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
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      ) : isError || !track ? (
        <EmptyState
          icon={TriangleAlert}
          title="Couldn't load track"
          description="Something went wrong fetching this track."
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Try again
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {/* Track image */}
            <div className="h-24 w-36 shrink-0 overflow-hidden rounded-lg bg-muted">
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

            {/* Track meta */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {track.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>
                    <span className="tabular-nums font-medium text-foreground">
                      {track.total_lessons}
                    </span>{" "}
                    lessons
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>
                    <span className="tabular-nums font-medium text-foreground">
                      {track.enrolled_count}
                    </span>{" "}
                    enrolled
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by student name…"
                className="h-8 w-48 rounded-md border border-border bg-transparent py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/30"
              />
            </div>
            {/* Status */}
            <Select
              value={status}
              onValueChange={(v) =>
                setStatus(v as "all" | "in_progress" | "completed")
              }
            >
              <SelectTrigger
                className="h-8 w-36 text-sm"
                aria-label="Filter by status"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            {/* Sort */}
            <Select
              value={sort}
              onValueChange={(v) =>
                setSort(v as "progress_desc" | "progress_asc" | "name_asc")
              }
            >
              <SelectTrigger
                className="h-8 w-52 text-sm"
                aria-label="Sort students"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">Name A–Z</SelectItem>
                <SelectItem value="progress_desc">
                  Progress High to Low
                </SelectItem>
                <SelectItem value="progress_asc">
                  Progress Low to High
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enrolled profiles table */}
          <div className="overflow-hidden rounded-md border border-border">
            {isLoading ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Student</th>
                    <th className="hidden px-4 py-2.5 font-medium sm:table-cell">
                      Status
                    </th>
                    <th className="px-4 py-2.5 font-medium">Progress</th>
                    <th className="hidden px-4 py-2.5 text-right font-medium md:table-cell">
                      Points
                    </th>
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
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-1.5 w-full rounded-full" />
                      </td>
                      <td className="hidden px-4 py-3 text-right md:table-cell">
                        <Skeleton className="ml-auto h-4 w-12" />
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
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Student</th>
                    <th className="hidden px-4 py-2.5 font-medium sm:table-cell">
                      Status
                    </th>
                    <th className="px-4 py-2.5 font-medium">Progress</th>
                    <th className="hidden px-4 py-2.5 text-right font-medium md:table-cell">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {profiles.map((profile: TrackProfileProgress) => (
                    <tr key={profile.id} className="hover:bg-muted/30">
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
                        <Badge
                          variant={
                            profile.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {profile.status === "completed"
                            ? "Completed"
                            : "In Progress"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            value={profile.progress_percentage}
                            className="w-24 sm:w-36"
                          />
                          <span className="w-10 text-right tabular-nums text-xs text-muted-foreground">
                            {profile.progress_percentage}%
                          </span>
                          <span className="hidden text-xs text-muted-foreground md:inline">
                            ({profile.completed_lessons}/{profile.total_lessons}{" "}
                            lessons)
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
