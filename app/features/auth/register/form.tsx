import LoadingButton from "@/components/custom/loading-button";
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
import { useRegister } from "@/hooks/auth";
import { useState } from "react";
import { Link } from "react-router";

export default function Form() {
  const { register, error, loading } = useRegister();

  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    name: "",
    study_class_id: null,
    role: "student",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    register(form);
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
            <div className="grid gap-2">
              <Label htmlFor="name">Fullname</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password_confirmation">
                    Confirm Password
                  </Label>
                </div>
                <Input
                  id="password_confirmation"
                  type="password"
                  onChange={(e) =>
                    setForm({ ...form, password_confirmation: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <LoadingButton loading={loading} text="Register" />
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
