import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useGetChallenge } from "@/hooks/challenges";
import { useSubmitChallenge } from "@/hooks/submission";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Circle,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MCQQuestion } from "@/types/challenge";

export default function ChallengeQuizRunnerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const challengeId = Number(id);

  const { challenge, loading, error } = useGetChallenge(challengeId);
  const { mutate: submitChallenge, isPending: isSubmitting } = useSubmitChallenge();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const questions = (challenge?.metadata?.questions || []) as MCQQuestion[];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    if (!challenge?.metadata?.estimated_minutes) return;
    const totalSeconds = challenge.metadata.estimated_minutes * 60;
    setTimeRemaining(totalSeconds);
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) { clearInterval(interval); confirmSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [challenge]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answer: string) =>
    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: answer }));
  const handlePrevious = () => currentQuestionIndex > 0 && setCurrentQuestionIndex((p) => p - 1);
  const handleNext = () => currentQuestionIndex < questions.length - 1 && setCurrentQuestionIndex((p) => p + 1);
  const handleSubmitClick = () => setShowConfirmDialog(true);

  const confirmSubmit = async () => {
    setShowConfirmDialog(false);
    const answersArray = questions.map((_, i) => answers[i] || "");
    submitChallenge(
      { challengeId, request: { submitted_content: { answers: answersArray } } },
      { onSuccess: () => navigate(`/student/challenges/${id}`) },
    );
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#1c81ff]" />
          <p className="text-[14px] text-gray-500 dark:text-gray-400">Memuat challenge…</p>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error || !challenge) {
    return (
      <div className="max-w-xl mx-auto p-6 space-y-4">
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-5">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[15px] text-red-600 dark:text-red-400">
            {error?.message || "Challenge tidak ditemukan"}
          </p>
        </div>
        <Link to="/student/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  // ── No questions ─────────────────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-6 space-y-4">
        <div className="flex items-start gap-3 rounded-2xl bg-[#f6b60b]/5 border border-[#f6b60b]/20 p-5">
          <TriangleAlert className="h-5 w-5 text-[#f6b60b] shrink-0 mt-0.5" />
          <p className="text-[15px] text-gray-700 dark:text-gray-300">
            Challenge ini belum memiliki soal.
          </p>
        </div>
        <Link to={`/student/challenges/${id}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Overview
        </Link>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  // ── Main quiz layout ─────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-gray-50 dark:bg-[#0d1117]">
      {/* ── Left sidebar: question nav ── */}
      <div className="w-full lg:w-64 bg-white dark:bg-[#0a0f12] border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/10">
        {/* Back button */}
        <div className="px-4 py-3.5 border-b border-gray-100 dark:border-white/5">
          <Link to={`/student/challenges/${id}`}
            className="flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Overview
          </Link>
        </div>

        {/* Progress indicator */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
              Progress
            </span>
            <span className="text-[11px] font-extrabold tabular-nums text-[#1c81ff]">
              {answeredCount}/{questions.length}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full bg-[#1c81ff] transition-all duration-300 rounded-full"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question list */}
        <div className="p-3 grid grid-cols-5 lg:grid-cols-1 gap-1.5">
          {questions.map((_, index) => {
            const isActive = currentQuestionIndex === index;
            const isAnswered = answers[index] !== undefined;
            return (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={cn(
                  "flex items-center gap-2 rounded-xl p-3 text-left transition-all text-[13px] font-bold",
                  isActive && "bg-[#1c81ff]/10 text-[#1c81ff] border border-[#1c81ff]/20",
                  !isActive && isAnswered && "bg-[#00E676]/10 text-[#00E676]",
                  !isActive && !isAnswered && "hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400",
                )}
              >
                {isAnswered ? (
                  <CheckCircle2 className="shrink-0 h-4 w-4" />
                ) : (
                  <Circle className="shrink-0 h-4 w-4" />
                )}
                <span className="hidden lg:inline">Soal {index + 1}</span>
                <span className="lg:hidden">{index + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-[#0a0f12]/90 backdrop-blur-md px-5">
          <div>
            <h1 className="text-[14px] font-extrabold text-gray-900 dark:text-white truncate max-w-xs" style={{ letterSpacing: "-0.01em" }}>
              {challenge.title}
            </h1>
            <p className="text-[12px] text-gray-500 dark:text-gray-400">
              Soal {currentQuestionIndex + 1} dari {questions.length}
            </p>
          </div>
          {timeRemaining !== null && (
            <div className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 border font-mono text-lg font-extrabold tabular-nums",
              timeRemaining < 60
                ? "border-[#ff007b]/30 bg-[#ff007b]/10 text-[#ff007b]"
                : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white",
            )}>
              <Clock className="h-4 w-4" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>

        {/* Question */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Question card */}
            <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 md:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-3">
                Pertanyaan {currentQuestionIndex + 1}
              </p>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white leading-relaxed" style={{ letterSpacing: "-0.02em" }}>
                {currentQuestion.question}
              </h2>
            </div>

            {/* Answer options */}
            <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5 space-y-3">
              <RadioGroup value={answers[currentQuestionIndex]} onValueChange={handleAnswerSelect} className="space-y-2.5">
                {currentQuestion.options.map((option, index) => {
                  const optionKey = String.fromCharCode(65 + index);
                  const isSelected = answers[currentQuestionIndex] === optionKey;
                  return (
                    <div
                      key={optionKey}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border-[1.5px] p-4 cursor-pointer transition-all",
                        isSelected
                          ? "border-[#1c81ff] bg-[#1c81ff]/5 dark:bg-[#1c81ff]/10"
                          : "border-gray-200 dark:border-white/10 hover:border-[#1c81ff]/40 hover:bg-gray-50 dark:hover:bg-white/5",
                      )}
                    >
                      <RadioGroupItem value={optionKey} id={`option-${optionKey}`} className="mt-0.5 shrink-0" />
                      <Label htmlFor={`option-${optionKey}`} className="flex-1 cursor-pointer text-[14px] text-gray-700 dark:text-gray-300">
                        <span className={cn("font-extrabold mr-2", isSelected ? "text-[#1c81ff]" : "text-gray-400 dark:text-gray-600")}>
                          {optionKey}.
                        </span>
                        {option}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="border-t border-gray-200 dark:border-white/10 bg-white/90 dark:bg-[#0a0f12]/90 backdrop-blur-md">
          <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Sebelumnya
            </button>

            <span className="text-[13px] text-gray-500 dark:text-gray-400 tabular-nums font-bold">
              {answeredCount}/{questions.length} terjawab
            </span>

            {isLastQuestion ? (
              <button
                onClick={handleSubmitClick}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-2 px-5 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[13px]"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Mengirim…</>
                ) : "Kumpulkan"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={currentQuestionIndex >= questions.length - 1}
                className="flex items-center gap-1.5 bg-[#1c81ff] text-white font-bold rounded-xl px-4 py-2 text-[13px] shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Selanjutnya
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white" style={{ letterSpacing: "-0.02em" }}>
              Kumpulkan Jawaban?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-gray-500 dark:text-gray-400">
              {answeredCount < questions.length ? (
                <>
                  Kamu baru menjawab{" "}
                  <span className="font-bold text-[#f6b60b]">{answeredCount}</span> dari{" "}
                  <span className="font-bold">{questions.length}</span> soal.{" "}
                </>
              ) : null}
              Setelah dikumpulkan, jawaban tidak bisa diubah lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-[1.5px] border-gray-200 dark:border-white/20 font-bold">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubmit}
              disabled={isSubmitting}
              className="bg-[#1c81ff] text-white font-bold rounded-xl shadow-md shadow-blue-500/20 hover:scale-[1.02] transition-transform"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Mengirim…</>
              ) : "Ya, Kumpulkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
