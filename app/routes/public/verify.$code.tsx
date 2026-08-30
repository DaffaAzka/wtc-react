import { useParams } from "react-router";
import { useVerifyCertificate } from "@/hooks/certificate";
import { CheckCircle2, XCircle, Award, Loader2 } from "lucide-react";

// ── Grade badge ───────────────────────────────────────────────────────────────

const GRADE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "A+": { bg: "bg-[#00E676]/10", text: "text-[#00E676]", border: "border-[#00E676]/30" },
  "A":  { bg: "bg-[#00E676]/10", text: "text-[#00E676]", border: "border-[#00E676]/30" },
  "B+": { bg: "bg-[#1c81ff]/10", text: "text-[#1c81ff]", border: "border-[#1c81ff]/30" },
  "B":  { bg: "bg-[#1c81ff]/10", text: "text-[#1c81ff]", border: "border-[#1c81ff]/30" },
  "C+": { bg: "bg-[#f6b60b]/10", text: "text-[#f6b60b]", border: "border-[#f6b60b]/30" },
  "C":  { bg: "bg-[#f6b60b]/10", text: "text-[#f6b60b]", border: "border-[#f6b60b]/30" },
  "D":  { bg: "bg-[#ff007b]/10", text: "text-[#ff007b]", border: "border-[#ff007b]/30" },
  "F":  { bg: "bg-red-500/10",   text: "text-red-500",   border: "border-red-500/30" },
};

function GradeBadge({ grade }: { grade: string }) {
  const c = GRADE_COLORS[grade] ?? {
    bg: "bg-gray-100",
    text: "text-gray-500",
    border: "border-gray-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-4 py-1.5 text-[18px] font-extrabold tracking-wide ${c.bg} ${c.text} ${c.border}`}
    >
      {grade}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VerifyCertificate() {
  const { code } = useParams<{ code: string }>();
  const { result, loading } = useVerifyCertificate(code ?? "");

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{
        background:
          "radial-gradient(ellipse at 20% 30%, rgba(28,129,255,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(49,199,200,0.05) 0%, transparent 60%), #f8fafc",
      }}
    >
      {/* Card */}
      <div className="w-full max-w-md">
        {/* Logo / branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1c81ff]/10 border border-[#1c81ff]/20 mb-4">
            <Award className="h-7 w-7 text-[#1c81ff]" />
          </div>
          <h1 className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#1c81ff]">
            WTC Certificate Verification
          </h1>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-10 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-[#1c81ff] animate-spin" />
            <p className="text-[14px] text-gray-500 font-medium">Verifying certificate…</p>
          </div>
        )}

        {/* Invalid */}
        {!loading && result && !result.valid && (
          <div className="rounded-2xl bg-white border border-red-200 shadow-sm overflow-hidden">
            <div className="bg-red-50 border-b border-red-200 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="font-extrabold text-[16px] text-red-700">Certificate Not Valid</p>
                <p className="text-[13px] text-red-500 mt-0.5">
                  This certificate could not be verified.
                </p>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-[14px] text-gray-500 leading-relaxed">
                The certificate with code{" "}
                <span className="font-mono font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                  {code}
                </span>{" "}
                does not exist or has been revoked. If you believe this is an error, please contact
                the issuing institution.
              </p>
            </div>
          </div>
        )}

        {/* Valid */}
        {!loading && result && result.valid && result.certificate && (
          <div className="rounded-2xl bg-white border border-[#00E676]/30 shadow-sm overflow-hidden">
            {/* Valid banner */}
            <div className="bg-[#00E676]/8 border-b border-[#00E676]/20 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00E676]/15 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6 text-[#00E676]" />
              </div>
              <div>
                <p className="font-extrabold text-[16px] text-[#00c853]">Certificate Verified</p>
                <p className="text-[13px] text-[#00c853]/70 mt-0.5">
                  This is an authentic certificate.
                </p>
              </div>
            </div>

            {/* Certificate details */}
            <div className="px-6 py-6 space-y-5">
              {/* Student name */}
              <div className="text-center space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
                  Awarded to
                </p>
                <p
                  className="text-[24px] font-extrabold text-gray-900 leading-tight"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {result.certificate.profile.display_name}
                </p>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Track */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
                  Learning Track
                </p>
                <p className="font-bold text-[16px] text-gray-900">
                  {result.certificate.track.title}
                </p>
              </div>

              {/* Grade row */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
                    Grade
                  </p>
                  <div className="flex items-center gap-2">
                    <GradeBadge grade={result.certificate.grade} />
                    <span className="text-[14px] font-bold text-gray-500 tabular-nums">
                      {result.certificate.grade_score.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
                    Issued On
                  </p>
                  <p className="font-bold text-[14px] text-gray-900">
                    {formatDate(result.certificate.issued_at)}
                  </p>
                </div>
              </div>

              {/* Certificate number */}
              {result.certificate.certificate_number && (
                <>
                  <div className="h-px bg-gray-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
                      Certificate Number
                    </span>
                    <span className="font-mono text-[12px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
                      #{result.certificate.certificate_number}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Error / no result after load */}
        {!loading && !result && (
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-10 flex flex-col items-center gap-4 text-center">
            <XCircle className="h-10 w-10 text-gray-300" />
            <p className="text-[14px] text-gray-500">
              Unable to verify certificate. Please check the code and try again.
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[12px] text-gray-400 mt-8">
          Powered by WTC Learning Management System
        </p>
      </div>
    </div>
  );
}
