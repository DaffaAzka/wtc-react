import React from "react";
import { Link, Outlet, useLocation } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/custom/mode-toggle";
import { cn } from "@/lib/utils";

// Enhanced SidebarTrigger with visual indicator for lesson pages
function EnhancedSidebarTrigger() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isLessonPage = pathSegments.length >= 5 && location.pathname.includes('/classes/');
  const { open } = useSidebar();

  // Show pulse indicator when on lesson page AND sidebar is collapsed
  const showIndicator = isLessonPage && !open;

  return (
    <div className="relative">
      <SidebarTrigger className="-ml-1" />
      {showIndicator && (
        <>
          {/* Pulse animation */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </>
      )}
    </div>
  );
}

// Layout content that uses useSidebar hook
function StudentLayoutContent() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isLessonPage = pathSegments.length >= 5 && location.pathname.includes('/classes/');
  const { setOpen } = useSidebar();

  // Track the last lesson path where we auto-collapsed
  const lastAutoCollapsedPathRef = React.useRef<string | null>(null);

  // Auto-collapse sidebar when entering a DIFFERENT lesson page
  React.useEffect(() => {
    if (isLessonPage) {
      const currentPath = location.pathname;
      // Only auto-collapse if this is a different lesson from the last one we collapsed
      if (lastAutoCollapsedPathRef.current !== currentPath) {
        setOpen(false);
        lastAutoCollapsedPathRef.current = currentPath;
      }
    }
  }, [isLessonPage, location.pathname, setOpen]);

  return (
    <div className="flex h-screen w-screen bg-gray-50 dark:bg-gray-950">
      <AppSidebar />
      <SidebarInset className="flex flex-1 flex-col overflow-y-auto">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2">
          <div className="flex items-center gap-2 px-4">
            <EnhancedSidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 px-8 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </div>
  );
}

export default function StudentLayout() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isLessonPage = pathSegments.length >= 5 && location.pathname.includes('/classes/');

  return (
    <SidebarProvider defaultOpen={!isLessonPage}>
      <StudentLayoutContent />
    </SidebarProvider>
  );
}

// ---------------------------------------------------------------------------
// Route segment → human-readable label map
// Covers all student routes under /student/* from routes.ts
// ---------------------------------------------------------------------------
const SEGMENT_LABELS: Record<string, string> = {
  // Student root
  student: "Student",

  // Main nav (matches sidebar labels)
  dashboard: "Beranda",
  classes: "Kelas",
  progress: "Progres Belajar",
  profile: "Profil",

  // Submissions & Challenges
  submissions: "Submissions",
  challenges: "Tantangan",
  take: "Kerjakan",

  // Tracks alias
  tracks: "Kelas",

  // Shared
  create: "Buat",
  update: "Perbarui",
  view: "Lihat",
  modules: "Modul",
  lessons: "Pelajaran",
};

/** Convert a raw URL segment into a readable label */
function segmentLabel(seg: string): string {
  if (SEGMENT_LABELS[seg]) return SEGMENT_LABELS[seg];

  // Dynamic segments (slugs, IDs): title-case and replace hyphens/underscores
  return seg
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Route overrides: certain segments should link to different URLs
const SEGMENT_ROUTES: Record<string, string> = {
  tracks: "/student/classes", // tracks detail pages link back to classes listing
};

function DynamicBreadcrumb() {
  const location = useLocation();

  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Beranda</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Build crumbs from all segments first
  const allCrumbs = segments.map((seg, i) => ({
    segment: seg,
    label: segmentLabel(seg),
    href: SEGMENT_ROUTES[seg] || "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  // Filter out "student" prefix
  const crumbs = allCrumbs.filter((crumb) => crumb.segment !== "student");

  // Update isLast after filtering
  if (crumbs.length > 0) {
    crumbs.forEach((c) => (c.isLast = false));
    crumbs[crumbs.length - 1].isLast = true;
  }

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

