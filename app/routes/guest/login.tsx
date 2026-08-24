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
  return [{ title: "Sign in - WTC" }, { name: "description", content: "Sign in to your WTC account" }];
}

export default function Login() {
  const login = useLogin();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % teamPhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [teamPhotos.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login.mutate(form);
  };

  return (
    <div className="dark fixed inset-0 flex items-center justify-center overflow-hidden bg-background p-4">
      {/* Background Carousel - Team Photos */}
      <div className="absolute inset-0 z-0">
        {teamPhotos.map((photo, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
            style={{
              backgroundImage: `url(${photo})`,
              backgroundSize: "cover",
              backgroundPosition: "center 35%",
              backgroundRepeat: "no-repeat",
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-background/70 via-background/50 to-background/70" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-background/60 via-transparent to-background/50" />

      <div className="pointer-events-none absolute inset-0 z-[3]">
        <div className="absolute -top-40 -left-32 h-[420px] w-[420px] animate-pulse rounded-full bg-primary/20 blur-[120px] duration-[4000ms]" />
        <div className="absolute -bottom-48 -right-24 h-[380px] w-[380px] animate-pulse rounded-full bg-primary/10 blur-[120px] delay-1000 duration-[5000ms]" />
        <div className="absolute top-1/2 left-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-primary/8 blur-[100px] delay-500 duration-[3000ms]" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[3] opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle, var(--border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
        }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes kenburns {
            0% {
              transform: scale(1) translate(0, 0);
            }
            50% {
              transform: scale(1.03) translate(-1%, 0.5%);
            }
            100% {
              transform: scale(1) translate(0, 0);
            }
          }
        `,
        }}
      />

      <div className={`relative z-[10] w-full max-w-[420px] transition-all duration-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
        <div className="mb-8 flex flex-col items-center text-center">
          <img src="/brand-pack/logo-v-dark.svg" alt="WTC Logo" className="h-48 w-auto" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-7 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-300 hover:border-border/80 hover:shadow-primary/5 sm:p-8"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent blur-sm" />
          </div>

          <div className="space-y-1.5">
            <p className="font-mono text-xs text-primary/90">
              <span className="text-muted-foreground">$</span> wtc auth login
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground/80">Sign in to continue your learning journey</p>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {login.error && login.error?.message !== "Validation errors" && (
              <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-2 border-destructive/30 bg-destructive/10 duration-300">
                <AlertDescription>{login.error?.message ?? "An unknown error occurred."}</AlertDescription>
              </Alert>
            )}

            <InputForm
              name="email"
              placeholder="you@webtech.camp"
              text="Email Address"
              type="email"
              value={form.email}
              handleChange={handleChange}
              error={getFieldError(login.error?.errors, "email")}
            />

            <div className="space-y-2">
              <InputForm
                name="password"
                text="Password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                handleChange={handleChange}
                error={getFieldError(login.error?.errors, "password")}
              />
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary">
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <LoadingButton loading={login.isPending} text="Sign in" className="w-full" />
          </div>

          <div className="mt-6">
            <OAuthButtons />
          </div>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-foreground underline decoration-primary/30 underline-offset-4 transition-all hover:decoration-primary">
              Create one
            </Link>
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
            <Link to="/privacy" className="transition-colors hover:text-muted-foreground">
              Privacy
            </Link>
            <span>•</span>
            <Link to="/terms" className="transition-colors hover:text-muted-foreground">
              Terms
            </Link>
            <span>•</span>
            <Link to="/help" className="transition-colors hover:text-muted-foreground">
              Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
