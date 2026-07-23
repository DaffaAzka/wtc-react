import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "WTC LMS" },
    { name: "description", content: "Welcome to WTC LMS!" },
  ];
}

export async function clientLoader() {
  const token = localStorage.getItem("token");
  if (token) {
    throw redirect("/dashboard");
  }
  return null;
}

export default function GuestLayout() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Outlet />
    </div>
  );
}
