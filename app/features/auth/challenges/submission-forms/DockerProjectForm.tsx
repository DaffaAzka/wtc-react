import { useState, useRef } from "react";
import { AlertCircle, Upload, Loader2, FileText, X, Package } from "lucide-react";
import type { Challenge } from "@/types/model";

interface DockerProjectFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

const ALLOWED_DOCKER_EXTENSIONS = [".zip", ".tar", ".tar.gz", ".tgz", ".rar"];

function validateDockerFile(file: File): string | null {
  if (file.size > 50 * 1024 * 1024) return "Ukuran file harus kurang dari 50MB";
  const name = file.name.toLowerCase();
  if (!ALLOWED_DOCKER_EXTENSIONS.some((ext) => name.endsWith(ext)))
    return "File harus berupa arsip (ZIP, TAR, RAR) yang berisi Docker project";
  return null;
}

export function DockerProjectForm({ challenge, canSubmit, isSubmitting, onSubmit }: DockerProjectFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dockerCommands, setDockerCommands] = useState("");
  const [notes, setNotes] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) { setFile(null); setFileError(""); return; }
    const err = validateDockerFile(selected);
    if (err) { setFileError(err); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; return; }
    setFileError("");
    setFile(selected);
  };

  const handleRemoveFile = () => {
    setFile(null); setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setFileError("Silakan upload file Docker project (ZIP/TAR)"); return; }
    if (!dockerCommands.trim()) { setFileError("Silakan masukkan Docker commands untuk menjalankan project"); return; }
    onSubmit(file, JSON.stringify({
      docker_commands: dockerCommands.trim(),
      notes: notes.trim(),
      filename: file.name,
      submitted_at: new Date().toISOString(),
    }));
    setFile(null); setDockerCommands(""); setNotes(""); setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/5">
        <div className="w-8 h-8 rounded-full bg-[#2548d8]/10 flex items-center justify-center">
          <Package className="h-4 w-4 text-[#2548d8]" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white">Submit Docker Project</span>
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
            <div className="rounded-xl bg-[#2548d8]/5 border border-[#2548d8]/15 p-4">
              <div className="flex items-start gap-2.5">
                <Package className="h-4 w-4 text-[#2548d8] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">Requirement Docker Project</p>
                  <ul className="space-y-1 text-[12px] text-gray-500 dark:text-gray-400 list-disc list-inside">
                    <li>File harus berisi Dockerfile, docker-compose.yml, dan source code</li>
                    <li>Compress project menjadi ZIP atau TAR (maksimal 50MB)</li>
                    <li>Pastikan Docker image bisa di-build tanpa error</li>
                    <li>Sertakan README.md dengan instruksi setup</li>
                    <li>Tulis Docker commands untuk build dan run</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* File upload */}
            <div className="space-y-2">
              <label htmlFor="docker-file" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
                Upload Docker Project (ZIP/TAR) <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                id="docker-file"
                type="file"
                accept=".zip,.tar,.tar.gz,.tgz,.rar"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="block w-full text-[13px] text-gray-700 dark:text-gray-300 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-bold file:bg-[#2548d8]/10 file:text-[#2548d8]"
              />
              {file && (
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-[#2548d8]/10 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-[#2548d8]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] text-gray-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 tabular-nums">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={handleRemoveFile} disabled={isSubmitting}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-red-500 disabled:opacity-40 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <p className="text-[12px] text-gray-400 dark:text-gray-600">Format: .zip, .tar, .tar.gz (maksimal 50MB)</p>
            </div>

            {/* Docker commands */}
            <div className="space-y-1.5">
              <label htmlFor="docker-commands" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
                Docker Commands <span className="text-red-500">*</span>
              </label>
              <textarea
                id="docker-commands"
                value={dockerCommands}
                onChange={(e) => setDockerCommands(e.target.value)}
                placeholder={"# Build image\ndocker build -t myapp:latest .\n\n# Run container\ndocker run -p 8080:8080 myapp:latest\n\n# Atau dengan docker-compose\ndocker-compose up -d"}
                rows={8}
                disabled={isSubmitting}
                className="w-full rounded-xl bg-slate-950 dark:bg-[#0a0f12] border border-slate-700 dark:border-white/10 px-4 py-3 text-[13px] font-mono leading-relaxed text-green-400 placeholder-slate-600 focus:border-[#2548d8] focus:ring-1 focus:ring-[#2548d8] outline-none transition-all resize-none"
              />
              <p className="text-[12px] text-gray-400 dark:text-gray-600">
                Tulis command untuk build dan run Docker project
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label htmlFor="docker-notes" className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
                Catatan Tambahan <span className="font-normal text-gray-400 dark:text-gray-600">(opsional)</span>
              </label>
              <textarea
                id="docker-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Environment variables yang dibutuhkan, port yang digunakan, atau informasi penting lainnya…"
                rows={4}
                disabled={isSubmitting}
                className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-3 text-[14px] leading-relaxed text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all resize-none"
              />
            </div>

            {fileError && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[13px] text-red-600 dark:text-red-400">{fileError}</p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting || !file || !dockerCommands.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[#2548d8] text-white font-bold rounded-xl py-3 shadow-md shadow-blue-800/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[14px]">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Mengupload…</> : <><Upload className="h-4 w-4" />Submit Docker Project</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
