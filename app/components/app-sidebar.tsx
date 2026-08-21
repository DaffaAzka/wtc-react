"use client";

import * as React from "react";
import { Link } from "react-router";

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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
} from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { firstCharacterUppercase } from "@/utils/global";
import { ModeToggle } from "./custom/mode-toggle";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const [courseMgmtOpen, setCourseMgmtOpen] = React.useState(true); // ← tambahin ini

  // Time-based animation: Morning (6am-6pm) or Night (6pm-6am)
  const getTimeBasedAnimation = () => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? "/videos/MorningAnimation.mp4" : "/videos/NightAnimation.mp4";
  };

  const [videoSrc] = React.useState(getTimeBasedAnimation());

  const isAdmin = user?.roles?.some((role) => role.name.toLowerCase() === "admin") ?? false;

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
    { title: "Progress Belajar", url: "/student/progress", icon: GraduationCap },
    { title: "Kelas", url: "/student/classes", icon: BookOpen },
    { title: "Learning Path", url: "/student/learning-path", icon: GitBranch },
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
    ],
  };

  const navSecondary = [
    { title: "User Management", url: "/user-management", icon: UsersIcon },
    { title: "Support", url: "#", icon: LifeBuoyIcon },
    { title: "Feedback", url: "#", icon: SendIcon },
  ];

  return (
    <Sidebar variant="sidebar" className="border-sidebar-border bg-sidebar text-sidebar-foreground" {...props}>
      <SidebarHeader className="gap-0 p-0">
        {/* Video Animation - Full width, no padding */}
        <div className="relative w-full overflow-hidden">
          <video autoPlay loop muted playsInline className="w-full h-36 object-cover" key={videoSrc}>
            <source src={videoSrc} type="video/mp4" />
          </video>

          {/* Logo overlay on video */}
          <div className="absolute bottom-12 right-15 w-full h-full flex items-center justify-center ">
            {/* <span className="text-base font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              WebTech TC.
            </span> */}
            <img src="/brand-pack/logo-h-dark.svg" alt="Logo" className="h-28 w-auto" />
          </div>
        </div>

        {/* Rest of content with padding restored */}
        <div className="flex flex-col gap-4 px-4 pt-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border border-sidebar-border">
              <AvatarImage src={user?.avatar ?? undefined} alt={user?.display_name ?? ""} />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
                <UserIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">{user?.display_name ?? "Undefined"}</p>
              <span className="mt-0.5 inline-block rounded-full bg-chart-2 px-2 py-0.5 text-[11px] font-semibold text-sidebar">{firstCharacterUppercase(user?.roles?.[0]?.name ?? "Undefined")}</span>
            </div>
          </div>

          <SidebarSeparator className="mx-0 bg-sidebar-border/60" />
        </div>
      </SidebarHeader>

      <SidebarContent>
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
                  <Collapsible open={courseMgmtOpen} onOpenChange={setCourseMgmtOpen} className="group/collapsible">
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
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        >
                          <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90" />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {courseManagementGroup.items.map((sub) => (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuSubButton asChild>
                                <Link to={sub.url} className="flex items-center gap-2">
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

              {/* Student Navigation */}
              {!isAdmin && (
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
        {!isAdmin && (
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
        )}
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
