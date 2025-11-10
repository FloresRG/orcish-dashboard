"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconUser,
  IconMessage,
  IconPhone,
  IconBook,
  IconRobot,
  IconChartLine,
  IconDatabase as IconDB,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
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
import { UserRole } from "@/types/auth";

// Function to get navigation data based on user role
const getNavigationData = (userRole?: UserRole) => {
  const baseData = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navSecondary: [],
  };

  switch (userRole) {
    case UserRole.ADMIN:
      return {
        ...baseData,
        navMain: [
          {
            title: "Panel de Control",
            url: "/admin/dashboard",
            icon: IconDashboard,
          },
          {
            title: "Usuarios",
            url: "/admin/users",
            icon: IconUser,
          },
          {
            title: "WhatsApp",
            url: "/admin/whatsapp",
            icon: IconPhone,
          },
          {
            title: "Contactos",
            url: "/admin/contacts",
            icon: IconMessage,
          },
          {
            title: "Mensajes",
            url: "/Mensajes",
            icon: IconMessage,
          },
          {
            title: "Cursos",
            url: "/admin/courses",
            icon: IconBook,
          },
          {
            title: "Aprendizaje",
            url: "/admin/learning",
            icon: IconFileAi,
          },
          {
            title: "Sistema IA",
            url: "/admin/ai",
            icon: IconRobot,
          },
          {
            title: "Analíticas",
            url: "/admin/analytics",
            icon: IconChartLine,
          },
        ],
        navClouds: [],
        documents: [],
      };

    case UserRole.USER:
      return {
        ...baseData,
        navMain: [
          {
            title: "Panel de Control",
            url: "/dashboard",
            icon: IconDashboard,
          },
          {
            title: "WhatsApp",
            url: "/whatsapp",
            icon: IconPhone,
          },
          {
            title: "Mensajes",
            url: "/Mensajes",
            icon: IconMessage,
          },
          {
            title: "Cursos",
            url: "/user/courses",
            icon: IconBook,
          },
          {
            title: "Aprendizaje",
            url: "/user/learning",
            icon: IconFileAi,
          },
        ],
        navClouds: [],
        documents: [],
      };

    case UserRole.GUEST:
    default:
      return {
        ...baseData,
        navMain: [
          {
            title: "Cursos",
            url: "/guest/courses",
            icon: IconBook,
          },
          {
            title: "Consultar IA",
            url: "/guest/ai",
            icon: IconRobot,
          },
        ],
        navClouds: [],
        documents: [],
      };
  }
};

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user?: { name: string; email: string; avatar?: string; role?: UserRole } }) {
  const data = getNavigationData(user?.role);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  POSGRADING
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user ? { ...user, avatar: user.avatar || "/avatars/default.jpg" } : data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
