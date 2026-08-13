import InputForm from "@/components/custom/input-form";
import LoadingButton from "@/components/custom/loading-button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLogin } from "@/hooks/auth";
import { getFieldError } from "@/utils/global";
import { useState } from "react";
import { Link } from "react-router";

export function meta() {
  return [
    { title: "Sign in - WTC" },
    { name: "description", content: "Sign in to your WTC account" },
  ];
}

export default function Login() {
  const login = useLogin();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login.mutate(form);
  };

  return (
    // `dark` forces the shadcn dark-theme tokens for this whole subtree,
    // so InputForm / OAuthButtons / Alert / LoadingButton render correctly
    // dark regardless of the user's site-wide theme — same technique
    // Linear/Vercel use for auth pages that stay dark year-round.
    <div className="dark fixed inset-0 flex items-center justify-center overflow-hidden bg-background p-4">
      {/* aurora glow — the one bold gesture on an otherwise quiet page */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-primary/30 blur-[120px]" />
        <div className="absolute -bottom-48 -right-24 h-[380px] w-[380px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* fine dot grid, Vercel-style */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
        }}
      />

      <div className="relative z-10 w-full max-w-[380px]">
        {/* wordmark */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-3 h-9 w-9 rotate-45 rounded-lg bg-gradient-to-br from-primary to-primary/60 shadow-[0_0_32px_-6px_var(--primary)]">
            <span className="absolute inset-0 flex -rotate-45 items-center justify-center text-sm font-bold text-primary-foreground">
              W
            </span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            WTC
          </span>
          <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Webtech Training Camp
          </span>
        </div>

        {/* card */}
        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-2xl border border-border bg-card/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-7"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

          <p className="font-mono text-xs text-primary">
            <span className="text-muted-foreground">$</span> wtc auth login
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Sign in to your account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Continue building where you left off.
          </p>

          <div className="mt-5 flex flex-col gap-3.5">
            {login.error && login.error?.message !== "Validation errors" && (
              <Alert
                variant="destructive"
                className="bg-destructive/10 border-destructive/30"
              >
                <AlertDescription>
                  {login.error?.message ?? "An unknown error occurred."}
                </AlertDescription>
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
            <InputForm
              name="password"
              text="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              handleChange={handleChange}
              error={getFieldError(login.error?.errors, "password")}
            />
          </div>

          <div className="mt-5 flex flex-col gap-3.5">
            <LoadingButton loading={login.isPending} text="Sign in" />
            <OAuthButtons />
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}