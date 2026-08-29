import InputForm from "@/components/custom/input-form";
import LoadingButton from "@/components/custom/loading-button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRegister } from "@/hooks/auth";
import { getFieldError } from "@/utils/global";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { teamPhotos } from "@/components/custom/team-photos";

export function meta() {
  return [
    { title: "Create Account - WTC" },
    { name: "description", content: "Create your WTC account and start learning" },
  ];
}

export default function Register() {
  const register = useRegister();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => { setIsLoaded(true); }, []);

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
    register.mutate(form);
  };

  return (
    <div className="flex min-h-screen w-full bg-[#ffffff] overflow-hidden font-sans">

      {/* KIRI — Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-[10%] relative z-10 bg-[#ffffff] py-12">
        <div
          className={`w-full max-w-[400px] mx-auto transition-all duration-1000 ease-out ${
            isLoaded ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
          }`}
        >
          {/* Logo */}
          <Link to="/" className="inline-block mb-10">
            <img
              src="/brand-pack/logo-h-dark.svg"
              alt="WTC Logo"
              className="h-8 lg:h-9 w-auto hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* Heading */}
          <div className="mb-7">
            <p
              className="text-[12px] font-bold uppercase tracking-[0.15em] mb-3"
              style={{ color: "#1c81ff" }}
            >
              Get Started
            </p>
            <h1
              className="font-extrabold mb-3 text-gray-900"
              style={{
                fontSize: "clamp(28px, 3.5vw, 38px)",
                lineHeight: "1.1",
                letterSpacing: "-0.02em",
              }}
            >
              Create your
              <br />
              account.
            </h1>
            <p className="text-[15px] leading-relaxed text-gray-500">
              Join hundreds of developers building their careers with WTC.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col">
            {register.error && register.error?.message !== "Validation errors" && (
              <Alert
                variant="destructive"
                className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-lg p-3"
              >
                <AlertDescription className="font-medium text-sm">
                  {register.error?.message ?? "An unknown error occurred."}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-4 [&_input]:w-full [&_input]:bg-slate-50 [&_input]:border [&_input]:border-slate-200 [&_input]:rounded-xl [&_input]:px-4 [&_input]:py-3.5 [&_input]:text-[15px] [&_input]:text-gray-900 [&_input]:shadow-sm focus:[&_input]:outline-none focus:[&_input]:border-[#1c81ff] focus:[&_input]:ring-1 focus:[&_input]:ring-[#1c81ff] transition-all [&_label]:text-[13px] [&_label]:font-bold [&_label]:text-gray-700 [&_label]:mb-1.5 [&_label]:block">
              <InputForm
                name="name"
                placeholder="John Doe"
                text="Full Name"
                type="text"
                value={form.name}
                handleChange={handleChange}
                error={getFieldError(register.error?.errors, "name")}
              />

              <InputForm
                name="email"
                placeholder="you@webtech.camp"
                text="Email Address"
                type="email"
                value={form.email}
                handleChange={handleChange}
                error={getFieldError(register.error?.errors, "email")}
              />

              <InputForm
                name="password"
                text="Password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                handleChange={handleChange}
                error={getFieldError(register.error?.errors, "password")}
              />

              <InputForm
                name="password_confirmation"
                text="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={form.password_confirmation}
                handleChange={handleChange}
                error={getFieldError(register.error?.errors, "password_confirmation")}
              />
            </div>

            {/* Submit */}
            <div className="mt-5">
              <LoadingButton
                loading={register.isPending}
                text="Create Account"
                className="w-full py-4 rounded-xl text-[15px] font-bold transition-transform hover:scale-[1.02] active:scale-95 shadow-md shadow-blue-600/20"
                style={{
                  background: "#1c81ff",
                  color: "#ffffff",
                  border: "none",
                }}
              />
            </div>

            {/* OAuth */}
            <div className="mt-2">
              <OAuthButtons />
            </div>
          </form>

          {/* Footer link */}
          <p className="mt-7 text-center text-[14px] text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-gray-900 transition-colors hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* KANAN — Visual Area */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#000000] overflow-hidden">
        <div
          className={`absolute inset-0 w-full h-full transition-all duration-1000 delay-300 ease-out ${
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        >
          {teamPhotos.map((photo, index) => (
            <div
              key={index}
              className="absolute inset-0 w-full h-full"
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

          {/* Gradient overlays */}
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

        {/* Bottom text overlay */}
        <div className="absolute bottom-16 left-16 right-16 z-20">
          <p
            className="text-[12px] font-bold uppercase tracking-[0.15em] mb-4"
            style={{ color: "#1c81ff" }}
          >
            Why WTC?
          </p>
          <h2 className="font-extrabold text-white text-[28px] lg:text-[34px] mb-8 leading-snug max-w-lg">
            "Real projects, real mentors, real career. WTC is where it starts."
          </h2>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#1c81ff] flex items-center justify-center text-white font-bold text-lg border-2 border-white/20">
              B
            </div>
            <div>
              <p className="text-white font-bold text-[15px]">Budi Santoso</p>
              <p className="text-gray-400 text-[12px] uppercase tracking-wider mt-0.5">
                Mobile Dev · IT Consultant
              </p>
            </div>
          </div>

          {/* Slide dots */}
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

        {/* Floating dots decoration */}
        <style>{`
          @keyframes float {
            0%   { transform: translateY(0px);   }
            50%  { transform: translateY(-12px); }
            100% { transform: translateY(0px);   }
          }
        `}</style>
        <div
          className="absolute top-[15%] right-[15%] w-3 h-3 rounded-full"
          style={{ background: "#1c81ff", animation: "float 4s ease-in-out infinite" }}
        />
        <div
          className="absolute top-[35%] right-[30%] w-2 h-2 rounded-full"
          style={{
            background: "#31c7c8",
            animation: "float 5s ease-in-out infinite",
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute top-[55%] right-[10%] w-1.5 h-1.5 rounded-full"
          style={{
            background: "#ffffff",
            opacity: 0.4,
            animation: "float 6s ease-in-out infinite",
            animationDelay: "2s",
          }}
        />
      </div>
    </div>
  );
}
