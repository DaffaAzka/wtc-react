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

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { getFieldError } from "@/utils/global";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

export default function Form() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(form.email, form.password);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Login failed. Please check your credentials.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {error && (
              <Alert variant="destructive" className="bg-red-100">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <InputForm
              name="email"
              placeholder="m@example.com"
              text="Email Address"
              type="email"
              value={form.email}
              handleChange={handleChange}
            />
            <InputForm
              name="password"
              placeholder="••••••••"
              text="Password"
              type="password"
              value={form.password}
              handleChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <LoadingButton loading={loading} text="Login" />
          <Link to="/register">
            <p className="flex flex-row gap-1">
              Don't have an account?
              <span className="hover:underline">Register</span>
            </p>
          </Link>
        </CardFooter>
      </Card>
    </form>
  );
}
