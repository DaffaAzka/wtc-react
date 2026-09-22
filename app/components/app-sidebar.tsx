"use client";

import * as React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  RouteIcon,
  LayersIcon,
  NotebookTextIcon,
  TerminalSquareIcon,
  UsersIcon,
  Trash2,
  Users,
  Trophy,
  Home,
  GraduationCap,
  BookOpen,
  ChevronDown,
  Settings2,
  LogOut,
  ChevronsUpDown,
  ShieldCheck,
  Library,
  Layers,
  ClipboardList,
  Award,
  Star,
  Check,
} from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useTheme } from "@/contexts/theme";
import { getTwoInitials } from "@/utils/global";
import { ModeToggle } from "./custom/mode-toggle";
import { getUserViews, resolveViewPath } from "@/utils/roles";
import { getActiveView } from "@/utils/auth-storage";
import type { RoleName } from "@/types/model";

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
};

type NavGroup = {
  title: string;
  url?: string;
  icon: React.ElementType;
  items: NavItem[];
};

// ── View meta ────────────────────────────────────────────────────────────────

const VIEW_LABELS: Record<RoleName, string> = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
};

const VIEW_ICONS: Record<RoleName, React.ElementType> = {
  admin: ShieldCheck,
  teacher: GraduationCap,
  student: BookOpen,
};

// ── Flat nav item ────────────────────────────────────────────────────────────

