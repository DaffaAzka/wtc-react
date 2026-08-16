import React from "react";
import { Link, useLocation } from "react-router";
import { Home, BookOpen, GraduationCap, GitBranch, Award, Users, ArrowUpRight, SidebarIcon, Divide } from "lucide-react";
import { NavUser } from "@/components/nav-user";
import { ModeToggle } from "@/components/custom/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth";

export default function StudentSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { toggleSidebar, state } = useSidebar();

  // Time-based animation: Morning (6am-6pm) or Night (6pm-6am)
  const getTimeBasedAnimation = () => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18
      ? "/videos/MorningAnimation.mp4"
      : "/videos/NightAnimation.mp4";
  };

  const [videoSrc] = React.useState(getTimeBasedAnimation());

  const menus = {
    main: [
      { name: "Beranda", icon: Home, href: "/student/dashboard", isExternal: false },
      { name: "Progress Belajar", icon: GraduationCap, href: "/student/progress", isExternal: false },
      { name: "Kelas", icon: BookOpen, href: "/student/classes", isExternal: false },
      { name: "Learning Path", icon: GitBranch, href: "/student/learning-path", isExternal: false },
    ],
    learning: [
      { name: "Tantangan", icon: Award, href: "/student/challenges", isExternal: false },
      { name: "Kelas Saya", icon: Users, href: "/student/study-classes", isExternal: false },
    ],
  };

  const NavItem = ({ item }: { item: (typeof menus.main)[0] }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.href;

    if (item.isExternal) {
      return (
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive}>
          <Link to={item.href}>
            <Icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="gap-0 p-0">
        {/* Video Animation - Full width, no padding */}
        <div className="relative w-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-36 object-cover"
            key={videoSrc}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>

          {/* Logo and toggle button overlay on video */}
          <div className="absolute top-4 left-4 flex items-center justify-between w-[calc(100%-2rem)]">
            <span className="text-base font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              WebTech TC.
            </span>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              <SidebarIcon className="h-4 w-4 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" />
            </button>
          </div>
        </div>
      </SidebarHeader>
      <div className="border-t mx-4" />
      <SidebarContent>
        <div className="flex flex-col mt-4">
          {/* Main menu */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menus.main.map((item, idx) => (
                  <NavItem key={idx} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Learning section */}
          <SidebarGroup>
            <SidebarGroupLabel>Learning</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menus.learning.map((item, idx) => (
                  <NavItem key={idx} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className={`flex ${state === "collapsed" ? "flex-col items-center gap-2" : "items-center gap-1"}`}>
          <div className={state === "expanded" ? "flex-1 min-w-0" : ""}>
            <NavUser
              user={{
                name: user?.display_name?.trim() || "Student",
                email: user?.email?.trim() || "student@example.com",
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
