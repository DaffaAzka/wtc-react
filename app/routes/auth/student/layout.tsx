import React from "react";
import { Link, Outlet, redirect, useLocation } from "react-router";
import { getToken, getUser } from "@/utils/auth-storage";
import { hasRole, resolveLandingPath } from "@/utils/roles";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export async function clientLoader() {
  if (!getToken()) throw redirect("/");
  const user = getUser();
  if (!user) throw redirect("/");
  if (hasRole(user, "teacher") || hasRole(user, "admin"))
    throw redirect(resolveLandingPath(user));
  if (!hasRole(user, "student")) throw redirect("/");
  return null;
}

// ── Sidebar trigger with lesson-page indicator ───────────────────────────────

function EnhancedSidebarTrigger() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const isLessonPage =
    pathSegments.length >= 5 && location.pathname.includes("/classes/");
  const { open } = useSidebar();
  const showIndicator = isLessonPage && !open;

  return (
    <div className="relative">
      <SidebarTrigger className="-ml-1 h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors" />
      {showIndicator && (
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1c81ff] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1c81ff]" />
        </span>
      )}
    </div>
  );
}

// ── Layout content ────────────────────────────────────────────────────────────

function StudentLayoutContent() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const isLessonPage =
    pathSegments.length >= 5 && location.pathname.includes("/classes/");
  const { setOpen } = useSidebar();
  const lastAutoCollapsedPathRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (isLessonPage) {
      const currentPath = location.pathname;
      if (lastAutoCollapsedPathRef.current !== currentPath) {
        setOpen(false);
        lastAutoCollapsedPathRef.current = currentPath;
      }
    }
  }, [isLessonPage, location.pathname, setOpen]);

  return (
    <div className="flex h-screen w-screen bg-gray-50 dark:bg-[#0d1117]">
      <AppSidebar />
      <SidebarInset className="flex flex-1 flex-col overflow-y-auto bg-gray-50 dark:bg-[#0d1117]">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#0a0f12]/80 backdrop-blur-md px-4">
          <EnhancedSidebarTrigger />
          <Separator orientation="vertical" className="h-4 bg-gray-200 dark:bg-white/10" />
          <DynamicBreadcrumb />
        </header>

        {/* Page content */}
        <main className="flex flex-1 flex-col p-6 md:p-8 pt-6">
          <Outlet />
        </main>
      </SidebarInset>
    </div>
  );
}

export default function StudentLayout() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const isLessonPage =
    pathSegments.length >= 5 && location.pathname.includes("/classes/");

  return (
    <SidebarProvider defaultOpen={!isLessonPage}>
      <StudentLayoutContent />
    </SidebarProvider>
  );
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

const SEGMENT_LABELS: Record<string, string> = {
  student: "Student",
  dashboard: "Beranda",
  classes: "Kelas",
  progress: "Progres Belajar",
  profile: "Profil",
  submissions: "Submissions",
  challenges: "Tantangan",
  take: "Kerjakan",
  tracks: "Kelas",
  create: "Buat",
  update: "Perbarui",
  view: "Lihat",
  modules: "Modul",
  lessons: "Pelajaran",
  "my-learning": "Progress Belajar",
};

function segmentLabel(seg: string): string {
  if (SEGMENT_LABELS[seg]) return SEGMENT_LABELS[seg];
  return seg
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const SEGMENT_ROUTES: Record<string, string> = {
  tracks: "/student/classes",
};

function DynamicBreadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-[13px] font-bold text-gray-900 dark:text-white">
              Beranda
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const allCrumbs = segments.map((seg, i) => ({
    segment: seg,
    label: segmentLabel(seg),
    href: SEGMENT_ROUTES[seg] || "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  const crumbs = allCrumbs.filter((c) => c.segment !== "student");
  if (crumbs.length > 0) {
    crumbs.forEach((c) => (c.isLast = false));
    crumbs[crumbs.length - 1].isLast = true;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && (
              <BreadcrumbSeparator className="hidden md:flex text-gray-300 dark:text-white/20" />
            )}
            <BreadcrumbItem className={i < crumbs.length - 1 ? "hidden md:flex" : ""}>
              {crumb.isLast ? (
                <BreadcrumbPage className="text-[13px] font-bold text-gray-900 dark:text-white">
                  {crumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    to={crumb.href}
                    className="text-[13px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
