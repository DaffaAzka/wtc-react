import { useState, useEffect } from "react";
import { Search, Award, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCertificates } from "@/hooks/certificate";
import { api } from "@/lib/axios";
import type { Track } from "@/types/model";

// ── Grade badge ───────────────────────────────────────────────────────────────

const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  "A+": { bg: "bg-[#00E676]/10", text: "text-[#00E676]" },
  "A":  { bg: "bg-[#00E676]/10", text: "text-[#00E676]" },
  "B+": { bg: "bg-[#1c81ff]/10", text: "text-[#1c81ff]" },
  "B":  { bg: "bg-[#1c81ff]/10", text: "text-[#1c81ff]" },
  "C+": { bg: "bg-[#f6b60b]/10", text: "text-[#f6b60b]" },
  "C":  { bg: "bg-[#f6b60b]/10", text: "text-[#f6b60b]" },
  "D":  { bg: "bg-[#ff007b]/10", text: "text-[#ff007b]" },
  "F":  { bg: "bg-red-500/10",   text: "text-red-500" },
};

function GradeBadge({ grade }: { grade: string }) {
  const c = GRADE_COLORS[grade] ?? { bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-500 dark:text-gray-400" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide ${c.bg} ${c.text}`}>
      {grade}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminCertificates() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [profileSearch, setProfileSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(profileSearch); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [profileSearch]);

  // Load tracks for filter
  useEffect(() => {
    api.get("/tracks").then((r) => setTracks(r.data?.data ?? [])).catch(() => {});
  }, []);

  const { certificates, pagination, loading } = useAdminCertificates({
    page,
    per_page: 15,
    track_id: trackFilter !== "all" ? Number(trackFilter) : undefined,
    profile_search: debouncedSearch || undefined,
  });

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Header */}
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
          Admin
        </p>
        <h1
          className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          Certificates
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
          View and manage all issued student certificates.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by student name…"
            value={profileSearch}
            onChange={(e) => setProfileSearch(e.target.value)}
            className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 pl-10 pr-4 py-2.5 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
          />
        </div>
        <Select value={trackFilter} onValueChange={(v) => { setTrackFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-52 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
            <SelectValue placeholder="Filter by track" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All Tracks</SelectItem>
            {tracks.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>{t.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
              {["Student", "Track", "Grade", "Issued", "Certificate #"].map((h, i) => (
                <th
                  key={h}
                  className={`px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 text-left ${i >= 3 ? "hidden md:table-cell" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#0b1215] divide-y divide-gray-100 dark:divide-white/5">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className={`px-5 py-3.5 ${j >= 3 ? "hidden md:table-cell" : ""}`}>
                      <Skeleton className="h-4 w-full rounded-lg" />
                    </td>
                  ))}
                </tr>
              ))
            ) : certificates.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                      <Inbox className="h-6 w-6 text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-[14px] text-gray-500 dark:text-gray-400">No certificates found</p>
                  </div>
                </td>
              </tr>
            ) : (
              certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1c81ff]/10 flex items-center justify-center shrink-0">
                        <Award className="h-4 w-4 text-[#1c81ff]" />
                      </div>
                      <div>
                        <div className="font-bold text-[14px] text-gray-900 dark:text-white">
                          {(cert as any).profile?.display_name ?? "—"}
                        </div>
                        <div className="text-[12px] text-gray-400 dark:text-gray-500">
                          {(cert as any).profile?.email ?? ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {cert.track.image_url && (
                        <img
                          src={cert.track.image_url}
                          alt={cert.track.title}
                          className="w-6 h-6 rounded object-cover shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      <span className="font-medium text-[14px] text-gray-900 dark:text-white truncate max-w-[160px]">
                        {cert.track.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <GradeBadge grade={cert.grade} />
                      <span className="text-[12px] text-gray-400 dark:text-gray-500 tabular-nums">
                        {cert.grade_score.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-5 py-3.5 text-[13px] text-gray-500 dark:text-gray-400 tabular-nums">
                    {formatDate(cert.issued_at)}
                  </td>
                  <td className="hidden md:table-cell px-5 py-3.5">
                    <span className="font-mono text-[12px] text-gray-400 dark:text-gray-500">
                      #{cert.certificate_number}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-gray-500 dark:text-gray-400">
            {pagination.from ?? 0}–{pagination.to ?? 0} of {pagination.total} certificates
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-[13px] font-bold text-gray-700 dark:text-gray-300">
              {page} / {pagination.last_page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
              disabled={page === pagination.last_page}
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
