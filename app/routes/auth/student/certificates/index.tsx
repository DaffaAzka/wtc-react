import { useState, useEffect } from "react";
import { Award, RefreshCw, Inbox, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useStudentCertificates, useUpdateCertificate } from "@/hooks/certificate";
import { useCertificateTemplate } from "@/hooks/certificate";
import { CertificateViewerModal } from "@/features/auth/certificates/certificate-viewer-modal";
import type { Certificate } from "@/types/certificate";

// ── Grade badge ───────────────────────────────────────────────────────────────

const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  "A+": { bg: "bg-[#00E676]/10", text: "text-[#00E676]" },
  "A":  { bg: "bg-[#00E676]/10", text: "text-[#00E676]" },
  "B+": { bg: "bg-[#1c81ff]/10", text: "text-[#1c81ff]" },
  "B":  { bg: "bg-[#1c81ff]/10", text: "text-[#1c81ff]" },
  "C+": { bg: "bg-[#f6b60b]/10", text: "text-[#f6b60b]" },
  "C":  { bg: "bg-[#f6b60b]/10", text: "text-[#f6b60b]" },
  "D":  { bg: "bg-[#ff007b]/10", text: "text-[#ff007b]" },
  "F":  { bg: "bg-red-500/10",   text: "text-red-500" },
};

function GradeBadge({ grade }: { grade: string }) {
  const c = GRADE_COLORS[grade] ?? { bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-500 dark:text-gray-400" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-extrabold tracking-wide ${c.bg} ${c.text}`}>
      {grade}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Certificate card ──────────────────────────────────────────────────────────

function CertificateCard({
  cert,
  onView,
  onUpdate,
  isUpdating,
}: {
  cert: Certificate;
  onView: (cert: Certificate) => void;
  onUpdate: (cert: Certificate) => void;
  isUpdating: boolean;
}) {
  const updateAvailable = cert.status === "update_available";

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white dark:bg-[#0b1215] border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 p-4 group">
      {/* Thumbnail */}
      <button
        onClick={() => onView(cert)}
        className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#1c81ff] focus:ring-offset-2"
        title="View certificate"
        aria-label={`View certificate for ${cert.track.title}`}
      >
        {cert.track.image_url ? (
          <img
            src={cert.track.image_url}
            alt={cert.track.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Award className="h-8 w-8 text-gray-300 dark:text-gray-600" />
          </div>
        )}
      </button>

      {/* Middle: info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="font-extrabold text-[15px] text-gray-900 dark:text-white truncate leading-tight" style={{ letterSpacing: "-0.01em" }}>
          {cert.track.title}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <GradeBadge grade={cert.grade} />
          <span className="text-[12px] font-bold text-gray-400 dark:text-gray-500 tabular-nums">
            {cert.grade_score.toFixed(1)}
          </span>
        </div>
        <div className="text-[12px] text-gray-400 dark:text-gray-500">
          Issued {formatDate(cert.issued_at)}
        </div>
        <div className="font-mono text-[11px] text-gray-400 dark:text-gray-600 truncate">
          #{cert.certificate_number}
        </div>
      </div>

      {/* Right: update button */}
      <div className="shrink-0">
        <button
          onClick={() => updateAvailable && onUpdate(cert)}
          disabled={!updateAvailable || isUpdating}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition-all ${
            updateAvailable
              ? "bg-[#f6b60b]/10 text-[#f6b60b] border border-[#f6b60b]/30 hover:bg-[#f6b60b]/20"
              : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-white/10 cursor-not-allowed opacity-60"
          }`}
        >
          {isUpdating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Update
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StudentCertificates() {
  const { certificates, loading } = useStudentCertificates();
  const { template } = useCertificateTemplate();
  const updateCertificate = useUpdateCertificate();

  const [mounted, setMounted] = useState(false);
  const [viewingCert, setViewingCert] = useState<Certificate | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleUpdate = (cert: Certificate) => {
    setUpdatingId(cert.id);
    updateCertificate.mutate(cert.id, {
      onSuccess: () => {
        toast.success("Certificate updated successfully");
        setUpdatingId(null);
      },
      onError: (err) => {
        toast.error(err?.message || "Failed to update certificate");
        setUpdatingId(null);
      },
    });
  };

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Header */}
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
          Student
        </p>
        <h1
          className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          Sertifikat Saya
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
          Sertifikat yang telah kamu raih dari pembelajaran.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl bg-white dark:bg-[#0b1215] border border-gray-200 dark:border-white/10 p-4"
            >
              <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-gray-200 dark:bg-white/10 animate-pulse rounded-lg" />
                <div className="h-3 w-24 bg-gray-100 dark:bg-white/5 animate-pulse rounded-md" />
                <div className="h-3 w-32 bg-gray-100 dark:bg-white/5 animate-pulse rounded-md" />
              </div>
              <div className="h-9 w-24 bg-gray-100 dark:bg-white/5 animate-pulse rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#0b1215] border border-gray-200 dark:border-white/10 shadow-sm p-14 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Award className="h-7 w-7 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="font-extrabold text-[17px] text-gray-900 dark:text-white mb-2">
            Belum ada sertifikat
          </h3>
          <p className="text-[14px] text-gray-500 dark:text-gray-400">
            Selesaikan learning path untuk mendapatkan sertifikat.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              cert={cert}
              onView={setViewingCert}
              onUpdate={handleUpdate}
              isUpdating={updatingId === cert.id}
            />
          ))}
        </div>
      )}

      {/* Viewer modal */}
      {viewingCert && (
        <CertificateViewerModal
          certificate={viewingCert}
          htmlContent={template?.html_template}
          cssContent={template?.css_styles}
          onClose={() => setViewingCert(null)}
        />
      )}
    </div>
  );
}