function NavItem({ item }: { item: NavItem }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          className={({ isActive }) =>
            isActive
              ? "bg-[#1c81ff]/10 text-gray-900 dark:text-white font-bold"
              : "text-gray-900 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 font-medium"
          }
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span>{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

// ── Collapsible group ────────────────────────────────────────────────────────

function NavGroup({ group }: { group: NavGroup }) {
  const location = useLocation();
  const isGroupActive =
    (group.url && location.pathname === group.url) ||
    group.items.some((item) => location.pathname.startsWith(item.url));
  const [open, setOpen] = React.useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarMenuItem className="relative">
        <div
          className={`flex items-center rounded-md px-2 py-1.5 ${
            isGroupActive ? "bg-[#1c81ff]/10" : "hover:bg-gray-100 dark:hover:bg-white/5"
          }`}
        >
          {group.url ? (
            <NavLink
              to={group.url}
              className={`flex flex-1 min-w-0 items-center gap-2 text-[12px] font-medium ${
                isGroupActive
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <group.icon className="h-4 w-4 shrink-0" />
              <span>{group.title}</span>
            </NavLink>
          ) : (
            <button
              onClick={() => setOpen((o) => !o)}
              className={`flex flex-1 min-w-0 items-center gap-2 text-[12px] font-medium ${
                isGroupActive
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <group.icon className="h-4 w-4 shrink-0" />
              <span>{group.title}</span>
            </button>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="ml-auto p-0.5 rounded text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
            />
          </button>
        </div>

        <CollapsibleContent>
          <SidebarMenuSub className="border-l border-gray-200 dark:border-white/10 ml-3">
            {group.items.map((sub) => (
              <SidebarMenuSubItem key={sub.title}>
                <SidebarMenuSubButton asChild>
                  <NavLink
                    to={sub.url}
                    className={({ isActive }) =>
                      `flex items-center gap-2 ${
                        isActive
                          ? "font-bold text-gray-900 dark:text-white"
                          : "text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white"
                      }`
                    }
                  >
                    <sub.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{sub.title}</span>
                  </NavLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-600">
      {children}
    </p>
  );
}

// ── Nav definitions ──────────────────────────────────────────────────────────

const adminMain: NavItem[] = [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }];

const adminCourseGroup: NavGroup = {
  title: "Course Management",
  url: "/course-management",
  icon: Layers,
  items: [
    { title: "Classes", url: "/study-classes", icon: GraduationCap },
    { title: "Tracks", url: "/tracks", icon: RouteIcon },
    { title: "Modules", url: "/modules", icon: LayersIcon },
    { title: "Lessons", url: "/lessons", icon: NotebookTextIcon },
    { title: "Challenges", url: "/challenges", icon: TerminalSquareIcon },
    { title: "Materials", url: "/materials", icon: Library },
  ],
};

const adminManage: NavItem[] = [
  { title: "Users", url: "/user-management", icon: UsersIcon },
  { title: "Student Progress", url: "/student-progress", icon: Users },
  { title: "Certificates", url: "/admin/certificates", icon: Award },
  { title: "Certificate Template", url: "/admin/certificate-template", icon: Star },
  { title: "Achievements", url: "/admin/achievements", icon: Trophy },
  { title: "Recycle Bin", url: "/recycle-bin", icon: Trash2 },
];

const teacherMain: NavItem[] = [
  { title: "Dashboard", url: "/teacher/dashboard", icon: LayoutDashboard },
  { title: "Submissions", url: "/teacher/submissions", icon: ClipboardList },
  { title: "Leaderboard", url: "/teacher/leaderboard", icon: Trophy },
  { title: "Student Progress", url: "/teacher/student-progress", icon: Users },
  { title: "Certificates", url: "/teacher/certificates", icon: Award },
];

const teacherContentGroup: NavGroup = {
  title: "Course Management",
  icon: Layers,
  items: [
    { title: "Study Classes", url: "/teacher/study-classes", icon: GraduationCap },
    { title: "Tracks", url: "/teacher/tracks", icon: RouteIcon },
    { title: "Modules", url: "/teacher/modules", icon: LayersIcon },
    { title: "Lessons", url: "/teacher/lessons", icon: NotebookTextIcon },
    { title: "Challenges", url: "/teacher/challenges", icon: TerminalSquareIcon },
  ],
};

const studentMain: NavItem[] = [
  { title: "Beranda", url: "/student/dashboard", icon: Home },
  { title: "Progress Belajar", url: "/student/progress", icon: GraduationCap },
  { title: "Kelas Saya", url: "/student/my-class", icon: BookOpen },
  { title: "Semua Kelas", url: "/student/classes", icon: Layers },
  { title: "Sertifikat Saya", url: "/student/certificates", icon: Award },
];

// ── Profile route per view ───────────────────────────────────────────────────

function profileRouteForView(view: RoleName | null): string {
  if (view === "admin") return "/admin/profile";
  if (view === "teacher") return "/teacher/profile";
  return "/student/profile";
}

// ── Main component ───────────────────────────────────────────────────────────

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout, activeView: activeViewState, setActiveView } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Fallback to localStorage when React state hasn't flushed yet (post-login race condition)
  const activeView = activeViewState ?? getActiveView();

  const [logoSrc, setLogoSrc] = React.useState(() => {
    if (typeof window === "undefined") return "/brand-pack/logo-h-light.svg";
    const stored = localStorage.getItem("vite-ui-theme") as "dark" | "light" | "system" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (stored !== "light" && prefersDark);
    return isDark ? "/brand-pack/logo-h-dark.svg" : "/brand-pack/logo-h-light.svg";
  });

  const [videoSrc] = React.useState(() => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? "/videos/MorningAnimation.mp4" : "/videos/NightAnimation.mp4";
  });

  React.useEffect(() => {
    let isDark: boolean;
    if (theme === "dark") isDark = true;
    else if (theme === "light") isDark = false;
    else isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setLogoSrc(isDark ? "/brand-pack/logo-h-dark.svg" : "/brand-pack/logo-h-light.svg");
  }, [theme]);

  // Derive sidebar nav from active view
  const isAdmin = activeView === "admin";
  const isTeacher = activeView === "teacher";
  const isStudent = activeView === "student" || !activeView;

  const profileRoute = profileRouteForView(activeView);
  const avatarSrc = typeof user?.avatar === "string" ? user.avatar : (user?.avatar?.url ?? undefined);

  // Available views for the switcher — only shown when user has > 1 role
  const availableViews = getUserViews(user);
  const isMultiRole = availableViews.length > 1;

  const handleSwitchView = (role: RoleName) => {
    if (role === activeView) return;
    setActiveView(role);
    navigate(resolveViewPath(role));
  };

  return (
    <Sidebar
      variant="sidebar"
      className="border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0f12]"
      {...props}
    >
      {/* ── Header ── */}
      <SidebarHeader className="gap-0 p-0">
        <div className="relative overflow-hidden">
          <video autoPlay loop muted playsInline className="h-32 w-full object-cover dark:opacity-80" key={videoSrc}>
            <source src={videoSrc} type="video/mp4" />
          </video>
          <div className="absolute -top-8 left-3">
            <img src={logoSrc} alt="WTC" className="h-28 w-auto" />
          </div>
        </div>
        <div className="h-px bg-gray-200 dark:bg-white/10" />
      </SidebarHeader>

      {/* ── Content ── */}
      <SidebarContent className="px-2 py-3 gap-0">
        <SidebarMenu className="gap-0.5">
          {/* ── Admin ── */}
          {isAdmin && (
            <>
              <SectionLabel>Main</SectionLabel>
              {adminMain.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
              <div className="my-2 h-px bg-gray-100 dark:bg-white/5 mx-1" />
              <SectionLabel>Content</SectionLabel>
              <NavGroup group={adminCourseGroup} />
              <div className="my-2 h-px bg-gray-100 dark:bg-white/5 mx-1" />
              <SectionLabel>Admin</SectionLabel>
              {adminManage.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
            </>
          )}

          {/* ── Teacher ── */}
          {isTeacher && (
            <>
              <SectionLabel>Main</SectionLabel>
              {teacherMain.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
              <div className="my-2 h-px bg-gray-100 dark:bg-white/5 mx-1" />
              <NavGroup group={teacherContentGroup} />
            </>
          )}

          {/* ── Student ── */}
          {isStudent && (
            <>
              <SectionLabel>Navigasi</SectionLabel>
              {studentMain.map((item) => (
                <NavItem key={item.title} item={item} />
              ))}
            </>
          )}
        </SidebarMenu>
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter className="border-t border-gray-200 dark:border-white/10 p-3">
        <div className="flex items-center gap-2">
          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-1 min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group">
                <Avatar className="h-8 w-8 shrink-0 ring-1 ring-gray-200 dark:ring-white/10">
                  <AvatarImage src={avatarSrc} alt={user?.display_name ?? undefined} />
                  <AvatarFallback className="text-xs font-bold bg-[#1c81ff]/10 text-[#1c81ff]">
                    {getTwoInitials(user?.display_name || "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-gray-900 dark:text-white">
                    {user?.display_name || "User"}
                  </p>
                  {/* Secondary line: show active view prefix when multi-role */}
                  <p className="truncate text-[11px] text-gray-500 dark:text-gray-500">
                    {isMultiRole && activeView ? (
                      <>
                        <span className="font-semibold text-[#1c81ff]">
                          {VIEW_LABELS[activeView]}
                        </span>
                        {" · "}
                        {user?.email}
                      </>
                    ) : (
                      user?.email
                    )}
                  </p>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="top" align="start" className="w-56 rounded-xl mb-1">
              {/* Header */}
              <DropdownMenuLabel className="p-0">
                <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 dark:border-white/5">
                  <Avatar className="h-9 w-9 ring-1 ring-gray-200 dark:ring-white/10">
                    <AvatarImage src={avatarSrc} alt={user?.display_name ?? undefined} />
                    <AvatarFallback className="text-xs font-bold bg-[#1c81ff]/10 text-[#1c81ff]">
                      {getTwoInitials(user?.display_name || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-gray-900 dark:text-white">
                      {user?.display_name}
                    </p>
                    <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                    {activeView && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#1c81ff]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#1c81ff]">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        {VIEW_LABELS[activeView]}
                      </span>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>

              {/* View switcher — only shown when user has multiple roles */}
              {isMultiRole && (
                <>
                  <div className="px-2 pt-2 pb-1">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-600">
                      Switch View
                    </p>
                  </div>
                  {availableViews.map((role) => {
                    const Icon = VIEW_ICONS[role];
                    const isActive = role === activeView;
                    return (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => handleSwitchView(role)}
                        className="mx-1 rounded-lg cursor-pointer"
                      >
                        <Icon className="h-4 w-4 text-gray-400" />
                        <span className={isActive ? "font-semibold" : ""}>{VIEW_LABELS[role]}</span>
                        {isActive && <Check className="ml-auto h-3.5 w-3.5 text-[#1c81ff]" />}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Actions */}
              <div className="p-1">
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link to={profileRoute} className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-gray-400" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="rounded-lg text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
