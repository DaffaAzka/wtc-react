import { Outlet, redirect } from "react-router";
import type { Route } from "../+types/layout";
import { getToken, getUser } from "@/utils/auth-storage";
import { hasRole, resolveLandingPath } from "@/utils/roles";

export function meta({}: Route.MetaArgs) {
  return [{ title: "WTC LMS" }, { name: "description", content: "Welcome to WTC LMS!" }];
}

export async function clientLoader() {
  if (!getToken()) {
    throw redirect("/");
  }

  const user = getUser();

  if (!user) {
    throw redirect("/");
  }

  if (!hasRole(user, "admin")) {
    throw redirect(resolveLandingPath(user));
  }
}

export default function AdminLayout() {
  return <Outlet />;
}
