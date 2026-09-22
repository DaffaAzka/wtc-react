import { useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { useVerifyEmail, useResendVerification } from "@/hooks/auth";
import { CheckCircle2, XCircle, Loader2, MailCheck } from "lucide-react";

export function meta() {
  return [
    { title: "Verify Email - WTC" },
    { name: "description", content: "Verify your WTC email address" },
  ];
}

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const verify = useVerifyEmail();
  const resend = useResendVerification();

  // Auto-verify on mount if token is present
  useEffect(() => {
    if (token) {
      // Clear token from URL immediately — prevents it leaking via Referer headers
      // or being reused if the user shares the URL after verification.
      window.history.replaceState({}, "", "/verify-email");
      verify.mutate(token);
    }
  }, []);

  const isTokenMissing = !token;
  const isLoading = verify.isPending;
  const isSuccess = verify.isSuccess;
  const isError = verify.isError || isTokenMissing;
  const errorMessage = isTokenMissing
    ? "No verification token found. Please use the link from your email."
    : verify.error?.message ?? "Verification failed. The link may be invalid or expired.";

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
            WTC Email Verification
          </h1>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-10 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-[#1c81ff] animate-spin" />
            <p className="text-[14px] text-gray-500 font-medium">
              Verifying your email…
            </p>
          </div>
        )}

        {/* Success */}
        {isSuccess && (
          <div className="rounded-2xl bg-white border border-[#00E676]/30 shadow-sm overflow-hidden">
            <div className="bg-[#00E676]/8 border-b border-[#00E676]/20 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00E676]/15 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6 text-[#00E676]" />
              </div>
              <div>
                <p className="font-extrabold text-[16px] text-[#00c853]">
                  Email Verified!
                </p>
                <p className="text-[13px] text-[#00c853]/70 mt-0.5">
                  Your email address has been confirmed.
                </p>
              </div>
            </div>
            <div className="px-6 py-6 flex flex-col gap-4">
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Your account is now fully activated. You can continue using WTC.
              </p>
              <Link
                to="/student/dashboard"
                className="w-full py-3 rounded-xl text-[15px] font-bold text-white text-center transition-transform hover:scale-[1.02] active:scale-95 shadow-md shadow-blue-600/20"
                style={{ background: "#1c81ff" }}
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="rounded-2xl bg-white border border-red-200 shadow-sm overflow-hidden">
            <div className="bg-red-50 border-b border-red-200 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="font-extrabold text-[16px] text-red-700">
                  Verification Failed
                </p>
                <p className="text-[13px] text-red-500 mt-0.5">
                  This link is invalid or has expired.
                </p>
              </div>
            </div>
            <div className="px-6 py-6 flex flex-col gap-4">
              <p className="text-[14px] text-gray-500 leading-relaxed">
                {errorMessage}
              </p>

              {/* Resend — only if user is logged in (token in localStorage) */}
              {typeof window !== "undefined" && localStorage.getItem("token") ? (
                <div className="flex flex-col gap-3">
                  {resend.isSuccess ? (
                    <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-[13px] text-[#1c81ff] font-medium text-center">
                      Verification email sent. Check your inbox.
                    </div>
                  ) : (
                    <button
                      onClick={() => resend.mutate()}
                      disabled={resend.isPending}
                      className="w-full py-3 rounded-xl text-[15px] font-bold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
                      style={{ background: "#1c81ff" }}
                    >
                      {resend.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending…
                        </span>
                      ) : (
                        "Resend Verification Email"
                      )}
                    </button>
                  )}
                  {resend.isError && (
                    <p className="text-[13px] text-red-500 text-center">
                      {resend.error?.message ?? "Failed to resend. Please try again."}
                    </p>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="w-full py-3 rounded-xl text-[15px] font-bold text-white text-center transition-transform hover:scale-[1.02] active:scale-95 shadow-md shadow-blue-600/20"
                  style={{ background: "#1c81ff" }}
                >
                  Log in to Resend
                </Link>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-[12px] text-gray-400 mt-8">
          Powered by WTC Learning Management System
        </p>
      </div>
    </div>
  );
}
