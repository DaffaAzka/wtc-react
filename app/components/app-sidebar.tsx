"use client";

import * as React from "react";
import { Link, NavLink, useLocation } from "react-router";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LayersIcon,
  LifeBuoyIcon,
  ListTreeIcon,
  NotebookTextIcon,
  RouteIcon,
  SendIcon,
  TerminalSquareIcon,
  UserIcon,
  UsersIcon,
  Home,
  BookOpen,
  GraduationCap,
  GitBranch,
  Award,
  Users,
  FileText,
  ClipboardList,
  ScrollText,
  Trophy,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useTheme } from "@/contexts/theme";
import { firstCharacterUppercase } from "@/utils/global";
import { ModeToggle } from "./custom/mode-toggle";
import { Separator } from "./ui/separator";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [courseMgmtOpen, setCourseMgmtOpen] = React.useState(true); // ← tambahin ini

  // Time-based animation: Morning (6am-6pm) or Night (6pm-6am)
  const getTimeBasedAnimation = () => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ?
        "/videos/MorningAnimation.mp4"
      : "/videos/NightAnimation.mp4";
  };

  const [videoSrc] = React.useState(getTimeBasedAnimation());

  // Determine logo variant based on theme - client-side only to avoid hydration issues
  const [logoSrc, setLogoSrc] = React.useState("/brand-pack/logo-h-light.svg");

  React.useEffect(() => {
    // Check actual applied theme from document root
    const root = window.document.documentElement;
    const isDark = root.classList.contains("dark");
    setLogoSrc(isDark ? "/brand-pack/logo-h-dark.svg" : "/brand-pack/logo-h-light.svg");
  }, [theme]); // Re-run when theme changes

  const isAdmin =
    user?.roles?.some((role) => role.name.toLowerCase() === "admin") ?? false;

  const isTeacher =
    !isAdmin &&
    (user?.roles?.some((role) => role.name.toLowerCase() === "teacher") ??
      false);

  const [teacherContentOpen, setTeacherContentOpen] = React.useState(false);

  // Teacher navigation
  const teacherNavFlat = [
    { title: "Dashboard", url: "/teacher/dashboard", icon: LayoutDashboard },
    { title: "Submissions", url: "/teacher/submissions", icon: ClipboardList },
    { title: "Leaderboard", url: "/teacher/leaderboard", icon: Trophy },
  ];

  const teacherContentItems = [
    { title: "Tracks", url: "/teacher/tracks", icon: RouteIcon },
    { title: "Modules", url: "/teacher/modules", icon: LayersIcon },
    { title: "Lessons", url: "/teacher/lessons", icon: NotebookTextIcon },
    { title: "Challenges", url: "/teacher/challenges", icon: TerminalSquareIcon },
  ];

  // Admin navigation
  const navFlat = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: false,
    },
    {
      title: "Courses",
      url: "/courses",
      icon: TerminalSquareIcon,
      isActive: false,
    },
  ];

  // Student navigation
  const studentNavMain = [
    { title: "Beranda", url: "/student/dashboard", icon: Home },
    {
      title: "Progress Belajar",
      url: "/student/progress",
      icon: GraduationCap,
    },
    { title: "Kelas", url: "/student/classes", icon: BookOpen },
    // { title: "Learning Path", url: "/student/learning-path", icon: GitBranch },
  ];

  const studentNavLearning = [
    { title: "Tantangan", url: "/student/challenges", icon: Award },
    { title: "Kelas Saya", url: "/student/study-classes", icon: Users },
  ];

  const courseManagementGroup = {
    title: "Course Management",
    icon: LayersIcon,
    defaultOpen: true,
    items: [
      { title: "Tracks", url: "/tracks", icon: RouteIcon },
      { title: "Modules", url: "/modules", icon: ListTreeIcon },
      { title: "Lessons", url: "/lessons", icon: NotebookTextIcon },
      { title: "Materi Pembelajaran", url: "/materials", icon: FileText },
      { title: "Challenges", url: "/challenges", icon: Award },
    ],
  };

  const navSecondary = [
    { title: "User Management", url: "/user-management", icon: UsersIcon },
    { title: "Recycle Bin", url: "/recycle-bin", icon: Trash2 },
    { title: "Support", url: "#", icon: LifeBuoyIcon },
    { title: "Feedback", url: "#", icon: SendIcon },
  ];

  return (
    <Sidebar
      variant="sidebar"
      className="border-sidebar-border bg-sidebar text-sidebar-foreground"
      {...props}>
      <SidebarHeader className="gap-0 p-0">
        {/* Video Animation - Full width, no padding */}
        <div className="relative w-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-36 object-cover"
            key={videoSrc}>
            <source src={videoSrc} type="video/mp4" />
          </video>

          {/* Logo overlay on video */}
          <div className="absolute bottom-12 right-15 w-full h-full flex items-center justify-center ">
            {/* <span className="text-base font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              WebTech TC.
            </span> */}
            <img
              src={logoSrc}
              alt="Logo"
              className="h-28 w-auto"
            />
          </div>
        </div>

        <Separator />
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Admin Navigation */}
              {isAdmin && (
                <>
                  {navFlat.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={item.isActive}>
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <Collapsible
                    open={courseMgmtOpen}
                    onOpenChange={setCourseMgmtOpen}
                    className="group/collapsible">
                    <SidebarMenuItem className="relative">
                      <SidebarMenuButton asChild className="pr-8">
                        <Link to="/course-management">
                          <courseManagementGroup.icon />
                          <span>{courseManagementGroup.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground">
                          <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90" />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {courseManagementGroup.items.map((sub) => (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuSubButton asChild>
                                <Link
                                  to={sub.url}
                                  className="flex items-center gap-2">
                                  <sub.icon className="h-3.5 w-3.5" />
                                  <span>{sub.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                  {navSecondary.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link to={item.url} className="flex items-center">
                          <item.icon />
                          <span className="flex-1">{item.title}</span>
                          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}

              {/* Teacher Navigation */}
              {isTeacher && (
                <>
                  {teacherNavFlat.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={({ isActive }) =>
                            isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                          }>
                          <item.icon />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  {/* Content collapsible */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setTeacherContentOpen((o) => !o)}
                      className="cursor-pointer"
                    >
                      <BookOpen />
                      <span>Content</span>
                      <ChevronDown
                        className={`ml-auto h-4 w-4 transition-transform ${teacherContentOpen ? "rotate-180" : ""}`}
                      />
                    </SidebarMenuButton>
                    {teacherContentOpen && (
                      <SidebarMenuSub>
                        {teacherContentItems.map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild>
                              <NavLink
                                to={item.url}
                                className={({ isActive }) =>
                                  isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                                }>
                                <item.icon />
                                <span>{item.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                </>
              )}

              {/* Student Navigation */}
              {!isAdmin && !isTeacher && (
                <>
                  {studentNavMain.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Student Learning Section */}
        {/* {!isAdmin && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {studentNavLearning.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )} */}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-1">
          <div className="min-w-0 flex-1">
            <NavUser
              user={{
                name: user?.display_name ?? "Undefined",
                email: user?.email ?? "Undefined",
                avatar: user?.avatar ?? undefined,
              }}
            />
          </div>
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
