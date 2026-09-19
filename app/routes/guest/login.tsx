import InputForm from "@/components/custom/input-form";
import LoadingButton from "@/components/custom/loading-button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLogin } from "@/hooks/auth";
import { getFieldError } from "@/utils/global";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { teamPhotos } from "@/components/custom/team-photos";
import { Eye, EyeOff } from "lucide-react";
import { StreakModal } from "@/components/custom/streak-modal";

export function meta() {
  return [
    { title: "Sign in - WTC" },
    { name: "description", content: "Sign in to your WTC account" },
  ];
}

export default function Login() {
  const login = useLogin();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Trigger animasi masuk
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Slider foto kanan
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % teamPhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login.mutate(form);
  };

  return (
    <>
      <StreakModal result={login.streakResult} onClose={login.proceed} />
      <style>{`
      @media (max-width: 1023px) {
        .auth-form-panel h1,
        .auth-form-panel p,
        .auth-form-panel label,
        .auth-form-panel span {
          color: white !important;
        }
        .auth-form-panel .wtc-blue-label {
          color: #1c81ff !important;
        }
        .auth-form-panel input {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(255,255,255,0.2) !important;
          color: white !important;
        }
        .auth-form-panel input::placeholder {
          color: rgba(255,255,255,0.35) !important;
        }
        .auth-form-panel .text-red-600 {
          color: #fca5a5 !important;
        }
      }
    `}</style>
      <div className="relative flex h-screen w-full font-sans overflow-hidden">
        {/* KIRI - Form Area */}
        <div className="auth-form-panel w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-[10%] relative z-10 bg-black/70 lg:bg-white lg:backdrop-blur-none dark:lg:bg-[#0a0f12] py-4 overflow-y-auto">
          <div
            className={`w-full max-w-[400px] mx-auto transition-all duration-1000 ease-out ${isLoaded ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"}`}>
            {/* Heading */}
            <div className="mb-5">
              <p
                className="wtc-blue-label text-[12px] font-bold uppercase tracking-[0.15em] mb-2"
                style={{ color: "#1c81ff" }}>
                Welcome Back
              </p>
              <h1
                className="font-extrabold mb-2 text-gray-900 dark:text-white"
                style={{
                  fontSize: "clamp(26px, 3vw, 34px)",
                  lineHeight: "1.1",
                  letterSpacing: "-0.02em",
                }}>
                Sign in to your
                <br />
                account.
              </h1>
              <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
                Continue your learning journey and build your future in tech.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col">
              {login.error && login.error?.message !== "Validation errors" && (
                <Alert
                  variant="destructive"
                  className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg p-3">
                  <AlertDescription className="font-medium text-sm">
                    {login.error?.message ?? "An unknown error occurred."}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-4 [&_input]:w-full [&_input]:bg-slate-50 dark:[&_input]:bg-[#1a1a1a] [&_input]:border [&_input]:border-slate-200 dark:[&_input]:border-gray-800 [&_input]:rounded-xl [&_input]:px-4 [&_input]:py-3.5 [&_input]:text-[15px] [&_input]:text-gray-900 dark:[&_input]:text-white [&_input]:shadow-sm focus:[&_input]:outline-none focus:[&_input]:border-[#1c81ff] focus:[&_input]:ring-1 focus:[&_input]:ring-[#1c81ff] transition-all [&_label]:text-[13px] [&_label]:font-bold [&_label]:text-gray-700 dark:[&_label]:text-gray-300 [&_label]:mb-1.5 [&_label]:block">
                <InputForm
                  name="email"
                  placeholder="you@webtech.camp"
                  text="Email Address"
                  type="email"
                  value={form.email}
                  handleChange={handleChange}
                  error={getFieldError(login.error?.errors, "email")}
                />

                <div>
                  <InputForm
                    name="password"
                    text="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    handleChange={handleChange}
                    error={getFieldError(login.error?.errors, "password")}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={-1}
                        className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }>
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                  />
                  <div className="flex justify-end mt-2">
                    <Link
                      to="/forgot-password"
                      className="text-[13px] font-bold transition-colors hover:underline"
                      style={{ color: "#1c81ff" }}>
                      Forgot password?
                    </Link>
                  </div>
                </div>
              </div>

              {/* Sign in Button */}
              <div className="mt-4">
                <LoadingButton
                  loading={login.isPending}
                  text="Sign in"
                  className="w-full py-3.5 rounded-xl text-[15px] font-bold transition-transform hover:scale-[1.02] active:scale-95 shadow-md shadow-blue-600/20"
                  style={{
                    background: "#1c81ff",
                    color: "#ffffff",
                    border: "none",
                  }}
                />
              </div>

              {/* OAuth Buttons */}
              <div className="mt-2">
                <OAuthButtons />
              </div>
            </form>

            {/* Footer Link */}
            <p className="mt-5 text-center text-[14px] text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-gray-900 dark:text-white transition-colors hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* KANAN - Visual Area — full screen on mobile, right half on desktop */}
        <div className="absolute inset-0 lg:left-1/2 lg:right-0 lg:inset-y-0 bg-[#000000] overflow-hidden z-0">
          <div
            className={`absolute inset-0 w-full h-full transition-all duration-1000 delay-300 ease-out ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}>
            {teamPhotos.map((photo, index) => (
              <div
                key={index}
                className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
                style={{
                  opacity: index === currentSlide ? 1 : 0,
                  backgroundImage: `url(${photo})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transform:
                    index === currentSlide ? "scale(1)" : "scale(1.05)",
                  transition: "opacity 1s ease-in-out, transform 5s ease-out",
                }}
              />
            ))}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)",
              }}
            />
          </div>

          {/* Bottom text — desktop only */}
          <div className="hidden lg:block absolute bottom-16 left-16 right-16 z-20">
            <p
              className="text-[12px] font-bold uppercase tracking-[0.15em] mb-4"
              style={{ color: "#1c81ff" }}>
              Creator's Note
            </p>
            <h2 className="font-extrabold text-white text-[28px] lg:text-[34px] mb-8 leading-snug max-w-lg">
              "We built WTC to be a meaningful space for digital talents to
              continuously grow and shape the future."
            </h2>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full flex items-center justify-center border-[2px] border-white/20 shadow-lg overflow-hidden bg-white">
                <img
                  src="/brand-pack/pinat.png"
                  alt="Budi Santoso"
                  className="h-full w-full object-cover p-1.5"
                />
              </div>

              <div>
                <p className="text-white font-bold text-[15px]">
                  Pinat Dev Team
                </p>
                <p className="text-gray-400 text-[12px] uppercase tracking-wider mt-0.5">
                  WTC Creators
                </p>
              </div>
            </div>
            <div className="mt-12 flex gap-2">
              {teamPhotos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className="h-1.5 rounded-full transition-all duration-300 hover:opacity-80"
                  style={{
                    width: i === currentSlide ? "24px" : "8px",
                    background:
                      i === currentSlide ? "#1c81ff" : "rgba(255,255,255,0.2)",
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
