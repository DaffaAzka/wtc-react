import { Outlet, redirect, useLocation } from "react-router";

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
import type { Route } from "./+types/layout";
import { ModeToggle } from "@/components/custom/mode-toggle";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "WTC LMS" },
    { name: "description", content: "Welcome to WTC LMS!" },
  ];
}

export async function clientLoader() {
  const token = localStorage.getItem("token");
  if (!token) {
    throw redirect("/");
  }

  // Role-based redirect - Check if user is NOT admin (since all users have student role)
  const rawUser = localStorage.getItem("user");
  if (rawUser) {
    const user = JSON.parse(rawUser);
    const isAdmin = user.roles?.some(
      (role: any) => role.name.toLowerCase() === "admin",
    );

    // Regular students (no admin role) should use /student/* routes, not general auth routes
    if (!isAdmin) {
      throw redirect("/student/dashboard");
    }
  }

  return null;
}

export default function AuthLayout() {
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
            <DynamicBreadcrumb />
          </div>

          <div className="flex items-center px-4">
            <ModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ---------------------------------------------------------------------------
// Route segment → human-readable label map
// Covers all routes defined in routes.ts under layout("routes/auth/layout.tsx")
// ---------------------------------------------------------------------------
const SEGMENT_LABELS: Record<string, string> = {
  // Top-level admin pages
  dashboard: "Dashboard",
  courses: "Courses",

  // Admin section
  admin: "Admin",
  "user-management": "User Management",
  "course-management": "Course Management",
  profile: "Profile",

  // Materials / Pustaka PDF
  materials: "Materi Pembelajaran",

  // Tracks
  tracks: "Tracks",

  // Modules
  modules: "Modules",

  // Lessons
  lessons: "Lessons",
  create: "Create",
  update: "Update",
  view: "View",

  // Challenges
  challenges: "Challenges",
};

/** Convert a raw URL segment into a readable label */
function segmentLabel(seg: string): string {
  if (SEGMENT_LABELS[seg]) return SEGMENT_LABELS[seg];

  // Dynamic segments (slugs, IDs): title-case, replace hyphens/underscores
  return seg
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function DynamicBreadcrumb() {
  const location = useLocation();

  // Split pathname into non-empty segments
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Build cumulative hrefs for each segment
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
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
