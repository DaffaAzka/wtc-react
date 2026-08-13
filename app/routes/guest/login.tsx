import InputForm from "@/components/custom/input-form";
import LoadingButton from "@/components/custom/loading-button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLogin } from "@/hooks/auth";
import { getFieldError } from "@/utils/global";
import { useState } from "react";
import { Link } from "react-router";
import { CheckCircle2 } from "lucide-react";

export function meta() {
  return [
    { title: "Login - WTC LMS" },
    { name: "description", content: "Login to your account" },
  ];
}

const highlights = [
  "Personalized learning paths powered by AI",
  "Track your progress across every course",
  "Learn at your own pace, anytime, anywhere",
];

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
    <div className="grid min-h-screen lg:grid-cols-2 bg-background">
      {/* Left brand panel — intentionally always dark, independent of theme */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-zinc-950 p-10">
        {/* subtle dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/40" />

        {/* logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            W
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            WTC LMS
          </span>
        </div>

        {/* headline */}
        <div className="relative z-10 max-w-md">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-white/50">
              AI-powered learning paths
            </span>
          </div>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white">
            Welcome back to your learning journey
          </h1>
          <p className="mt-3 text-sm text-white/50">
            Pick up right where you left off. Your courses, progress, and
            goals are waiting.
          </p>

          <ul className="mt-8 space-y-3">
            {highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-white/70"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>

          {/* signature element: learning-path node graphic */}
          <div className="relative z-10 mt-10 max-w-sm">
            <svg viewBox="0 0 380 70" className="w-full" fill="none">
              <path
                d="M8 55 C 70 15, 140 85, 210 38 S 340 10, 372 35"
                stroke="white"
                strokeOpacity="0.12"
                strokeWidth="2"
                strokeDasharray="4 7"
                strokeLinecap="round"
              />
              <circle cx="8" cy="55" r="5" fill="var(--color-primary)" />
              <circle cx="130" cy="58" r="5" fill="var(--color-primary)" />
              <circle cx="210" cy="38" r="6" fill="var(--color-primary)" />
              <circle
                cx="210"
                cy="38"
                r="10"
                fill="none"
                stroke="var(--color-primary)"
                strokeOpacity="0.5"
              >
                <animate
                  attributeName="r"
                  values="8;15;8"
                  dur="2.2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.6;0;0.6"
                  dur="2.2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx="372"
                cy="35"
                r="5"
                fill="none"
                stroke="white"
                strokeOpacity="0.3"
              />
            </svg>
            <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-wider text-white/30">
              <span>Fundamentals</span>
              <span className="text-primary">In progress</span>
              <span>Advanced</span>
            </div>
          </div>
        </div>

        {/* plain bordered stat block */}
        <div className="relative z-10 w-fit rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-2xl font-semibold text-white">12,400+</p>
          <p className="text-xs text-white/40">
            learners growing their skills with WTC
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              W
            </div>
            <span className="text-lg font-semibold tracking-tight">
              WTC LMS
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Login to your account
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <div className="flex flex-col gap-5">
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
              placeholder="m@example.com"
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

          <div className="mt-6 flex flex-col gap-4">
            <LoadingButton loading={login.isPending} text="Login" />
            <OAuthButtons />
            <Link to="/register" className="w-full text-center">
              <p className="flex flex-row justify-center gap-1 text-sm text-muted-foreground">
                Don't have an account?
                <span className="text-primary hover:underline">
                  Register
                </span>
              </p>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}