import InputForm from "@/components/custom/input-form";
import LoadingButton from "@/components/custom/loading-button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLogin } from "@/hooks/auth";
import { getFieldError } from "@/utils/global";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { teamPhotos } from "@/components/custom/team-photos";

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
    <div className="flex min-h-screen w-full bg-[#ffffff] overflow-hidden font-sans">
      {/* KIRI - Form Area (Modern Solid Structure) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-[10%] relative z-10 bg-[#ffffff]">
        <div
          className={`w-full max-w-[400px] mx-auto transition-all duration-1000 ease-out ${isLoaded ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"}`}>
          {/* Logo WTC */}
          <Link to="/" className="inline-block mb-12">
            <img
              src="/brand-pack/logo-h-dark.svg"
              alt="WTC Logo"
              className="h-24 md:h-28 lg:h-32 w-auto transition-all duration-300 hover:scale-105"
            />
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <p
              className="text-[12px] font-bold uppercase tracking-[0.15em] mb-3"
              style={{ color: "#1c81ff" }}>
              Welcome Back
            </p>
            <h1
              className="font-extrabold mb-3 text-gray-900"
              style={{
                fontSize: "clamp(32px, 4vw, 42px)",
                lineHeight: "1.1",
                letterSpacing: "-0.02em",
              }}>
              Sign in to your
              <br />
              account.
            </h1>
            <p className="text-[15px] leading-relaxed text-gray-500">
              Continue your learning journey and build your future in tech.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col">
            {login.error && login.error?.message !== "Validation errors" && (
              <Alert
                variant="destructive"
                className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-lg p-3">
                <AlertDescription className="font-medium text-sm">
                  {login.error?.message ?? "An unknown error occurred."}
                </AlertDescription>
              </Alert>
            )}

            {/* OVERRIDE CSS Input: Bikin kotak abu-abu elegan, bukan polos transparan */}
            <div className="flex flex-col gap-5 [&_input]:w-full [&_input]:bg-slate-50 [&_input]:border [&_input]:border-slate-200 [&_input]:rounded-xl [&_input]:px-4 [&_input]:py-3.5 [&_input]:text-[15px] [&_input]:text-gray-900 [&_input]:shadow-sm focus:[&_input]:outline-none focus:[&_input]:border-[#1c81ff] focus:[&_input]:ring-1 focus:[&_input]:ring-[#1c81ff] transition-all [&_label]:text-[13px] [&_label]:font-bold [&_label]:text-gray-700 [&_label]:mb-1.5 [&_label]:block">
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
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  handleChange={handleChange}
                  error={getFieldError(login.error?.errors, "password")}
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
            <div className="mt-6">
              <LoadingButton
                loading={login.isPending}
                text="Sign in"
                className="w-full py-4 rounded-xl text-[15px] font-bold transition-transform hover:scale-[1.02] active:scale-95 shadow-md shadow-blue-600/20"
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
          <p className="mt-8 text-center text-[14px] text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-gray-900 transition-colors hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* KANAN - Visual Area */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#000000] overflow-hidden">
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
                transform: index === currentSlide ? "scale(1)" : "scale(1.05)",
                transition: "opacity 1s ease-in-out, transform 5s ease-out",
              }}
            />
          ))}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
            }}
          />
        </div>

        {/* Konten Kanan: Harapan / Creator's Note */}
        <div className="absolute bottom-16 left-16 right-16 z-20">
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
            {/* Foto Profile / Logo */}
            <div className="h-12 w-12 rounded-full flex items-center justify-center border-[2px] border-white/20 shadow-lg overflow-hidden bg-white">
              <img
                src="/brand-pack/icon-2.svg"
                alt="WTC Creator"
                className="h-full w-full object-cover p-1.5" /* p-1.5 ngasih jarak aman biar logo gak kepotong border */
              />
            </div>

            {/* Teks Nama */}
            <div>
              <p className="text-white font-bold text-[15px]">Pinat Dev Team</p>
              <p className="text-gray-400 text-[12px] uppercase tracking-widest mt-0.5">
                WTC Creators
              </p>
            </div>
          </div>

          {/* Dots Indicator */}
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

        <style>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
            100% { transform: translateY(0px); }
          }
        `}</style>
        <div
          className="absolute top-[15%] right-[15%] w-3 h-3 rounded-full"
          style={{
            background: "#1c81ff",
            animation: "float 4s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-[35%] right-[30%] w-2 h-2 rounded-full"
          style={{
            background: "#00E676",
            animation: "float 5s ease-in-out infinite",
            animationDelay: "1s",
          }}
        />
      </div>
    </div>
  );
}
