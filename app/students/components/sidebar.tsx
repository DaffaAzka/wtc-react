"use client";

import * as React from "react";
import { Link, useLocation } from "react-router";
import { Home, BookOpen, GraduationCap, GitBranch, Award, Users, ArrowUpRight, UserIcon } from "lucide-react";
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth";
import { firstCharacterUppercase } from "@/utils/global";

export default function StudentSidebar() {
  const location = useLocation();
  const { user } = useAuth();

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
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-sidebar-border bg-sidebar text-sidebar-foreground border-r-0">
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
          <div className="absolute top-4 left-4">
            <span className="text-base font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              WebTech TC.
            </span>
          </div>
        </div>

        {/* Rest of content with padding restored */}
        <div className="flex flex-col gap-4 px-4 pt-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border border-sidebar-border">
              <AvatarImage
                src={user?.avatar ?? undefined}
                alt={user?.display_name ?? ""}
              />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
                <UserIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                {user?.display_name ?? "Student"}
              </p>
              <span className="mt-0.5 inline-block rounded-full bg-chart-2 px-2 py-0.5 text-[11px] font-semibold text-sidebar">
                {firstCharacterUppercase(user?.roles?.[0]?.name ?? "Student")}
              </span>
            </div>
          </div>

          <SidebarSeparator className="mx-0 bg-sidebar-border/60" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menus.main.map((item, idx) => (
                <NavItem key={idx} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-1">
          <div className="min-w-0 flex-1">
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
