import { useState, useMemo, useEffect } from "react";
import { useAllMySubmissions, useGetSubmissionFile } from "@/hooks/submission";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Download,
  Eye,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { SubmissionDetail } from "@/types/submission";

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string; icon: typeof Clock }> = {
  submitted: { bg: "bg-[#f6b60b]/10",  text: "text-[#f6b60b]",  dot: "bg-[#f6b60b]",  icon: Clock },
  graded:    { bg: "bg-[#00E676]/10",  text: "text-[#00E676]",  dot: "bg-[#00E676]",  icon: CheckCircle2 },
  returned:  { bg: "bg-[#1c81ff]/10",  text: "text-[#1c81ff]",  dot: "bg-[#1c81ff]",  icon: AlertCircle },
  draft:     { bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-500 dark:text-gray-400", dot: "bg-gray-400", icon: Clock },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

export default function MySubmissions() {
  const { data: submissions, isLoading, error } = useAllMySubmissions();
  const downloadFile = useGetSubmissionFile();

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null);
  const [mounted, setMounted] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    let filtered = [...submissions];
    if (statusFilter !== "all") filtered = filtered.filter((s) => s.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((s) => s.challenge?.title?.toLowerCase().includes(q));
    }
    return filtered.sort((a, b) => {
      const aT = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
      const bT = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
      return bT - aT;
    });
  }, [submissions, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginated = filteredSubmissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = useMemo(() => {
    if (!submissions) return { total: 0, submitted: 0, graded: 0, returned: 0 };
    return {
      total: submissions.length,
      submitted: submissions.filter((s) => s.status === "submitted").length,
      graded: submissions.filter((s) => s.status === "graded").length,
      returned: submissions.filter((s) => s.status === "returned").length,
    };
  }, [submissions]);

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-8 flex flex-col items-center gap-3 text-center">
        <XCircle className="h-10 w-10 text-red-500" />
        <p className="text-[15px] text-red-600 dark:text-red-400">{error.message || "Gagal memuat data submisi."}</p>
        <button onClick={() => window.location.reload()} className="bg-transparent border-[1.5px] border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 font-bold rounded-xl px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-500/5 transition-all">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-8 transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {/* Header */}
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Student</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
          Submisi Saya
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
          Riwayat pengiriman tugas dan tantangan yang telah kamu kerjakan.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Submisi",    value: stats.total,     icon: FileText,    bg: "bg-[#1c81ff]/10",  color: "text-[#1c81ff]" },
          { label: "Menunggu Review",  value: stats.submitted, icon: Clock,       bg: "bg-[#f6b60b]/10",  color: "text-[#f6b60b]" },
          { label: "Telah Dinilai",    value: stats.graded,    icon: CheckCircle2,bg: "bg-[#00E676]/10",  color: "text-[#00E676]" },
          { label: "Dikembalikan",     value: stats.returned,  icon: AlertCircle, bg: "bg-[#31c7c8]/10",  color: "text-[#31c7c8]" },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
              {isLoading ? <span className="inline-block h-8 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" /> : value}
            </div>
            <div className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#0b1215] px-5 py-3.5">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-600 pointer-events-none" />
            <input
              placeholder="Cari tantangan…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 pl-9 pr-3 py-2 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-40 h-9 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 text-[13px] font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-[#0b1215]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-4 w-48 rounded-lg" />
                <Skeleton className="hidden sm:block h-4 w-24 rounded-lg" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="ml-auto h-4 w-8 rounded-md" />
              </div>
            ))}
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center bg-white dark:bg-[#0b1215]">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <Inbox className="h-5 w-5 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-[14px] font-bold text-gray-900 dark:text-white">Tidak ada submisi</p>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              {searchQuery || statusFilter !== "all" ? "Coba ubah filter pencarian." : "Kamu belum mengirimkan tantangan apapun."}
            </p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm bg-white dark:bg-[#0b1215]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Tantangan</th>
                  <th className="hidden sm:table-cell px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Tanggal</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Status</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Nilai</th>
                  <th className="w-16 px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {paginated.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-[14px] text-gray-900 dark:text-white">
                        {sub.challenge?.title || "Untitled"}
                      </div>
                      {sub.feedback && (
                        <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{sub.feedback}</p>
                      )}
                    </td>
                    <td className="hidden sm:table-cell px-5 py-3.5 text-[13px] text-gray-500 dark:text-gray-400 tabular-nums">
                      {sub.submitted_at
                        ? format(new Date(sub.submitted_at), "dd MMM yyyy", { locale: localeId })
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={sub.status ?? "submitted"} />
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums font-bold text-[14px]">
                      {sub.score !== null && sub.score !== undefined
                        ? <span className="text-[#1c81ff]">{sub.score}</span>
                        : <span className="text-gray-400 dark:text-gray-600">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedSubmission(sub)}
                          className="flex items-center justify-center h-7 w-7 rounded-lg text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        {sub.file_path && (
                          <button onClick={() => downloadFile.mutate(sub.id!)} disabled={downloadFile.isPending}
                            className="flex items-center justify-center h-7 w-7 rounded-lg text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-40 transition-colors">
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#0b1215] px-5 py-3.5">
                <span className="text-[13px] text-gray-500 dark:text-gray-400">
                  {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredSubmissions.length)}{" "}
                  <span className="text-gray-400 dark:text-gray-600">dari</span>{" "}
                  {filteredSubmissions.length}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="flex items-center gap-1 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="flex items-center gap-1 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white" style={{ letterSpacing: "-0.02em" }}>
              Detail Submisi
            </DialogTitle>
            <DialogDescription className="text-[14px] text-gray-500 dark:text-gray-400">
              Informasi lengkap tentang submisi kamu.
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4 pt-2">
              <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 space-y-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-0.5">Tantangan</p>
                  <p className="text-[14px] font-bold text-gray-900 dark:text-white">{selectedSubmission.challenge?.title || "Untitled"}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1">Status</p>
                    <StatusBadge status={selectedSubmission.status ?? "submitted"} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-0.5">Nilai</p>
                    <p className="text-[14px] font-bold text-[#1c81ff]">
                      {selectedSubmission.score !== null && selectedSubmission.score !== undefined ? selectedSubmission.score : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-0.5">Tanggal Submit</p>
                    <p className="text-[13px] text-gray-600 dark:text-gray-300 tabular-nums">
                      {selectedSubmission.submitted_at
                        ? format(new Date(selectedSubmission.submitted_at), "dd MMM yyyy, HH:mm", { locale: localeId })
                        : "—"}
                    </p>
                  </div>
                </div>
                {selectedSubmission.feedback && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-0.5">Feedback</p>
                    <p className="text-[14px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedSubmission.feedback}</p>
                  </div>
                )}
              </div>
              {selectedSubmission.file_path && (
                <button
                  onClick={() => downloadFile.mutate(selectedSubmission.id!)}
                  disabled={downloadFile.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-2.5 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 text-[14px]"
                >
                  <Download className="h-4 w-4" />
                  Download File
                </button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
