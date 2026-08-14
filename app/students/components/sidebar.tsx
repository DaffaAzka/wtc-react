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
import { ChevronDown, ChevronRight, LayersIcon, LifeBuoyIcon, ListTreeIcon, NotebookTextIcon, RouteIcon, SendIcon, TerminalSquareIcon, UserIcon, UsersIcon } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { firstCharacterUppercase } from "@/utils/global";
import { ModeToggle } from "@/components/custom/mode-toggle";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const [courseMgmtOpen, setCourseMgmtOpen] = React.useState(true); // ← tambahin ini

  const isAdmin = user?.roles?.some((role) => role.name.toLowerCase() === "admin") ?? false;

  const navFlat = [
    {
      title: "Courses",
      url: "/courses",
      icon: TerminalSquareIcon,
      isActive: true,
    },
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
      <SidebarHeader className="gap-4">
        {/* Wordmark */}
        <div className="px-2 pt-1">
          <span className="text-sm font-bold tracking-tight text-sidebar-foreground">WebTech TC.</span>
        </div>

        <div className="flex items-center gap-3 px-2">
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
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Item datar teratas */}
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
              {isAdmin && (
                <Collapsible open={courseMgmtOpen} onOpenChange={setCourseMgmtOpen} className="group/collapsible">
                  <SidebarMenuItem className="relative">
                    {" "}
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
              )}

              {/* Item datar dengan panah kanan */}
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
