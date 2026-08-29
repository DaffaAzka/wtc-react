import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useGetChallengeSubmissions } from "@/hooks/submission";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Search,
  FileText,
  AlertCircle,
  Inbox,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import GradingModal from "@/features/auth/submissions/grading-modal";
import ErrorState from "@/components/custom/error-state";

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  submitted:     { bg: "bg-[#1c81ff]/10",  text: "text-[#1c81ff]",  dot: "bg-[#1c81ff]" },
  graded:        { bg: "bg-[#00E676]/10",  text: "text-[#00E676]",  dot: "bg-[#00E676]" },
  returned:      { bg: "bg-[#31c7c8]/10",  text: "text-[#31c7c8]",  dot: "bg-[#31c7c8]" },
  not_submitted: { bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-400 dark:text-gray-600", dot: "bg-gray-400" },
};

const STATUS_LABEL: Record<string, string> = {
  submitted:     "Submitted",
  graded:        "Graded",
  returned:      "Returned",
  not_submitted: "Not Submitted",
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.not_submitted;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export default function SubmissionReviewPage() {
  const { challengeId: challengeIdParam } = useParams();
  const challengeId = Number(challengeIdParam);
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetChallengeSubmissions(challengeId);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!data?.students) return [];
    let filtered = data.students;
    if (statusFilter !== "all") filtered = filtered.filter((s) => s.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) => s.profile.display_name?.toLowerCase().includes(q) || s.profile.email.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [data?.students, statusFilter, searchQuery]);

  const getLatestSubmission = (student: {
    attempts?: Array<{ id: number; attempt_number: number; status: string; score: number | null; submitted_at: string | null }> | null;
  }) => {
    if (!student.attempts || student.attempts.length === 0) return null;
    return student.attempts.reduce((l, c) => c.attempt_number > l.attempt_number ? c : l);
  };

  const handleGrade = (submissionId: number) => {
    setSelectedSubmissionId(submissionId);
    setIsGradingModalOpen(true);
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28 rounded-lg" />
          <Skeleton className="h-9 w-64 rounded-xl" />
          <Skeleton className="h-4 w-48 rounded-lg" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 dark:border-white/5 last:border-0">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-36 rounded-md" />
                <Skeleton className="h-3 w-24 rounded-md" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="hidden md:block h-3.5 w-16 rounded-md" />
              <Skeleton className="ml-auto h-8 w-20 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <ErrorState
          title="Unable to load submissions"
          message={error.message || "An error occurred while loading submissions."}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <ErrorState title="Challenge not found" message="The requested challenge could not be found." />
      </div>
    );
  }

  const { challenge, students } = data;

  // ── Main ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-3">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Submissions</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
            {challenge.title}
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            Max Score: <span className="font-bold text-gray-700 dark:text-gray-300">{challenge.max_score}</span>
            {" · "}
            Attempts: <span className="font-bold text-gray-700 dark:text-gray-300">{challenge.allowed_attempts ?? "Unlimited"}</span>
          </p>
        </div>

        {students.length > 0 && (
          <div className="hidden lg:flex items-center gap-2 bg-[#1c81ff]/10 rounded-2xl px-4 py-2.5 mt-7">
            <span className="font-extrabold text-[#1c81ff] tabular-nums">{students.length}</span>
            <span className="text-[12px] font-bold text-[#1c81ff]/70">
              {students.length === 1 ? "student" : "students"}
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-600" />
          <input
            placeholder="Search by student name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 pl-10 pr-4 py-2.5 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_submitted">Not Submitted</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="graded">Graded</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      {(statusFilter !== "all" || searchQuery.trim()) && (
        <p className="text-[13px] text-gray-500 dark:text-gray-400">
          Showing <span className="font-bold text-gray-900 dark:text-white">{filteredStudents.length}</span>{" "}
          of <span className="font-bold">{students.length}</span> students
        </p>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center bg-white dark:bg-[#0b1215]">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              {searchQuery.trim() || statusFilter !== "all"
                ? <Search className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                : <Inbox className="h-5 w-5 text-gray-400 dark:text-gray-600" />}
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900 dark:text-white">No submissions found</p>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                {searchQuery.trim() || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No students have submitted yet"}
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full text-sm bg-white dark:bg-[#0b1215]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Student</th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 sm:table-cell">Attempts</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Status</th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 md:table-cell">Score</th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 lg:table-cell">Submitted</th>
                <th className="w-28 px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredStudents.map((student) => {
                const latest = getLatestSubmission(student);
                return (
                  <tr key={student.profile.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 ring-1 ring-gray-200 dark:ring-white/10">
                          <AvatarImage src={student.profile.avatar || undefined} alt={student.profile.display_name || ""} />
                          <AvatarFallback className="text-xs font-bold bg-[#1c81ff]/10 text-[#1c81ff]">
                            {(student.profile.display_name?.charAt(0) || student.profile.email.charAt(0)).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-[14px] text-gray-900 dark:text-white">
                            {student.profile.display_name || "Unknown"}
                          </p>
                          <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                            {student.profile.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3.5 sm:table-cell">
                      <span className="text-[14px] text-gray-500 dark:text-gray-400 tabular-nums">
                        {student.submission_count}/{challenge.allowed_attempts ?? "∞"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={student.status} />
                    </td>
                    <td className="hidden px-5 py-3.5 md:table-cell">
                      {latest?.score !== null && latest?.score !== undefined ? (
                        <span className="font-bold text-[14px] tabular-nums">
                          <span className="text-[#1c81ff]">{latest.score}</span>
                          <span className="text-gray-400 dark:text-gray-600">/{challenge.max_score}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600 text-[13px]">—</span>
                      )}
                    </td>
                    <td className="hidden px-5 py-3.5 text-[13px] text-gray-500 dark:text-gray-400 tabular-nums lg:table-cell">
                      {latest?.submitted_at
                        ? format(new Date(latest.submitted_at), "MMM d, yyyy")
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {latest ? (
                        <button onClick={() => handleGrade(latest.id)}
                          className="inline-flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#1c81ff] hover:border-[#1c81ff]/30 transition-all">
                          {latest.score !== null ? "Review" : "Grade"}
                        </button>
                      ) : (
                        <span className="text-[13px] text-gray-400 dark:text-gray-600">No submission</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <GradingModal
        submissionId={selectedSubmissionId}
        isOpen={isGradingModalOpen}
        onOpenChange={setIsGradingModalOpen}
      />
    </div>
  );
}
