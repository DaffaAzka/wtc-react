import { useParams, useNavigate, Link } from "react-router";
import { useGetChallenge } from "@/hooks/challenges";
import { useGetModules } from "@/hooks/modules";
import { useGetLessons } from "@/hooks/lessons";
import { useGetChallengesByModule } from "@/hooks/challenges";
import { useMySubmissions } from "@/hooks/submission";
import { useGetTracks } from "@/hooks/tracks";
import { useQueries } from "@tanstack/react-query";
import { SubmissionService } from "@/services/submission";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  AlertCircle,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Lock,
  Target,
} from "lucide-react";
import { ChallengeDetails } from "@/features/auth/challenges/challenge-details";
import { SubmissionHistory } from "@/features/auth/challenges/submission-history";
import {
  getLatestSubmission,
  didSubmissionPass,
  getScorePercentage,
  getChallengeCompletionStatus,
  DEFAULT_PASSING_PERCENTAGE,
} from "@/lib/challenge-completion";
import { cn } from "@/lib/utils";

export default function ChallengeDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const challengeId = Number(id);

  const { challenge, loading: challengeLoading, error: challengeError } = useGetChallenge(challengeId);
  const { data: submissions = [], isLoading: submissionsLoading } = useMySubmissions(challengeId);
  const { modules, loading: modulesLoading } = useGetModules();
  const { tracks, loading: tracksLoading } = useGetTracks();

  const currentModule = modules.find((m) => m.id === challenge?.module_id);
  const moduleSlug = currentModule?.slug || "";
  const currentTrack = tracks.find((t) => t.id === currentModule?.track_id);

  const trackModules = modules
    .filter((m) => m.track_id === currentModule?.track_id)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const currentModuleIndex = trackModules.findIndex((m) => m.id === currentModule?.id);
  const nextModule =
    currentModuleIndex >= 0 && currentModuleIndex < trackModules.length - 1
      ? trackModules[currentModuleIndex + 1]
      : null;

  const { lessons, loading: lessonsLoading } = useGetLessons(
    currentModule ? { module_id: currentModule.id.toString() } : undefined,
  );
  const { challenges: moduleChallenges, loading: moduleChallengesLoading } =
    useGetChallengesByModule(moduleSlug);

  const submissionQueries = useQueries({
    queries: moduleChallenges.map((ch) => ({
      queryKey: ["submissions", "my", ch.id],
      queryFn: () => SubmissionService.mySubmissions(ch.id),
      enabled: !!ch.id,
    })),
  });
  const allSubmissions = submissionQueries
    .filter((q) => q.isSuccess && q.data)
    .flatMap((q) => q.data || []);

  const { lessons: nextModuleLessons, loading: nextModuleLessonsLoading } = useGetLessons(
    nextModule ? { module_id: nextModule.id.toString() } : undefined,
  );
  const nextModuleFirstLesson = [...nextModuleLessons].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  )[0];

  const sortedLessons = [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
  const lastLesson = sortedLessons[sortedLessons.length - 1];

  const submissionCount = submissions.length;
  const allowedAttempts = challenge?.allowed_attempts || 0;
  const remainingAttempts = allowedAttempts > 0 ? allowedAttempts - submissionCount : Infinity;
  const canSubmit = remainingAttempts > 0 || allowedAttempts === 0;

  const latestSubmission = getLatestSubmission(submissions);
  const hasPassed =
    latestSubmission && latestSubmission.score !== null && challenge
      ? didSubmissionPass(latestSubmission, challenge)
      : false;
  const scorePercentage =
    latestSubmission && latestSubmission.score !== null && challenge
      ? getScorePercentage(latestSubmission.score, challenge.max_score)
      : null;
  const isPending = latestSubmission && latestSubmission.status === "pending";

  const allChallengesCompleted = moduleChallenges.every((ch) => {
    const challengeSubmissions = allSubmissions.filter((sub) => sub.challenge_id === ch.id);
    return getChallengeCompletionStatus(ch, challengeSubmissions) === "passed";
  });

  const handlePrevious = () => {
    if (lastLesson && currentModule && currentTrack) {
      navigate(`/student/classes/${currentTrack.slug}/${currentModule.slug}/${lastLesson.slug}`);
    } else {
      navigate("/student/dashboard");
    }
  };

  const handleNext = () => {
    if (nextModule && nextModuleFirstLesson && currentTrack) {
      navigate(`/student/classes/${currentTrack.slug}/${nextModule.slug}/${nextModuleFirstLesson.slug}`);
    } else {
      navigate("/student/dashboard");
    }
  };

  const handleLessonClick = (lesson: (typeof sortedLessons)[0]) => {
    if (currentModule && currentTrack) {
      navigate(`/student/classes/${currentTrack.slug}/${currentModule.slug}/${lesson.slug}`);
    }
  };

  const loading =
    challengeLoading || submissionsLoading || modulesLoading ||
    tracksLoading || lessonsLoading || moduleChallengesLoading;

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-4 flex-col">
        <Loader2 className="h-8 w-8 animate-spin text-[#1c81ff]" />
        <p className="text-[14px] text-gray-500 dark:text-gray-400">Memuat challenge…</p>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (challengeError || !challenge || !currentModule) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-5">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[15px] text-red-600 dark:text-red-400">
            {challengeError?.message || "Challenge atau Module tidak ditemukan"}
          </p>
        </div>
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] overflow-hidden -m-6 md:-m-8">
      <div className="flex flex-1 overflow-hidden">
        {/* ── Main content ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-6">
            {/* Challenge details (existing component) */}
            <ChallengeDetails
              challenge={challenge}
              submissionCount={submissionCount}
              remainingAttempts={remainingAttempts}
            />

            {/* Latest result */}
            {latestSubmission && (
              <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
                  <span className="font-bold text-gray-900 dark:text-white">Hasil Terbaru</span>
                  {isPending ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-white/5 px-2.5 py-1 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      SEDANG DINILAI
                    </span>
                  ) : latestSubmission.score !== null ? (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${hasPassed ? "bg-[#00E676]/10 text-[#00E676]" : "bg-[#ff007b]/10 text-[#ff007b]"}`}>
                      {hasPassed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {hasPassed ? "LULUS" : "GAGAL"}
                    </span>
                  ) : null}
                </div>

                <div className="p-6 space-y-4">
                  {isPending ? (
                    <div className="flex items-start gap-3 rounded-xl bg-[#1c81ff]/5 border border-[#1c81ff]/15 p-4">
                      <Loader2 className="h-4 w-4 animate-spin text-[#1c81ff] shrink-0 mt-0.5" />
                      <p className="text-[14px] text-gray-600 dark:text-gray-300">
                        Jawaban kamu sedang dinilai. Refresh halaman ini sebentar lagi.
                      </p>
                    </div>
                  ) : latestSubmission.score !== null ? (
                    <>
                      <div>
                        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1">Skor</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold text-[#1c81ff] tabular-nums">{latestSubmission.score}</span>
                          <span className="text-[15px] text-gray-400 dark:text-gray-600">/ {challenge.max_score}</span>
                          <span className="text-[15px] font-bold text-gray-500 dark:text-gray-400">({scorePercentage}%)</span>
                        </div>
                        <p className="text-[12px] text-gray-400 dark:text-gray-600 mt-1">
                          Nilai minimal lulus: {Math.round(DEFAULT_PASSING_PERCENTAGE * 100)}%
                        </p>
                      </div>
                      {hasPassed ? (
                        <div className="flex items-start gap-3 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 p-4">
                          <CheckCircle2 className="h-4 w-4 text-[#00E676] shrink-0 mt-0.5" />
                          <p className="text-[14px] text-[#00E676]">Selamat! Kamu telah menyelesaikan challenge ini.</p>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 rounded-xl bg-[#ff007b]/10 border border-[#ff007b]/20 p-4">
                          <XCircle className="h-4 w-4 text-[#ff007b] shrink-0 mt-0.5" />
                          <p className="text-[14px] text-[#ff007b]">Kamu belum mencapai nilai minimal. Silakan coba lagi.</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-4">
                      <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-[14px] text-red-600 dark:text-red-400">
                        Submission gagal dinilai. Silakan hubungi administrator.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submission history */}
            <SubmissionHistory submissions={submissions} maxScore={challenge.max_score} />

            {/* Start challenge */}
            <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6">
              <h3 className="font-extrabold text-gray-900 dark:text-white mb-3" style={{ letterSpacing: "-0.01em" }}>
                Mulai Challenge
              </h3>
              {canSubmit ? (
                <div className="space-y-3">
                  <p className="text-[14px] leading-relaxed text-gray-500 dark:text-gray-400">
                    Klik tombol di bawah untuk mulai mengerjakan challenge ini.
                  </p>
                  <Link
                    to={`/student/challenges/${challenge.id}/take`}
                    className="inline-flex items-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-3 px-6 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 text-[14px]"
                  >
                    <PlayCircle className="h-5 w-5" />
                    Mulai
                  </Link>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-4">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[14px] text-red-600 dark:text-red-400">
                    Kamu telah mencapai batas maksimum percobaan untuk challenge ini.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="hidden lg:flex w-80 xl:w-96 border-l border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0f12] h-full flex-col">
          {/* Module header */}
          <div className="px-5 py-4 border-b border-gray-200 dark:border-white/10">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1">Module</p>
            <h3 className="text-[15px] font-extrabold text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.01em" }}>
              {currentModule.title}
            </h3>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-5">
              {/* Lessons list */}
              {sortedLessons.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-600">Pelajaran</p>
                  <div className="space-y-0.5">
                    {sortedLessons.map((lesson, index) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson)}
                        className="w-full flex items-center gap-3 rounded-xl p-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <Circle className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-600" />
                        <div className="flex-1 min-w-0">
                          <span className="block font-mono text-[10px] text-gray-400 dark:text-gray-600 mb-0.5">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="block text-[13px] font-bold text-gray-700 dark:text-gray-300 line-clamp-2">{lesson.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Challenges list */}
              {moduleChallenges.length > 0 && (
                <div className="pt-3 border-t border-gray-100 dark:border-white/5">
                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-600">Tantangan</p>
                  <p className="px-3 mb-2 text-[11px] text-gray-400 dark:text-gray-600">Selesaikan untuk membuka modul berikutnya</p>
                  <div className="space-y-0.5">
                    {moduleChallenges.map((ch, index) => {
                      const isCurrentChallenge = ch.id === challenge.id;
                      const challengeSubmissions = allSubmissions.filter((sub) => sub.challenge_id === ch.id);
                      const status = getChallengeCompletionStatus(ch, challengeSubmissions);
                      return (
                        <Link key={ch.id} to={`/student/challenges/${ch.id}`}>
                          <div className={cn(
                            "flex items-center gap-3 rounded-xl p-3 transition-colors",
                            isCurrentChallenge
                              ? "bg-[#1c81ff]/10 border border-[#1c81ff]/20"
                              : "hover:bg-gray-50 dark:hover:bg-white/5",
                          )}>
                            {status === "passed"  && <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00E676]" />}
                            {status === "failed"  && <XCircle      className="h-4 w-4 shrink-0 text-[#ff007b]" />}
                            {status !== "passed" && status !== "failed" && (
                              <Circle className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-600" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-mono text-[10px] text-gray-400 dark:text-gray-600">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                                <span className={cn(
                                  "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold capitalize",
                                  isCurrentChallenge ? "bg-[#1c81ff]/20 text-[#1c81ff]" : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400",
                                )}>
                                  {ch.type.replace(/_/g, " ")}
                                </span>
                              </div>
                              <span className="block text-[13px] font-bold text-gray-700 dark:text-gray-300 line-clamp-2">{ch.title}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* ── Bottom navigation ── */}
      <div className="border-t border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#0a0f12]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all min-w-28"
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </button>

          <div className="text-center min-w-0 flex-1">
            <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate">{challenge.title}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {hasPassed ? "✅ Selesai" : "Tantangan"}
            </p>
          </div>

          <button
            onClick={handleNext}
            disabled={!allChallengesCompleted || Boolean(nextModule && nextModuleLessonsLoading)}
            className="flex items-center gap-1.5 bg-[#1c81ff] text-white font-bold rounded-xl px-4 py-2 text-[13px] shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none min-w-28 justify-end"
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
