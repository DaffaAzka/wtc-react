import React from "react";
import { Link, useLocation } from "react-router";
import { Home, BookOpen, GraduationCap, GitBranch, Award, Users, ArrowUpRight } from "lucide-react";
import { NavUser } from "@/components/nav-user";
import { ModeToggle } from "@/components/custom/mode-toggle";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth";

export default function StudentSidebar() {
  const location = useLocation();
  const { user } = useAuth();

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
                <Icon />
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
            <Icon />
            <span>{item.name}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar variant="sidebar">
      <SidebarHeader>
        {/* Brand */}
        <div className="px-2 pt-1">
          <span className="text-sm font-bold tracking-tight">WebTech TC</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
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
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-1">
          <div className="flex-1 min-w-0">
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
