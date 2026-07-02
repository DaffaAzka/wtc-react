import Form from "@/features/auth/login/form";
import type { Route } from "../../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login" },
    { name: "description", content: "Login to your account" },
  ];
}

export default function LoginPage() {
  return (
    <div className="h-[90vh] flex justify-center items-center">
      <Form />
    </div>
  );
}
