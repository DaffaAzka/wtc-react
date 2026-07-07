"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavModules } from "@/components/nav-modules";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  LifeBuoyIcon,
  SendIcon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
  TerminalIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { firstCharacterUppercase } from "@/utils/global";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const data = {
    navMain: [
      {
        title: "Learning Tracks",
        url: "#",
        icon: <TerminalSquareIcon />,
        isActive: true,
        roleAllowed: true,
        items: [
          {
            title: "My Courses",
            url: "#",
            roleAllowed: true,
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "#",
        icon: <LifeBuoyIcon />,
      },
      {
        title: "Feedback",
        url: "#",
        icon: <SendIcon />,
      },
    ],
    modules: [
      {
        name: "Tracks",
        url: "/tracks",
        icon: <FrameIcon />,
        roleAllowed: true,
      },
    ],
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <TerminalIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">WebTech TC.</span>
                  <span className="truncate text-xs">
                    {firstCharacterUppercase(user?.role || "Undefined")}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {user?.role === "admin" && <NavModules items={data.modules} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name || "Undefined",
            email: user?.email || "Undefined",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
