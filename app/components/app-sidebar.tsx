"use client";

import * as React from "react";
import { Link, NavLink, useLocation } from "react-router";
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
} from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useTheme } from "@/contexts/theme";
import { getTwoInitials } from "@/utils/global";
import { ModeToggle } from "./custom/mode-toggle";

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
          }>
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
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible">
      <SidebarMenuItem className="relative">
        {/* Row: icon + title (navigates) + chevron (toggles) */}
        <div
          className={`flex items-center rounded-md px-2 py-1.5 ${
            isGroupActive
              ? "bg-[#1c81ff]/10"
              : "hover:bg-gray-100 dark:hover:bg-white/5"
          }`}>
          {/* Title area — navigates if group.url exists */}
          {group.url ? (
            <NavLink
              to={group.url}
              className={`flex flex-1 min-w-0 items-center gap-2 text-[14px] font-medium ${
                isGroupActive
                  ? "font-bold text-gray-900 dark:text-white"
                  : "text-gray-900 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}>
              <group.icon className="h-4 w-4 shrink-0" />
              <span>{group.title}</span>
            </NavLink>
          ) : (
            <button
              onClick={() => setOpen((o) => !o)}
              className={`flex flex-1 min-w-0 items-center gap-2 text-[14px] font-medium ${
                isGroupActive
                  ? "font-bold text-gray-900 dark:text-white"
                  : "text-gray-900 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}>
              <group.icon className="h-4 w-4 shrink-0" />
              <span>{group.title}</span>
            </button>
          )}
          {/* Chevron — always just toggles */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="ml-auto p-0.5 rounded text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                open ? "" : "-rotate-90"
              }`}
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
                          : "text-gray-900 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`
                    }>
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

const adminMain: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
];

const adminCourseGroup: NavGroup = {
  title: "Course Management",
  url: "/course-management",
  icon: Layers,
  items: [
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
];

const teacherContentGroup: NavGroup = {
  title: "Content",
  icon: BookOpen,
  items: [
    { title: "Tracks", url: "/teacher/tracks", icon: RouteIcon },
    { title: "Modules", url: "/teacher/modules", icon: LayersIcon },
    { title: "Lessons", url: "/teacher/lessons", icon: NotebookTextIcon },
    {
      title: "Challenges",
      url: "/teacher/challenges",
      icon: TerminalSquareIcon,
    },
  ],
};

const studentMain: NavItem[] = [
  { title: "Beranda", url: "/student/dashboard", icon: Home },
  { title: "Progress Belajar", url: "/student/progress", icon: GraduationCap },
  { title: "Kelas", url: "/student/classes", icon: BookOpen },
  { title: "Sertifikat Saya", url: "/student/certificates", icon: Award },
];

// ── Main component ───────────────────────────────────────────────────────────

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const [logoSrc, setLogoSrc] = React.useState("/brand-pack/logo-h-light.svg");
  const [videoSrc] = React.useState(() => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18
      ? "/videos/MorningAnimation.mp4"
      : "/videos/NightAnimation.mp4";
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    const isDark = root.classList.contains("dark");
    setLogoSrc(
      isDark ? "/brand-pack/logo-h-dark.svg" : "/brand-pack/logo-h-light.svg",
    );
  }, [theme]);

  const isAdmin =
    user?.roles?.some((role) => role.name.toLowerCase() === "admin") ?? false;
  const { pathname } = useLocation();
  const isTeacher =
    !isAdmin &&
    (user?.roles?.some((r) => r.name.toLowerCase() === "teacher") ?? false);
  const isStudent = !isAdmin && !isTeacher;

  const profileRoute = isAdmin
    ? "/admin/profile"
    : isTeacher
      ? "/teacher/profile"
      : "/student/profile";

  const avatarSrc = user?.profile?.avatar ?? user?.avatar ?? undefined;

  return (
    <Sidebar
      variant="sidebar"
      className="border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0f12]"
      {...props}>
      {/* ── Header ── */}
      <SidebarHeader className="gap-0 p-0">
        <div className="relative overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-32 w-full object-cover dark:opacity-80"
            key={videoSrc}>
            <source src={videoSrc} type="video/mp4" />
          </video>
          {/* Logo — kiri atas */}
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
              <SectionLabel>Content</SectionLabel>
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
                  <AvatarImage
                    src={avatarSrc}
                    alt={user?.display_name ?? undefined}
                  />
                  <AvatarFallback className="text-xs font-bold bg-[#1c81ff]/10 text-[#1c81ff]">
                    {getTwoInitials(user?.display_name || user?.name || "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-gray-900 dark:text-white">
                    {user?.display_name || user?.name || "User"}
                  </p>
                  <p className="truncate text-[11px] text-gray-500 dark:text-gray-500">
                    {user?.email}
                  </p>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-56 rounded-xl mb-1">
              <DropdownMenuLabel className="p-0">
                <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 dark:border-white/5">
                  <Avatar className="h-9 w-9 ring-1 ring-gray-200 dark:ring-white/10">
                    <AvatarImage
                      src={avatarSrc}
                      alt={user?.display_name ?? undefined}
                    />
                    <AvatarFallback className="text-xs font-bold bg-[#1c81ff]/10 text-[#1c81ff]">
                      {getTwoInitials(user?.display_name || user?.name || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-gray-900 dark:text-white">
                      {user?.display_name || user?.name}
                    </p>
                    <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                    {user?.roles?.[0] && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#1c81ff]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#1c81ff]">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        {user.roles[0].name}
                      </span>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
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
                  className="rounded-lg text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10">
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
