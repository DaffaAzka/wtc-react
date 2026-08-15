import React from "react";
import { Outlet } from "react-router";
import StudentSidebar from "@/students/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function StudentLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
        <StudentSidebar />

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 dark:bg-gray-900">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
