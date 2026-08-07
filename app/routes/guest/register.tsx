import InputForm from "@/components/custom/input-form";
import LoadingButton from "@/components/custom/loading-button";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegister } from "@/hooks/auth";
import { getFieldError } from "@/utils/global";
import { useState } from "react";
import { Link } from "react-router";

export function meta() {
  return [{ title: "Register - WTC LMS" }, { name: "description", content: "Create a new account" }];
}

export default function Register() {
  const register = useRegister();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    register.mutate(form);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Enter your details to create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {register.error && register.error?.message !== "Validation errors" && (
                <Alert variant="destructive" className="bg-red-100">
                  <AlertDescription>{register.error?.message ?? "An unknown error occurred."}</AlertDescription>
                </Alert>
              )}
              <InputForm name="name" placeholder="John Doe" text="username" type="text" value={form.name} handleChange={handleChange} error={getFieldError(register.error?.errors, "name")} />
              <InputForm
                name="email"
                placeholder="m@example.com"
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <LoadingButton loading={register.isPending} text="Register" />
            <OAuthButtons />
            <Link to="/login" className="w-full text-center">
              <p className="flex flex-row gap-1 justify-center">
                Already have an account?
                <span className="hover:underline">Login</span>
              </p>
            </Link>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
