import { Outlet, redirect } from "react-router";
import type { Route } from "../+types/layout";

export function meta({}: Route.MetaArgs) {
  return [{ title: "WTC LMS" }, { name: "description", content: "Welcome to WTC LMS!" }];
}

export async function clientLoader() {
  const rawUser = localStorage.getItem("user");

  if (!rawUser) {
    throw redirect("/dashboard");
  }

  const user = JSON.parse(rawUser);

  const isAdmin = user.roles?.some((role: any) => role.name.toLowerCase() === "admin");

  if (!isAdmin) {
    throw redirect("/dashboard");
  }
}

export default function AdminLayout() {
  return <Outlet />;
}
