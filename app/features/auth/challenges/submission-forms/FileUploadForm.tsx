import { useState, useRef } from "react";
import { AlertCircle, Upload, Loader2, FileText, X } from "lucide-react";
import type { Challenge } from "@/types/model";

interface FileUploadFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".zip",
  ".rar",
  ".7z",
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".py",
  ".java",
  ".cpp",
  ".c",
  ".html",
  ".css",
  ".json",
  ".xml",
  ".md",
  ".sql",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
];

function validateFile(file: File): string | null {
  if (file.size > 10 * 1024 * 1024) return "Ukuran file harus kurang dari 10MB";
  const name = file.name.toLowerCase();
  if (!ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext)))
    return "Tipe file tidak diizinkan. Silakan upload dokumen, kode, atau arsip yang valid.";
  return null;
}

export function FileUploadForm({
  challenge,
  canSubmit,
  isSubmitting,
  onSubmit,
}: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      setFileError("");
      return;
    }
    const err = validateFile(selected);
    if (err) {
      setFileError(err);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFileError("");
    setFile(selected);
  };

  const handleRemove = () => {
    setFile(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setFileError("Silakan pilih file untuk diupload");
      return;
    }
    onSubmit(file, "");
    setFile(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/5">
        <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
          <Upload className="h-4 w-4 text-[#1c81ff]" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white">
          Upload File
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
            {/* Instructions */}
            <div className="rounded-xl bg-[#1c81ff]/5 border border-[#1c81ff]/15 p-4">
              <div className="flex items-start gap-2.5">
                <Upload className="h-4 w-4 text-[#1c81ff] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Instruksi Upload
                  </p>
                  <ul className="space-y-1 text-[12px] text-gray-500 dark:text-gray-400 list-disc list-inside">
                    <li>Ukuran file maksimal: 10MB</li>
                    <li>Format: PDF, DOC, ZIP, kode, gambar</li>
                    <li>Pastikan file sesuai requirement challenge</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* File input */}
            <div className="space-y-2">
              <label
                htmlFor="file-upload"
                className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
                Pilih File <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="block w-full text-[13px] text-gray-700 dark:text-gray-300 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-bold file:bg-[#1c81ff]/10 file:text-[#1c81ff]"
              />

              {/* File preview */}
              {file && (
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-[#1c81ff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 tabular-nums">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={isSubmitting}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-red-500 disabled:opacity-40 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {fileError && (
                <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-red-600 dark:text-red-400">
                    {fileError}
                  </p>
                </div>
              )}
              <p className="text-[12px] text-gray-400 dark:text-gray-600">
                Tipe yang didukung: .pdf, .doc, .docx, .txt, .zip, .rar, kode
                sumber, dan gambar
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !file}
              className="w-full flex items-center justify-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-3 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[14px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengupload…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload File
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
