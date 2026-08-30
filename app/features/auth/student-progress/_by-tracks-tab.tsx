import { useState } from "react";
import { Link } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Inbox,
  RefreshCw,
  TriangleAlert,
  Users,
} from "lucide-react";
import { useProgressTracks } from "@/hooks/student-progress";
import type {
  TrackProgressSort,
  ProgressTrackSummary,
} from "@/types/student-progress";
import { ProgressBar } from "./_shared";
import { PaginationRow } from "./_pagination-row";

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
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}>
      <BookOpen className="h-8 w-8 text-white/50" />
    </div>
  );
}

function TrackCard({ track, to }: { track: ProgressTrackSummary; to: string }) {
  return (
    <Link
      to={to}
      className="group overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-36 w-full overflow-hidden">
        {track.image_url ? (
          <img
            src={track.image_url}
            alt={track.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <TrackImagePlaceholder seed={track.id} />
        )}
      </div>

      <div className="p-5 space-y-3">
        <h3
          className="line-clamp-2 font-extrabold text-[15px] text-gray-900 dark:text-white group-hover:text-[#1c81ff] transition-colors leading-snug"
          style={{ letterSpacing: "-0.01em" }}>
          {track.title}
        </h3>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-gray-400 dark:text-gray-600">
              Avg Progress
            </span>
            <span className="tabular-nums text-[12px] font-extrabold text-[#1c81ff]">
              {track.avg_progress_percentage}%
            </span>
          </div>
          <ProgressBar value={track.avg_progress_percentage} />
        </div>

        <div className="flex items-center gap-4 pt-1 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
            <Users className="h-3.5 w-3.5 text-[#1c81ff]" />
            <span className="tabular-nums font-bold text-gray-900 dark:text-white">
              {track.enrolled_count}
            </span>{" "}
            enrolled
          </div>
          <div className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-gray-400">
            <span className="tabular-nums font-bold text-[#00E676]">
              {track.completed_count}
            </span>{" "}
            completed
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
        className="flex items-center gap-2 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        Tracks with No Enrollments
      </button>

      {open && (
        <div className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215] overflow-hidden space-y-3 opacity-60">
                  <Skeleton className="h-36 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-40 rounded-lg" />
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              Failed to load unenrolled tracks.
            </p>
          ) : tracks.length === 0 ? (
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              All tracks have at least one enrollment.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
              {tracks.map((track: ProgressTrackSummary) => (
                <div
                  key={track.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215]"
                  aria-label={`${track.title} — no enrollments`}>
                  <div className="relative h-36 w-full overflow-hidden">
                    {track.image_url ? (
                      <img
                        src={track.image_url}
                        alt={track.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <TrackImagePlaceholder seed={track.id} />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 font-bold text-[14px] text-gray-900 dark:text-white">
                      {track.title}
                    </h3>
                    <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400">
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

export interface ByTracksTabProps {
  search: string;
  sort: TrackProgressSort;
  page: number;
  trackBasePath: string;
  onPageChange: (page: number) => void;
}

export function ByTracksTab({
  search,
  sort,
  page,
  trackBasePath,
  onPageChange,
}: ByTracksTabProps) {
  const params = { search: search || undefined, sort, page, per_page: 12 };
  const { data, isLoading, isError, refetch } = useProgressTracks(params);

  const tracks = data?.data ?? [];
  const pagination = data?.meta;

  return (
    <div className="space-y-5">
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215] overflow-hidden">
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
          <p className="text-[14px] text-gray-500 dark:text-gray-400">
            Couldn't load tracks.
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215]">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
            <Inbox className="h-5 w-5 text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-[14px] font-bold text-gray-900 dark:text-white">
            No tracks found
          </p>
          <p className="text-[13px] text-gray-500 dark:text-gray-400">
            {search
              ? `No tracks match "${search}".`
              : "No tracks with enrollments yet."}
          </p>
        </div>
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
