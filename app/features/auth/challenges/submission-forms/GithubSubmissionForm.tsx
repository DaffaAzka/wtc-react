import { useState } from "react";
import { AlertCircle, Send, Loader2, FolderGit } from "lucide-react";
import type { Challenge } from "@/types/model";

interface GithubSubmissionFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

const GITHUB_PATTERN = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;

export function GithubSubmissionForm({ challenge, canSubmit, isSubmitting, onSubmit }: GithubSubmissionFormProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [error, setError] = useState("");

  const validateGithubUrl = (url: string): string | null => {
    if (!url.trim()) return "URL repository GitHub tidak boleh kosong";
    if (!GITHUB_PATTERN.test(url.trim()))
      return "URL harus berupa repository GitHub yang valid (contoh: https://github.com/username/repo)";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateGithubUrl(repoUrl);
    if (validationError) { setError(validationError); return; }
    onSubmit(null, JSON.stringify({ repo_url: repoUrl.trim(), branch: branch.trim() || "main", submitted_at: new Date().toISOString() }));
    setError("");
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/5">
        <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
          <FolderGit className="h-4 w-4 text-[#1c81ff]" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white">Submit GitHub Repository</span>
      </div>

      <div className="p-5">
        {!canSubmit ? (
          <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-4">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[14px] text-red-600 dark:text-red-400">Anda telah mencapai batas maksimum percobaan untuk challenge ini.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Instructions */}
            <div className="rounded-xl bg-[#1c81ff]/5 border border-[#1c81ff]/15 p-4">
              <div className="flex items-start gap-2.5">
                <FolderGit className="h-4 w-4 text-[#1c81ff] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">Instruksi</p>
                  <ol className="space-y-1 text-[12px] text-gray-500 dark:text-gray-400 list-decimal list-inside">
                    <li>Push code ke repository GitHub (public atau private)</li>
                    <li>Pastikan repository memiliki README.md yang jelas</li>
                    <li>Copy URL repository dan paste di bawah</li>
                    <li>Pilih branch yang akan dinilai</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Repo URL */}
            <div className="space-y-1.5">
              <label htmlFor="repo-url" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
                URL Repository GitHub <span className="text-red-500">*</span>
              </label>
              <input
                id="repo-url"
                type="url"
                value={repoUrl}
                onChange={(e) => { setRepoUrl(e.target.value); setError(""); }}
                placeholder="https://github.com/username/repository"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-3 text-[14px] font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
              />
              <p className="text-[12px] text-gray-400 dark:text-gray-600">Format: https://github.com/username/repository</p>
            </div>

            {/* Branch */}
            <div className="space-y-1.5">
              <label htmlFor="branch" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
                Branch <span className="font-normal text-gray-400 dark:text-gray-600">(opsional)</span>
              </label>
              <input
                id="branch"
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-3 text-[14px] font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
              />
              <p className="text-[12px] text-gray-400 dark:text-gray-600">Default: main</p>
            </div>

            {/* Preview */}
            {repoUrl && (
              <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Preview Submission</p>
                <div className="text-[13px] font-mono space-y-1">
                  <p className="text-gray-600 dark:text-gray-300">
                    Repository: <span className="text-[#1c81ff]">{repoUrl}</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Branch: <span className="text-[#1c81ff]">{branch || "main"}</span>
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting || !repoUrl.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-3 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[14px]">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Mengirim…</> : <><Send className="h-4 w-4" />Kirim Repository</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
