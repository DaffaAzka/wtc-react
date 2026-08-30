import { useState, useRef } from "react";
import { X, Download, AlertCircle, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSubmitFeedback } from "@/hooks/certificate";
import type { Certificate } from "@/types/certificate";

type Props = {
  certificate: Certificate;
  htmlContent?: string;
  cssContent?: string;
  onClose: () => void;
};

export function CertificateViewerModal({ certificate, htmlContent, cssContent, onClose }: Props) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const submitFeedback = useSubmitFeedback();

  const handleDownload = () => {
    const content = htmlContent ?? "";
    const styles = cssContent ?? "";
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${styles}</style></head><body>${content}</body></html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate-${certificate.certificate_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return;
    submitFeedback.mutate(
      { id: certificate.id, message: feedbackText.trim() },
      {
        onSuccess: () => {
          toast.success("Feedback sent successfully");
          setFeedbackText("");
          setShowFeedback(false);
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to send feedback");
        },
      },
    );
  };

  const iframeDoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: transparent; }
    ${cssContent ?? ""}
  </style></head><body>${htmlContent ?? "<p style='font-family:sans-serif;color:#666;padding:40px'>No certificate content available.</p>"}</body></html>`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── Top-right action buttons (outside certificate) ── */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => setShowFeedback((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-2 text-[13px] font-bold transition-colors backdrop-blur-sm"
        >
          <AlertCircle className="h-4 w-4" />
          Report Issue
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-xl bg-[#1c81ff] hover:bg-[#1c81ff]/90 text-white px-3 py-2 text-[13px] font-bold transition-colors shadow-lg shadow-blue-500/25"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={onClose}
          className="flex items-center justify-center h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors backdrop-blur-sm"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ── Main area: certificate + optional feedback panel ── */}
      <div className="flex flex-col items-center gap-4 w-full max-w-5xl px-4 pt-16 pb-6">
        {/* Certificate iframe — no backdrop color, only drop shadow */}
        <div
          className="w-full rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}
        >
          <iframe
            ref={iframeRef}
            srcDoc={iframeDoc}
            title={`Certificate ${certificate.certificate_number}`}
            sandbox="allow-same-origin"
            className="w-full"
            style={{ height: "560px", border: "none", display: "block" }}
          />
        </div>

        {/* ── Feedback panel (slides in below certificate) ── */}
        {showFeedback && (
          <div className="w-full rounded-2xl bg-white dark:bg-[#0b1215] border border-gray-200 dark:border-white/10 p-5 shadow-2xl">
            <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400 mb-3">
              Report an Issue
            </p>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Describe the issue with this certificate…"
              rows={3}
              className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-3 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all resize-none"
            />
            <div className="flex items-center justify-end gap-2 mt-3">
              <button
                onClick={() => { setShowFeedback(false); setFeedbackText(""); }}
                className="rounded-xl border border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={!feedbackText.trim() || submitFeedback.isPending}
                className="flex items-center gap-2 rounded-xl bg-[#1c81ff] text-white font-bold px-4 py-2 text-[13px] hover:bg-[#1c81ff]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitFeedback.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
