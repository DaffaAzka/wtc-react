import InputForm from "@/components/custom/input-form";
import LoadingButton from "@/components/custom/loading-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useRegister } from "@/hooks/auth";
import { getFieldError } from "@/utils/global";
import { useState } from "react";
import { Link } from "react-router";

export default function Form() {
  const register = useRegister();

  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    name: "",
    study_class_id: null,
    role: "student",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    register.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Register for an account</CardTitle>
          <CardDescription>
            Enter your details below to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {register.error &&
              register.error?.message !== "Validation errors" && (
                <Alert variant="destructive" className="bg-red-100">
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
              placeholder="m@example.com"
              text="Email Address"
              type="email"
              value={form.email}
              handleChange={handleChange}
              error={getFieldError(register.error?.errors, "email")}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                error={getFieldError(
                  register.error?.errors,
                  "password_confirmation",
                )}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <LoadingButton loading={register.isPending} text="Register" />
          <Link to="/login">
            <p className="flex flex-row gap-1">
              Already have an account?
              <span className="hover:underline">Login</span>
            </p>
          </Link>
        </CardFooter>
      </Card>
    </form>
  );
}
