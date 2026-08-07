import InputForm from "@/components/custom/input-form";
import LoadingButton from "@/components/custom/loading-button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLogin } from "@/hooks/auth";
import { getFieldError } from "@/utils/global";
import { useState } from "react";
import { Link } from "react-router";

export function meta() {
  return [
    { title: "Login - WTC LMS" },
    { name: "description", content: "Login to your account" },
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
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {login.error && login.error?.message !== "Validation errors" && (
                <Alert variant="destructive" className="bg-red-100">
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <LoadingButton loading={login.isPending} text="Login" />
            <OAuthButtons />
            <Link to="/register" className="w-full text-center">
              <p className="flex flex-row gap-1 justify-center">
                Don't have an account?
                <span className="hover:underline">Register</span>
              </p>
            </Link>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
