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
import { getActiveView, getToken, getUser, saveActiveView } from "@/utils/auth-storage";
import { hasRole, resolveDefaultView, resolveViewPath } from "@/utils/roles";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "WTC LMS" },
    { name: "description", content: "Welcome to WTC LMS!" },
  ];
}

export async function clientLoader() {
  if (!getToken()) throw redirect("/");

  const user = getUser();
  if (!user) throw redirect("/");

  // This layout serves the admin view only (/dashboard, /courses, admin sub-routes)
  const view = getActiveView();
  if (!view || view !== "admin") {
    const resolved = view ?? resolveDefaultView(user);
    saveActiveView(resolved);
    throw redirect(resolveViewPath(resolved));
  }

  // Safety net: verify the user actually holds the admin role.
  // Without this, any authenticated user can write active_view=admin into
  // localStorage (DevTools / XSS) and render the admin UI.
  if (!hasRole(user, "admin")) throw redirect("/");

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
  "audit-logs": "Audit Logs",
  profile: "Profile",
  materials: "Materials",
  tracks: "Tracks",
  modules: "Modules",
  lessons: "Lessons",
  challenges: "Challenges",
  submissions: "Submissions",
  leaderboard: "Leaderboard",
  certificates: "Certificates",
  create: "Create",
  update: "Update",
  view: "View",
  edit: "Edit",
  teacher: "Teacher",
  student: "Student",
  classes: "Classes",
  progress: "Progress",
};

const KNOWN_SECTIONS = new Set(Object.keys(SEGMENT_LABELS));
const HIDDEN_PREFIXES = new Set(["admin", "teacher", "student"]);

function segmentLabel(seg: string): string {
  if (SEGMENT_LABELS[seg]) return SEGMENT_LABELS[seg];
  return seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function DynamicBreadcrumb() {
  const location = useLocation();
  const allSegments = location.pathname.split("/").filter(Boolean);

  const allCrumbs = allSegments.map((seg, i) => ({
    seg,
    label: segmentLabel(seg),
    href: "/" + allSegments.slice(0, i + 1).join("/"),
    isDynamic: !KNOWN_SECTIONS.has(seg),
  }));

  const crumbs = allCrumbs.filter((c) => !HIDDEN_PREFIXES.has(c.seg));

  if (crumbs.length === 0) {
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

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && (
                <BreadcrumbSeparator className="hidden md:flex text-gray-300 dark:text-white/20" />
              )}
              <BreadcrumbItem className={!isLast ? "hidden md:flex" : ""}>
                {isLast || crumb.isDynamic ? (
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
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
