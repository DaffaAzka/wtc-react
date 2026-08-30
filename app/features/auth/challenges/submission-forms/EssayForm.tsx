import { useState } from "react";
import { AlertCircle, Send, Loader2 } from "lucide-react";
import type { Challenge } from "@/types/model";

interface EssayFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

export function EssayForm({
  challenge,
  canSubmit,
  isSubmitting,
  onSubmit,
}: EssayFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const wordCount = content
    .trim()
    .split(/\s+/)
    .filter((w) => w).length;
  const charCount = content.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Silakan isi jawaban Anda");
      return;
    }
    const minWords = 10;
    if (wordCount < minWords) {
      setError(
        `Jawaban harus minimal ${minWords} kata (saat ini: ${wordCount} kata)`,
      );
      return;
    }
    onSubmit(null, content.trim());
    setError("");
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/5">
        <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
          <Send className="h-4 w-4 text-[#1c81ff]" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white">
          Tulis Jawaban Essay
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
            <div className="space-y-2">
              <label
                htmlFor="essay-content"
                className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
                Jawaban Anda
              </label>
              <textarea
                id="essay-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan jawaban essay Anda di sini…"
                rows={16}
                disabled={isSubmitting}
                className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-3 text-[14px] leading-relaxed text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all resize-none"
              />
              <div className="flex items-center justify-between text-[12px] text-gray-400 dark:text-gray-600 tabular-nums">
                <span>{wordCount} kata</span>
                <span>{charCount} karakter</span>
              </div>

              {challenge.settings?.explanation && (
                <div className="rounded-xl bg-[#1c81ff]/5 border border-[#1c81ff]/15 p-4 mt-2">
                  <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 mb-1">
                    Kriteria Penilaian
                  </p>
                  <p className="text-[13px] text-gray-600 dark:text-gray-300">
                    {challenge.settings.explanation}
                  </p>
                </div>
              )}
            </div>

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
              disabled={isSubmitting || !content.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-3 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[14px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengirim…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Kirim Jawaban
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
