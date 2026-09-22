import { useNavigate } from "react-router";
import { useResendVerification } from "@/hooks/auth";
import { useAuth } from "@/contexts/auth";
import { resolveDefaultView, resolveViewPath } from "@/utils/roles";
import { MailCheck, Loader2, CheckCircle2 } from "lucide-react";

export function meta() {
  return [
    { title: "Check Your Email - WTC" },
    { name: "description", content: "Please verify your email address to continue" },
  ];
}

export default function CheckEmail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const resend = useResendVerification();

  const handleContinue = () => {
    const path = user
      ? resolveViewPath(resolveDefaultView(user as any))
      : "/student/dashboard";
    navigate(path);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{
        background:
          "radial-gradient(ellipse at 20% 30%, rgba(28,129,255,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(49,199,200,0.05) 0%, transparent 60%), #f8fafc",
      }}
    >
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1c81ff]/10 border border-[#1c81ff]/20 mb-4">
            <MailCheck className="h-7 w-7 text-[#1c81ff]" />
          </div>
          <h1 className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#1c81ff]">
            WTC LMS
          </h1>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-100">
            <h2
              className="font-extrabold text-gray-900 mb-1"
              style={{ fontSize: "clamp(20px, 3vw, 24px)", letterSpacing: "-0.02em" }}
            >
              Check your email
            </h2>
            <p className="text-[14px] text-gray-500 leading-relaxed">
              We sent a verification link to{" "}
              {user?.email ? (
                <span className="font-bold text-gray-700">{user.email}</span>
              ) : (
                "your email address"
              )}
              . Click the link to activate your account.
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-6 flex flex-col gap-4">
            {/* Steps */}
            <div className="flex flex-col gap-3">
              {[
                "Open your email inbox",
                "Find the email from noreply@wtc.pinat.nl",
                'Click the "Verify Email" button',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1c81ff]/10 border border-[#1c81ff]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[11px] font-bold text-[#1c81ff]">{i + 1}</span>
                  </div>
                  <p className="text-[14px] text-gray-600 leading-snug pt-0.5">{step}</p>
                </div>
              ))}
            </div>

            <div className="h-px bg-gray-100" />

            {/* Continue anyway */}
            <button
              onClick={handleContinue}
              className="w-full py-3 rounded-xl text-[15px] font-bold text-white transition-transform hover:scale-[1.02] active:scale-95 shadow-md shadow-blue-600/20"
              style={{ background: "#1c81ff" }}
            >
              Continue to Dashboard
            </button>

            {/* Resend */}
            <div className="text-center">
              <p className="text-[13px] text-gray-400 mb-2">Didn't receive the email?</p>
              {resend.isSuccess ? (
                <div className="flex items-center justify-center gap-1.5 text-[13px] text-[#00c853] font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Verification email resent!
                </div>
              ) : (
                <button
                  onClick={() => resend.mutate()}
                  disabled={resend.isPending}
                  className="text-[13px] font-bold text-[#1c81ff] hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {resend.isPending ? (
                    <span className="flex items-center gap-1.5 justify-center">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    "Resend verification email"
                  )}
                </button>
              )}
              {resend.isError && (
                <p className="text-[12px] text-red-500 mt-1">
                  {resend.error?.message ?? "Failed to resend. Please try again."}
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-[12px] text-gray-400 mt-8">
          Powered by WTC Learning Management System
        </p>
      </div>
    </div>
  );
}
