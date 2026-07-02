import { Outlet, redirect } from "react-router";
import type { Route } from "../+types/layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "WTC LMS" },
    { name: "description", content: "Welcome to WTC LMS!" },
  ];
}

export async function clientLoader() {
  const user =
    localStorage.getItem("user") && JSON.parse(localStorage.getItem("user")!);
  if (user?.role !== "admin") {
    throw redirect("/dashboard");
  }
}

export default function AdminLayout() {
  return <Outlet />;
}
