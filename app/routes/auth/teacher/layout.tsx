import { Link, Outlet, redirect, useLocation } from "react-router";
import type { Route } from "../+types/layout";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/custom/mode-toggle";
import { getToken, getUser } from "@/utils/auth-storage";
import { hasRole, resolveLandingPath } from "@/utils/roles";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "WTC LMS" },
    { name: "description", content: "Welcome to WTC LMS!" },
  ];
}

export async function clientLoader() {
  if (!getToken()) {
    throw redirect("/");
  }

  const user = getUser();

  if (!user) {
    throw redirect("/");
  }

  // Admit teachers and admins (admins can access teacher area)
  if (!hasRole(user, "teacher") && !hasRole(user, "admin")) {
    throw redirect(resolveLandingPath(user));
  }

  return null;
}

export default function TeacherLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <TeacherBreadcrumb />
          </div>
          <div className="flex items-center px-4">
            <ModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 px-8 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ---------------------------------------------------------------------------
// Segment label map for teacher routes
// ---------------------------------------------------------------------------

const SEGMENT_LABELS: Record<string, string> = {
  teacher: "Teacher",
  dashboard: "Dashboard",
  content: "Content",
  submissions: "Submissions",
  leaderboard: "Leaderboard",
  "audit-logs": "Audit Logs",
  profile: "Profile",
  tracks: "Tracks",
  modules: "Modules",
  lessons: "Lessons",
  challenges: "Challenges",
  create: "Create",
  update: "Update",
  view: "View",
};

function segmentLabel(seg: string): string {
  if (SEGMENT_LABELS[seg]) return SEGMENT_LABELS[seg];
  return seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function TeacherBreadcrumb() {
  const location = useLocation();

  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Teacher</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const crumbs = segments.map((seg, i) => ({
    label: segmentLabel(seg),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <BreadcrumbSeparator className="hidden md:block" />}
            <BreadcrumbItem
              className={i < crumbs.length - 1 ? "hidden md:block" : ""}
            >
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
