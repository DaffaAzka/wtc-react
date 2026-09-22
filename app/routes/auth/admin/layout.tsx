import { Outlet, redirect } from "react-router";
import type { Route } from "../+types/layout";
import { getActiveView, getToken, getUser } from "@/utils/auth-storage";
import { hasRole, resolveDefaultView, resolveViewPath } from "@/utils/roles";

export function meta({}: Route.MetaArgs) {
  return [{ title: "WTC LMS" }, { name: "description", content: "Welcome to WTC LMS!" }];
}

export async function clientLoader() {
  if (!getToken()) throw redirect("/");

  const user = getUser();
  if (!user) throw redirect("/");

  // This sub-layout is nested under auth/layout (which already requires active_view === "admin").
  // We re-check here as a defense-in-depth measure in case this layout is ever accessed directly.
  const view = getActiveView();
  if (!view || view !== "admin") {
    throw redirect(resolveViewPath(view ?? resolveDefaultView(user)));
  }

  // Defense-in-depth: verify the user actually holds the admin role,
  // not just a localStorage active_view value that could be tampered with.
  if (!hasRole(user, "admin")) throw redirect("/");
}

export default function AdminLayout() {
  return <Outlet />;
}
