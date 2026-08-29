import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, Send, Loader2, ClipboardList } from "lucide-react";
import type { Challenge } from "@/types/model";
import type { MCQQuestion, EssayQuestion } from "@/types/challenge";

interface QuizGroupFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

type Answer = { questionIndex: number; type: "multiple_choice" | "essay"; answer: string };

export function QuizGroupForm({ challenge, canSubmit, isSubmitting, onSubmit }: QuizGroupFormProps) {
  const questions = challenge.metadata?.questions || [];
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState("");

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-8 flex flex-col items-center gap-3 text-center">
        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <p className="text-[14px] text-red-600 dark:text-red-400">Quiz ini tidak memiliki soal. Silakan hubungi instruktur.</p>
      </div>
    );
  }

  const totalScore = questions.reduce((sum: number, q: any) => sum + q.score, 0);
  const progress = (answers.length / questions.length) * 100;

  const handleMCQAnswer = (questionIndex: number, answer: string) =>
    setAnswers((prev) => [...prev.filter((a) => a.questionIndex !== questionIndex), { questionIndex, type: "multiple_choice", answer }]);

  const handleEssayAnswer = (questionIndex: number, text: string) =>
    setAnswers((prev) => { const f = prev.filter((a) => a.questionIndex !== questionIndex); return text.trim() ? [...f, { questionIndex, type: "essay", answer: text }] : f; });

  const getAnswer = (questionIndex: number) => answers.find((a) => a.questionIndex === questionIndex)?.answer || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answers.length < questions.length) {
      setError(`Silakan jawab semua soal (${answers.length}/${questions.length} terjawab)`);
      return;
    }
    const essayAnswers = answers.filter((a) => a.type === "essay");
    for (const answer of essayAnswers) {
      const wordCount = answer.answer.trim().split(/\s+/).length;
      if (wordCount < 10) { setError(`Jawaban essay harus minimal 10 kata (soal #${answer.questionIndex + 1})`); return; }
    }
    onSubmit(null, JSON.stringify({
      quiz_type: "quiz_group", total_questions: questions.length,
      answers: answers.sort((a, b) => a.questionIndex - b.questionIndex),
      submitted_at: new Date().toISOString(),
    }));
    setError("");
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
            <ClipboardList className="h-4 w-4 text-[#1c81ff]" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Quiz Group</span>
        </div>
        <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-0.5 text-[12px] font-bold text-gray-500 dark:text-gray-400 tabular-nums">
          {totalScore} poin total
        </span>
      </div>

      <div className="p-5">
        {!canSubmit ? (
          <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-4">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[14px] text-red-600 dark:text-red-400">Anda telah mencapai batas maksimum percobaan untuk challenge ini.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[12px] text-gray-400 dark:text-gray-600 tabular-nums">
                <span>Progress</span>
                <span>{answers.length}/{questions.length} soal terjawab</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                <div className="h-full bg-[#1c81ff] transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Questions */}
            {questions.map((question: any, index: number) => (
              <div key={index}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-200 dark:border-white/10">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#1c81ff]/10 font-mono text-[11px] font-extrabold text-[#1c81ff]">
                    {index + 1}
                  </span>
                  <span className="text-[12px] font-bold text-gray-500 dark:text-gray-400">{question.score} poin</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    question.type === "multiple_choice" ? "bg-[#1c81ff]/10 text-[#1c81ff]" : "bg-[#31c7c8]/10 text-[#31c7c8]"
                  }`}>
                    {question.type === "multiple_choice" ? "Pilihan Ganda" : "Essay"}
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
                            className={`flex items-start gap-3 rounded-xl border-[1.5px] p-3.5 cursor-pointer transition-all ${
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
                    <div className="space-y-2">
                      {(question as EssayQuestion).rubric && (
                        <div className="rounded-lg bg-[#1c81ff]/5 border border-[#1c81ff]/15 px-3 py-2 text-[12px] text-gray-600 dark:text-gray-300">
                          <span className="font-bold text-[#1c81ff]">Rubrik: </span>
                          {(question as EssayQuestion).rubric}
                        </div>
                      )}
                      <textarea
                        value={getAnswer(index)}
                        onChange={(e) => handleEssayAnswer(index, e.target.value)}
                        placeholder="Tulis jawaban essay Anda di sini (minimal 10 kata)…"
                        rows={5}
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-white dark:bg-[#0b1215] border border-slate-200 dark:border-gray-800 px-4 py-3 text-[14px] leading-relaxed text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all resize-none"
                      />
                      <p className="text-[12px] text-gray-400 dark:text-gray-600 tabular-nums">
                        {getAnswer(index).trim().split(/\s+/).filter((w) => w).length} kata
                      </p>
                    </div>
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

            <button type="submit" disabled={isSubmitting || answers.length < questions.length}
              className="w-full flex items-center justify-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-3 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[14px]">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Mengirim…</> : <><Send className="h-4 w-4" />Kirim Jawaban Quiz ({answers.length}/{questions.length})</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
