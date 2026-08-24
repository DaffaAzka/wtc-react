import { Outlet, useLocation } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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

export default function StudentLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen bg-gray-50 dark:bg-gray-950">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col overflow-y-auto">
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
          <div className="flex flex-1 flex-col gap-4 p-4 px-8 pt-0">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
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
  progress: "Progress Belajar",
  profile: "Profil",

  // Submissions & Challenges
  submissions: "Submissions",
  challenges: "Tantangan",
  take: "Kerjakan",

  // Tracks alias
  tracks: "Tracks",

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

