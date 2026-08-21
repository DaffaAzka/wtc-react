import InputForm from "@/components/custom/input-form";
import LoadingButton from "@/components/custom/loading-button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRegister } from "@/hooks/auth";
import { getFieldError } from "@/utils/global";
import { useState, useEffect } from "react";
import { Link } from "react-router";

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

  // Foto tim untuk carousel background - sama dengan login
  const teamPhotos = [
    "/images/team/team4.png",
    "/images/team/team2.png",
    "/images/team/team3.png",
    "/images/team/team5.png",
  ];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % teamPhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [teamPhotos.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    register.mutate(form);
  };

  return (
    <div className="dark fixed inset-0 flex items-center justify-center overflow-hidden bg-background p-4">
      {/* Background Carousel - Team Photos */}
      <div className="absolute inset-0 z-0">
        {teamPhotos.map((photo, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${photo})`,
              backgroundSize: "cover",
              backgroundPosition: "center 35%",
              backgroundRepeat: "no-repeat",
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay - reduced opacity untuk foto lebih keliatan */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-background/70 via-background/50 to-background/70" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-background/60 via-transparent to-background/50" />

      {/* Enhanced aurora glow with animation */}
      <div className="pointer-events-none absolute inset-0 z-[3]">
        <div className="absolute -top-40 -left-32 h-[420px] w-[420px] animate-pulse rounded-full bg-primary/20 blur-[120px] duration-[4000ms]" />
        <div className="absolute -bottom-48 -right-24 h-[380px] w-[380px] animate-pulse rounded-full bg-primary/10 blur-[120px] delay-1000 duration-[5000ms]" />
        <div className="absolute top-1/2 left-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-primary/8 blur-[100px] delay-500 duration-[3000ms]" />
      </div>

      {/* Fine dot grid, Vercel-style */}
      <div
        className="pointer-events-none absolute inset-0 z-[3] opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
        }}
      />

      <div
        className={`relative z-[10] w-full max-w-[420px] transition-all duration-700 ${
          isLoaded
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
      >
        {/* Wordmark with enhanced styling */}
        <div className="mb-4 flex flex-col items-center text-center">
          <div className="group relative mb-3">
            <div className="absolute inset-0 h-10 w-10 rotate-45 rounded-xl bg-primary/20 blur-xl transition-all duration-300 group-hover:bg-primary/30" />
            <div className="relative h-10 w-10 rotate-45 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/70 shadow-[0_0_40px_-8px_var(--primary)] transition-all duration-300 group-hover:shadow-[0_0_50px_-6px_var(--primary)]">
              <span className="absolute inset-0 flex -rotate-45 items-center justify-center text-base font-bold text-primary-foreground">
                W
              </span>
            </div>
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            WTC
          </span>
          <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
            Webtech Training Camp
          </span>
        </div>

        {/* Card with enhanced effects */}
        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-300 hover:border-border/80 hover:shadow-primary/5 sm:p-5"
        >
          {/* Top gradient border */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

          {/* Subtle glow on hover */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent blur-sm" />
          </div>

          <div className="space-y-1.5">
            <p className="font-mono text-xs text-primary/90">
              <span className="text-muted-foreground">$</span> wtc auth register
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Create Your Account
            </h1>
            <p className="text-sm text-muted-foreground/80">
              Start your learning journey today
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {register.error && register.error?.message !== "Validation errors" && (
              <Alert
                variant="destructive"
                className="animate-in fade-in-50 slide-in-from-top-2 border-destructive/30 bg-destructive/10 duration-300"
              >
                <AlertDescription>
                  {register.error?.message ?? "An unknown error occurred."}
                </AlertDescription>
              </Alert>
            )}

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

          <div className="mt-4">
            <LoadingButton
              loading={register.isPending}
              text="Create Account"
              className="w-full"
            />
          </div>

          <div className="mt-4">
            <OAuthButtons />
          </div>
        </form>

        {/* Footer */}
        <div className="mt-4 space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-foreground underline decoration-primary/30 underline-offset-4 transition-all hover:decoration-primary"
            >
              Sign in
            </Link>
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
            <Link
              to="/privacy"
              className="transition-colors hover:text-muted-foreground"
            >
              Privacy
            </Link>
            <span>•</span>
            <Link
              to="/terms"
              className="transition-colors hover:text-muted-foreground"
            >
              Terms
            </Link>
            <span>•</span>
            <Link
              to="/help"
              className="transition-colors hover:text-muted-foreground"
            >
              Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
