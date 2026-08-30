import { useState } from "react";
import { AlertCircle, Send, Loader2, PenLine } from "lucide-react";
import type { Challenge } from "@/types/model";

interface FillBlankFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

export function FillBlankForm({
  challenge,
  canSubmit,
  isSubmitting,
  onSubmit,
}: FillBlankFormProps) {
  const numberOfBlanks =
    (challenge.settings?.blank_count as number | undefined) ?? 5;
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState("");

  const filledCount = Object.keys(answers).filter((k) =>
    answers[Number(k)]?.trim(),
  ).length;
  const progress = (filledCount / numberOfBlanks) * 100;

  const handleAnswerChange = (blankIndex: number, value: string) =>
    setAnswers((prev) => ({ ...prev, [blankIndex]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filledCount < numberOfBlanks) {
      setError(
        `Silakan isi semua blank (${filledCount}/${numberOfBlanks} terisi)`,
      );
      return;
    }
    const submissionData = {
      type: "fill_blank",
      blanks: Array.from({ length: numberOfBlanks }, (_, i) => ({
        blank_number: i + 1,
        answer: answers[i + 1]?.trim() || "",
      })),
      submitted_at: new Date().toISOString(),
    };
    onSubmit(null, JSON.stringify(submissionData));
    setError("");
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
            <PenLine className="h-4 w-4 text-[#1c81ff]" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">
            Fill in the Blanks
          </span>
        </div>
        <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-0.5 text-[12px] font-bold text-gray-500 dark:text-gray-400 tabular-nums">
          {filledCount}/{numberOfBlanks} terisi
        </span>
      </div>

      <div className="p-5">
        {!canSubmit ? (
          <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-4">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[14px] text-red-600 dark:text-red-400">
              Anda telah mencapai batas maksimum percobaan untuk challenge ini.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[12px] text-gray-400 dark:text-gray-600 tabular-nums">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#1c81ff] transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-xl bg-[#1c81ff]/5 border border-[#1c81ff]/15 p-4">
              <div className="flex items-start gap-2.5">
                <PenLine className="h-4 w-4 text-[#1c81ff] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Instruksi
                  </p>
                  <ul className="space-y-1 text-[12px] text-gray-500 dark:text-gray-400 list-disc list-inside">
                    <li>Baca soal dengan teliti</li>
                    <li>Isi setiap blank dengan jawaban yang tepat</li>
                    <li>Perhatikan kapitalisasi dan ejaan</li>
                    <li>Pastikan semua blank terisi sebelum submit</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-sm max-w-none dark:prose-invert rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4">
              <div dangerouslySetInnerHTML={{ __html: challenge.content }} />
            </div>

            {/* Blank inputs */}
            <div className="space-y-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4">
              <p className="text-[13px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <PenLine className="h-3.5 w-3.5" />
                Jawaban Anda
              </p>
              <div className="grid gap-3">
                {Array.from({ length: numberOfBlanks }, (_, i) => {
                  const blankNumber = i + 1;
                  const isFilled = !!answers[blankNumber]?.trim();
                  return (
                    <div key={blankNumber} className="space-y-1.5">
                      <label
                        htmlFor={`blank-${blankNumber}`}
                        className="text-[13px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        Blank #{blankNumber}
                        {isFilled && (
                          <span className="inline-flex items-center rounded-full bg-[#00E676]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#00E676]">
                            ✓
                          </span>
                        )}
                      </label>
                      <input
                        id={`blank-${blankNumber}`}
                        type="text"
                        value={answers[blankNumber] || ""}
                        onChange={(e) =>
                          handleAnswerChange(blankNumber, e.target.value)
                        }
                        placeholder={`Isi blank #${blankNumber}…`}
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-white dark:bg-[#0b1215] border border-slate-200 dark:border-gray-800 px-4 py-2.5 text-[14px] font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            {filledCount > 0 && (
              <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                  Preview Jawaban
                </p>
                <div className="space-y-1 font-mono text-[13px]">
                  {Object.entries(answers)
                    .filter(([_, v]) => v?.trim())
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-gray-400 dark:text-gray-600">
                          Blank #{key}:
                        </span>
                        <span className="font-bold text-[#1c81ff]">
                          {value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[13px] text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || filledCount < numberOfBlanks}
              className="w-full flex items-center justify-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-3 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[14px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengirim…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Kirim Jawaban ({filledCount}/{numberOfBlanks})
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
