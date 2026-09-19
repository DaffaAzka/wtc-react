import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronUp,
  Inbox,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import {
  useProgressProfiles,
  useProgressProfile,
} from "@/hooks/student-progress";
import type {
  ProfileProgressSort,
  ProgressProfileSummary,
} from "@/types/student-progress";
import { resolveAvatar, initials, ProgressBar } from "./_shared";
import { PaginationRow } from "./_pagination-row";

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
        <div key={track.id} className="flex items-center gap-3 px-5 py-3">
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

export interface ByProfileTabProps {
  search: string;
  sort: ProfileProgressSort;
  statusFilter: "all" | "in_progress" | "completed";
  page: number;
  onPageChange: (page: number) => void;
}

export function ByProfileTab({
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
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
        {isLoading ? (
          <table className="w-full text-sm bg-white dark:bg-[#0b1215]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                {["Student", "Enrolled", "Completed", "Progress", "Points", ""].map((h, i) => (
                  <th
                    key={i}
                    className={`px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 text-left ${i >= 4 ? "text-right" : ""} ${i === 1 || i === 2 ? "hidden sm:table-cell" : ""} ${i === 3 || i === 4 ? "hidden md:table-cell" : ""}`}
                  >
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
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
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
