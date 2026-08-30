import { useState, useEffect, useRef } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, Send, Loader2, Clock, AlertTriangle } from "lucide-react";
import type { Challenge } from "@/types/model";
import type { MCQQuestion } from "@/types/challenge";

interface TimedExamFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

type Answer = { questionIndex: number; type: "multiple_choice" | "essay"; answer: string };

export function TimedExamForm({ challenge, canSubmit, isSubmitting, onSubmit }: TimedExamFormProps) {
  const questions = challenge.metadata?.questions || [];
  const estimatedMinutes = challenge.metadata?.estimated_minutes || 60;
  const totalSeconds = estimatedMinutes * 60;

  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(totalSeconds);
  const [examStarted, setExamStarted] = useState(false);
  const [examEnded, setExamEnded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const getTimeColor = () => {
    const pct = (timeRemaining / totalSeconds) * 100;
    if (pct > 50) return "text-[#00E676]";
    if (pct > 20) return "text-[#f6b60b]";
    return "text-[#ff007b]";
  };

  const handleAutoSubmit = () => {
    setExamEnded(true);
    if (timerRef.current) clearInterval(timerRef.current);
    onSubmit(null, JSON.stringify({
      exam_type: "timed_exam", total_questions: questions.length,
      time_limit_minutes: estimatedMinutes, time_used_seconds: totalSeconds - timeRemaining,
      answers: answers.sort((a, b) => a.questionIndex - b.questionIndex),
      auto_submitted: true, submitted_at: new Date().toISOString(),
    }));
  };

  useEffect(() => {
    if (examStarted && !examEnded && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => { if (prev <= 1) { handleAutoSubmit(); return 0; } return prev - 1; });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [examStarted, examEnded]);

  const handleMCQAnswer = (questionIndex: number, answer: string) =>
    setAnswers((prev) => [...prev.filter((a) => a.questionIndex !== questionIndex), { questionIndex, type: "multiple_choice", answer }]);

  const handleEssayAnswer = (questionIndex: number, text: string) =>
    setAnswers((prev) => { const f = prev.filter((a) => a.questionIndex !== questionIndex); return text.trim() ? [...f, { questionIndex, type: "essay", answer: text }] : f; });

  const getAnswer = (questionIndex: number) => answers.find((a) => a.questionIndex === questionIndex)?.answer || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examStarted) { setError("Silakan mulai ujian terlebih dahulu"); return; }
    if (examEnded) { setError("Ujian telah berakhir"); return; }
    if (answers.length < questions.length) { setError(`Beberapa soal belum dijawab (${answers.length}/${questions.length})`); return; }
    setExamEnded(true);
    if (timerRef.current) clearInterval(timerRef.current);
    onSubmit(null, JSON.stringify({
      exam_type: "timed_exam", total_questions: questions.length,
      time_limit_minutes: estimatedMinutes, time_used_seconds: totalSeconds - timeRemaining,
      answers: answers.sort((a, b) => a.questionIndex - b.questionIndex),
      auto_submitted: false, submitted_at: new Date().toISOString(),
    }));
    setError("");
  };

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-8 flex flex-col items-center gap-3 text-center">
        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <p className="text-[14px] text-red-600 dark:text-red-400">Ujian ini tidak memiliki soal. Silakan hubungi instruktur.</p>
      </div>
    );
  }

  const totalScore = questions.reduce((sum: number, q: any) => sum + q.score, 0);
  const progress = (answers.length / questions.length) * 100;

  // Pre-exam screen
  if (!examStarted) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/5">
          <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-[#1c81ff]" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Timed Exam</span>
        </div>
        <div className="p-5 space-y-5">
          <div className="rounded-xl bg-[#f6b60b]/5 border border-[#f6b60b]/20 p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-[#f6b60b] shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-2">Informasi Ujian</p>
                <ul className="space-y-1.5 text-[12px] text-gray-500 dark:text-gray-400">
                  {[
                    `Jumlah soal: ${questions.length}`,
                    `Total skor: ${totalScore} poin`,
                    `Waktu: ${estimatedMinutes} menit`,
                    "Timer mulai berjalan setelah klik Mulai Ujian",
                    "Ujian otomatis ter-submit saat waktu habis",
                    "Pastikan koneksi internet stabil",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <span className="text-[#f6b60b] mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {!canSubmit ? (
            <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-4">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[14px] text-red-600 dark:text-red-400">Anda telah mencapai batas maksimum percobaan untuk challenge ini.</p>
            </div>
          ) : (
            <button onClick={() => setExamStarted(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-3 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 text-[14px]">
              <Clock className="h-4 w-4" />
              Mulai Ujian ({estimatedMinutes} menit)
            </button>
          )}
        </div>
      </div>
    );
  }

  // During exam
  return (
    <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-white/90 dark:bg-[#0b1215]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-[#1c81ff]" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Timed Exam</span>
          <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/5 px-2.5 py-0.5 text-[12px] font-bold text-gray-500 dark:text-gray-400">
            {totalScore} poin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-gray-400 dark:text-gray-600 tabular-nums">
            {answers.length}/{questions.length} terjawab
          </span>
          <div className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 font-mono text-lg font-extrabold tabular-nums ${
            timeRemaining <= totalSeconds * 0.2
              ? "border-[#ff007b]/30 bg-[#ff007b]/10"
              : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5"
          }`}>
            <Clock className={`h-4 w-4 ${getTimeColor()}`} />
            <span className={getTimeColor()}>{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Progress */}
        <div className="space-y-1">
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
            <div className="h-full bg-[#1c81ff] transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* 1-minute warning */}
        {timeRemaining <= 60 && timeRemaining > 0 && (
          <div className="flex items-start gap-3 rounded-xl bg-[#ff007b]/10 border border-[#ff007b]/20 p-4">
            <AlertTriangle className="h-4 w-4 text-[#ff007b] shrink-0 mt-0.5" />
            <p className="text-[14px] font-bold text-[#ff007b]">
              Waktu tersisa kurang dari 1 menit! Segera selesaikan ujian Anda.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question: any, index: number) => (
            <div key={index}
              className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-200 dark:border-white/10">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#1c81ff]/10 font-mono text-[11px] font-extrabold text-[#1c81ff]">
                  {index + 1}
                </span>
                <span className="text-[12px] font-bold text-gray-500 dark:text-gray-400">{question.score} poin</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${
                  question.type === "multiple_choice" ? "bg-[#1c81ff]/10 text-[#1c81ff]" : "bg-[#31c7c8]/10 text-[#31c7c8]"
                }`}>
                  {question.type === "multiple_choice" ? "MCQ" : "Essay"}
                </span>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-[15px] font-bold text-gray-900 dark:text-white leading-relaxed">{question.question}</p>
                {question.type === "multiple_choice" && (
                  <RadioGroup value={getAnswer(index)} onValueChange={(v) => handleMCQAnswer(index, v)} className="space-y-2">
                    {(question as MCQQuestion).options.map((option: string, optIndex: number) => {
                      const key = String.fromCharCode(65 + optIndex);
                      const isSelected = getAnswer(index) === key;
                      return (
                        <div key={optIndex}
                          className={`flex items-start gap-3 rounded-xl border-[1.5px] p-3.5 transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#1c81ff] bg-[#1c81ff]/5 dark:bg-[#1c81ff]/10"
                              : "border-gray-200 dark:border-white/10 hover:border-[#1c81ff]/40 hover:bg-white dark:hover:bg-white/5"
                          }`}>
                          <RadioGroupItem value={key} id={`q${index}-${key}`} className="mt-0.5 shrink-0" />
                          <Label htmlFor={`q${index}-${key}`} className="flex-1 cursor-pointer text-[14px] text-gray-700 dark:text-gray-300">
                            <span className={`font-extrabold mr-2 ${isSelected ? "text-[#1c81ff]" : "text-gray-400 dark:text-gray-600"}`}>{key}.</span>
                            {option}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                )}
                {question.type === "essay" && (
                  <textarea
                    value={getAnswer(index)}
                    onChange={(e) => handleEssayAnswer(index, e.target.value)}
                    placeholder="Jawaban essay…"
                    rows={5}
                    disabled={isSubmitting || examEnded}
                    className="w-full rounded-xl bg-white dark:bg-[#0b1215] border border-slate-200 dark:border-gray-800 px-4 py-3 text-[14px] leading-relaxed text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all resize-none"
                  />
                )}
              </div>
            </div>
          ))}

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button type="submit" disabled={isSubmitting || examEnded || answers.length < questions.length}
            className="w-full flex items-center justify-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-3 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[14px]">
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Mengirim…</> : <><Send className="h-4 w-4" />Submit Ujian ({answers.length}/{questions.length})</>}
          </button>
        </form>
      </div>
    </div>
  );
}
