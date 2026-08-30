import { useParams, useNavigate } from "react-router";
import { useGetChallenge } from "@/hooks/challenges";
import { ChallengeDetails } from "@/features/auth/challenges/challenge-details";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import ErrorState from "@/components/custom/error-state";
import { Link } from "react-router";
import { ArrowLeft, Pencil, FileText, CheckCircle2, Circle, AlignLeft, Trophy, Target, Infinity as InfinityIcon, TriangleAlert } from "lucide-react";

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string }> = {
  easy: { bg: "bg-[#00E676]/10", text: "text-[#00E676]" },
  medium: { bg: "bg-[#f6b60b]/10", text: "text-[#f6b60b]" },
  hard: { bg: "bg-[#ff007b]/10", text: "text-[#ff007b]" },
};

export default function AdminChallengeViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const challengeId = Number(id);

  const { challenge, loading, error } = useGetChallenge(challengeId);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />
      </div>
    );
  }

  if (error || !challenge) {
    return <ErrorState title="Unable to load challenge" message={error?.message || "Challenge not found"} onRetry={() => navigate(-1)} />;
  }

  const questions: any[] = (challenge.metadata as any)?.questions ?? [];
  const diffStyle = DIFFICULTY_STYLE[challenge.difficulty?.toLowerCase() ?? ""] ?? null;

  return (
    <div className="space-y-8 mx-8 max-w-6xl">
      {/* ── Header ── */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Challenge</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
              {challenge.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-0.5 font-mono text-[12px] text-gray-500 dark:text-gray-400">
                /{challenge.slug}
              </code>
              {diffStyle && challenge.difficulty && (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] capitalize ${diffStyle.bg} ${diffStyle.text}`}>
                  {challenge.difficulty}
                </span>
              )}
              <span className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-0.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 capitalize">
                {challenge.type.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate(`/admin/submissions/${challenge.id}`)}
              className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3.5 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              <FileText className="h-3.5 w-3.5" />
              Submissions
            </button>
            <button
              type="button"
              onClick={() => navigate(`/admin/challenges/${challenge.id}/edit`)}
              className="flex items-center gap-1.5 bg-[#1c81ff] text-white font-bold rounded-xl px-3.5 py-2 text-[13px] shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* ── Challenge preview (student view) ── */}
      <ChallengeDetails challenge={challenge} submissionCount={0} remainingAttempts={Infinity} />

      {/* ── Questions ── */}
      {questions.length > 0 && (
        <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/5">
            <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
              <AlignLeft className="h-4 w-4 text-[#1c81ff]" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Questions</span>
            <span className="ml-1 inline-flex items-center rounded-full bg-gray-100 dark:bg-white/5 px-2 py-0.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">{questions.length}</span>
          </div>

          <div className="p-4 space-y-3">
            {questions.map((question: any, index: number) => (
              <div key={index} className="rounded-xl border border-gray-200 dark:border-white/10 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#1c81ff]/10 text-[11px] font-extrabold text-[#1c81ff]">{index + 1}</span>
                    <p className="text-[14px] font-bold text-gray-900 dark:text-white leading-relaxed">{question.question || question.text || "No question text"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-0.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 capitalize">
                      {question.type === "multiple_choice" ? "Pilihan Ganda" : question.type === "essay" ? "Essay" : question.type || "unknown"}
                    </span>
                    {question.score !== undefined && <span className="text-[12px] font-bold text-[#1c81ff]">{question.score} pts</span>}
                  </div>
                </div>

                {/* MCQ options */}
                {question.options && Array.isArray(question.options) && (
                  <div className="ml-9 space-y-1.5">
                    {question.options.map((option: any, optIdx: number) => {
                      const optKey = String.fromCharCode(65 + optIdx); // A, B, C, D
                      const text = typeof option === "string" ? option : option.text || option.value || "";
                      // Support both formats: {is_correct: true} and answer: "B"
                      const isCorrect =
                        (typeof option === "object" && (option.is_correct || option.isCorrect)) ||
                        (typeof question.answer === "string" && question.answer.toUpperCase() === optKey);
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] ${
                            isCorrect ? "bg-[#00E676]/10 border border-[#00E676]/20 text-[#00E676]" : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <Circle className="h-3.5 w-3.5 shrink-0" />}
                          <span className="font-bold mr-1">{optKey}.</span>
                          <span>{text}</span>
                          {isCorrect && <span className="ml-auto text-[11px] font-bold uppercase tracking-wide">Jawaban Benar</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explanation */}
                {question.explanation && (
                  <div className="ml-9 rounded-lg bg-[#f6b60b]/5 border border-[#f6b60b]/15 px-3 py-2 text-[12px] text-gray-600 dark:text-gray-300">
                    <span className="font-bold text-[#f6b60b]">Explanation: </span>
                    {question.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Scoring & Settings ── */}
      <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/5">
          <div className="w-8 h-8 rounded-full bg-[#f6b60b]/10 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-[#f6b60b]" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Scoring & Settings</span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {[
              { label: "Max Score", value: challenge.max_score },
              {
                label: "Min Score",
                value: (challenge.settings as any)?.minimum_score ?? "—",
              },
              { label: "Points (EXP)", value: challenge.points ?? "—" },
              {
                label: "Allowed Attempts",
                value: challenge.allowed_attempts === null || challenge.allowed_attempts === -1 ? "Unlimited" : challenge.allowed_attempts,
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1">{label}</p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          {questions.length > 0 && (
            <>
              <div className="my-5 border-t border-gray-100 dark:border-white/5" />
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                {[
                  { label: "Total Questions", value: questions.length },
                  {
                    label: "MCQ",
                    value: questions.filter((q) => q.type === "multiple_choice").length,
                  },
                  {
                    label: "Essay",
                    value: questions.filter((q) => q.type === "essay").length,
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1">{label}</p>
                    <p className="text-xl font-extrabold text-gray-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
