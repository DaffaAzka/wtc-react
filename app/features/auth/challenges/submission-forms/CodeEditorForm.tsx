import { useState } from "react";
import { AlertCircle, Send, Loader2, Code } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Challenge } from "@/types/model";

interface CodeEditorFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python",     label: "Python" },
  { value: "java",       label: "Java" },
  { value: "cpp",        label: "C++" },
  { value: "c",          label: "C" },
  { value: "go",         label: "Go" },
  { value: "rust",       label: "Rust" },
  { value: "php",        label: "PHP" },
  { value: "ruby",       label: "Ruby" },
  { value: "sql",        label: "SQL" },
  { value: "html",       label: "HTML" },
  { value: "css",        label: "CSS" },
];

const LANG_TIPS: Record<string, string> = {
  python:     "Python menggunakan indentasi untuk block code, bukan kurung kurawal.",
  javascript: "Gunakan const/let, hindari var. Arrow function untuk callback.",
  java:       "Setiap class harus dalam package. Main: public static void main(String[] args)",
};

export function CodeEditorForm({ challenge, canSubmit, isSubmitting, onSubmit }: CodeEditorFormProps) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [error, setError] = useState("");

  const lineCount = code.split("\n").length;
  const charCount = code.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { setError("Silakan masukkan kode Anda"); return; }
    if (code.trim().length < 10) { setError("Kode harus minimal 10 karakter"); return; }
    onSubmit(null, JSON.stringify({ language, code: code.trim(), submitted_at: new Date().toISOString() }));
    setError("");
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/5">
        <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
          <Code className="h-4 w-4 text-[#1c81ff]" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white">Submit Kode</span>
      </div>

      <div className="p-5">
        {!canSubmit ? (
          <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-4">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[14px] text-red-600 dark:text-red-400">Anda telah mencapai batas maksimum percobaan untuk challenge ini.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tips */}
            <div className="rounded-xl bg-[#1c81ff]/5 border border-[#1c81ff]/15 p-4">
              <div className="flex items-start gap-2.5">
                <Code className="h-4 w-4 text-[#1c81ff] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">Tips Menulis Kode</p>
                  <ul className="space-y-1 text-[12px] text-gray-500 dark:text-gray-400 list-disc list-inside">
                    <li>Gunakan indentasi yang konsisten (2 atau 4 spasi)</li>
                    <li>Tambahkan komentar untuk logika kompleks</li>
                    <li>Test kode sebelum submit</li>
                    <li>Pastikan kode sesuai requirement</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Language selector */}
            <div className="space-y-1.5">
              <label htmlFor="language" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
                Bahasa Pemrograman
              </label>
              <Select value={language} onValueChange={setLanguage} disabled={isSubmitting}>
                <SelectTrigger id="language"
                  className="rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Code area */}
            <div className="space-y-2">
              <label htmlFor="code-editor" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
                Kode Anda <span className="text-red-500">*</span>
              </label>
              <textarea
                id="code-editor"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Tulis kode ${language} Anda di sini…\n\nfunction solve() {\n  // your solution\n}`}
                rows={20}
                disabled={isSubmitting}
                spellCheck={false}
                className="w-full rounded-xl bg-slate-950 dark:bg-[#0a0f12] border border-slate-700 dark:border-white/10 px-4 py-3 text-[13px] font-mono leading-relaxed text-green-400 placeholder-slate-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all resize-none"
              />
              <div className="flex items-center justify-between text-[12px] text-gray-400 dark:text-gray-600 tabular-nums">
                <span>{lineCount} baris</span>
                <span>{charCount} karakter</span>
              </div>
              {LANG_TIPS[language] && (
                <p className="text-[12px] text-[#1c81ff]/70">💡 {LANG_TIPS[language]}</p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting || !code.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-3 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[14px]">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Mengirim…</> : <><Send className="h-4 w-4" />Kirim Kode</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
