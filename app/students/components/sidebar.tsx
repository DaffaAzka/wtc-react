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
      <SidebarHeader className="my-2">
        {/* Brand */}
        <div className={`pt-2 flex items-center ${state === "collapsed" ? "justify-center" : "justify-between pl-4"}`}>
          {state === "expanded" && <span className="text-md font-bold tracking-tight">WebTech TC</span>}
          <button onClick={toggleSidebar} className={`p-1.5 rounded hover:bg-muted/50 transition-colors ${state === "collapsed" ? "" : "mr-2"}`}>
            <SidebarIcon className="h-4 w-4" />
          </button>
        </div>
      </SidebarHeader>
      <div className=" border-t mx-4 " />
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
