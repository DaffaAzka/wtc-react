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
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/custom/mode-toggle";
import type { Route } from "./+types/layout";
import { getToken, getUser } from "@/utils/auth-storage";
import { resolveLandingPath } from "@/utils/roles";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "WTC LMS" },
    { name: "description", content: "Welcome to WTC LMS!" },
  ];
}

export async function clientLoader() {
  if (!getToken()) throw redirect("/");
  const user = getUser();
  const landingPath = resolveLandingPath(user);
  if (user && landingPath !== "/dashboard") throw redirect(landingPath);
  return null;
}

export default function AuthLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-gray-50 dark:bg-[#0d1117] min-h-screen">
        {/* ── Top bar ── */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#0a0f12]/80 backdrop-blur-md px-4">
          <SidebarTrigger className="-ml-1 h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors" />
          <Separator
            orientation="vertical"
            className="h-4 bg-gray-200 dark:bg-white/10"
          />
          <DynamicBreadcrumb />
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex flex-1 flex-col p-6 md:p-8 pt-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// ── Breadcrumb ───────────────────────────────────────────────────────────────

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  courses: "Courses",
  admin: "Admin",
  "user-management": "User Management",
  "course-management": "Course Management",
  "student-progress": "Student Progress",
  "recycle-bin": "Recycle Bin",
  profile: "Profile",
  materials: "Materials",
  tracks: "Tracks",
  modules: "Modules",
  lessons: "Lessons",
  challenges: "Challenges",
  submissions: "Submissions",
  leaderboard: "Leaderboard",
  create: "Create",
  update: "Update",
  view: "View",
  edit: "Edit",
  teacher: "Teacher",
  student: "Student",
  classes: "Classes",
  progress: "Progress",
};

function segmentLabel(seg: string): string {
  if (SEGMENT_LABELS[seg]) return SEGMENT_LABELS[seg];
  return seg
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function DynamicBreadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-[13px] font-bold text-gray-900 dark:text-white">
              Home
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const crumbs = segments.map((seg, i) => {
    let href = "/" + segments.slice(0, i + 1).join("/");
    // Lesson slug always links to /view — direct path is not a valid route
    if (i > 0 && segments[i - 1] === "lessons") {
      href = href + "/view";
    }
    return {
      label: segmentLabel(seg),
      href,
      isLast: i === segments.length - 1,
    };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && (
              <BreadcrumbSeparator className="hidden md:flex text-gray-300 dark:text-white/20" />
            )}
            <BreadcrumbItem
              className={i < crumbs.length - 1 ? "hidden md:flex" : ""}
            >
              {crumb.isLast ? (
                <BreadcrumbPage className="text-[13px] font-bold text-gray-900 dark:text-white">
                  {crumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={crumb.href}
                  className="text-[13px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {crumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
