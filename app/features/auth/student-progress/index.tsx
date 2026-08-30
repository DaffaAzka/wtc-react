import React, { useState } from "react";
import { useSearchParams } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import type {
  ProfileProgressSort,
  TrackProgressSort,
} from "@/types/student-progress";
import { ByProfileTab } from "./_by-profile-tab";
import { ByTracksTab } from "./_by-tracks-tab";

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
  const [profileSort, setProfileSort] =
    useState<ProfileProgressSort>("name_asc");
  const [profileStatus, setProfileStatus] = useState<
    "all" | "in_progress" | "completed"
  >("all");
  const [profilePage, setProfilePage] = useState(1);

  const [trackSearchInput, setTrackSearchInput] = useState("");
  const trackSearch = useDebounce(trackSearchInput, 400);
  const [trackSort, setTrackSort] = useState<TrackProgressSort>("title_asc");
  const [trackPage, setTrackPage] = useState(1);

  const handleTabChange = (value: string) => {
    setSearchParams((prev) => {
      prev.set("view", value);
      return prev;
    });
  };

  const handleProfileSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
        <Select value={tab} onValueChange={handleTabChange}>
          <SelectTrigger
            className="h-9 w-40 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 text-[13px] font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]"
            aria-label="View">
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
            <Select
              value={profileSort}
              onValueChange={(v) => {
                setProfileSort(v as ProfileProgressSort);
                setProfilePage(1);
              }}>
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
            <Select
              value={profileStatus}
              onValueChange={(v) => {
                setProfileStatus(v as any);
                setProfilePage(1);
              }}>
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
            <Select
              value={trackSort}
              onValueChange={(v) => {
                setTrackSort(v as TrackProgressSort);
                setTrackPage(1);
              }}>
              <SelectTrigger className="h-9 w-52 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 text-[13px] font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="title_asc">Name A–Z</SelectItem>
                <SelectItem value="avg_progress_desc">
                  Avg Progress High–Low
                </SelectItem>
                <SelectItem value="avg_progress_asc">
                  Avg Progress Low–High
                </SelectItem>
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
