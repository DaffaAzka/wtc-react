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
  dashboard: "Dashboard",
  content: "Content",
  submissions: "Submissions",
  leaderboard: "Leaderboard",
  "audit-logs": "Audit Logs",
  "student-progress": "Student Progress",
  profile: "Profile",
  tracks: "Tracks",
  modules: "Modules",
  lessons: "Lessons",
  challenges: "Challenges",
  create: "Create",
  update: "Update",
  view: "View",
  edit: "Edit",
  certificates: "Certificates",
  admin: "Admin",
};

/**
 * Static path segments that correspond to real named routes.
 * Any segment NOT in this set is treated as a dynamic slug/id and
 * will be rendered as plain text (no link) to avoid 404s.
 */
const KNOWN_SECTIONS = new Set(Object.keys(SEGMENT_LABELS));

function segmentLabel(seg: string): string {
  if (SEGMENT_LABELS[seg]) return SEGMENT_LABELS[seg];
  // Format dynamic slugs/ids into readable text
  return seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function TeacherBreadcrumb() {
  const location = useLocation();

  const allSegments = location.pathname.split("/").filter(Boolean);

  // Build crumbs with absolute hrefs (including /teacher prefix for correctness),
  // then filter the 'teacher' segment out of the visible list.
  const allCrumbs = allSegments.map((seg, i) => ({
    seg,
    label: segmentLabel(seg),
    // Absolute href so every link works regardless of current depth
    href: "/" + allSegments.slice(0, i + 1).join("/"),
    // Dynamic slugs/ids have no corresponding named route — don't make them links
    isDynamic: !KNOWN_SECTIONS.has(seg),
  }));

  // Hide the 'teacher' role prefix from the UI (but keep it in hrefs)
  const crumbs = allCrumbs.filter((c) => c.seg !== "teacher");

  if (crumbs.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem className={!isLast ? "hidden md:block" : ""}>
                {isLast || crumb.isDynamic ? (
                  // Last item or a dynamic slug → plain text, no link
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
