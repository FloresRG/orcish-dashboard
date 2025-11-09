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
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
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
    navSecondary: [
      {
        title: "Settings",
        url: "#",
        icon: IconSettings,
      },
      {
        title: "Get Help",
        url: "#",
        icon: IconHelp,
      },
      {
        title: "Search",
        url: "#",
        icon: IconSearch,
      },
    ],
  };

  switch (userRole) {
    case UserRole.ADMIN:
      return {
        ...baseData,
        navMain: [
          {
            title: "Dashboard",
            url: "#",
            icon: IconDashboard,
          },
          {
            title: "Lifecycle",
            url: "#",
            icon: IconListDetails,
          },
          {
            title: "Analytics",
            url: "#",
            icon: IconChartBar,
          },
          {
            title: "Projects",
            url: "#",
            icon: IconFolder,
          },
          {
            title: "Team",
            url: "#",
            icon: IconUsers,
          },
        ],
        navClouds: [
          {
            title: "Capture",
            icon: IconCamera,
            isActive: true,
            url: "#",
            items: [
              {
                title: "Active Proposals",
                url: "#",
              },
              {
                title: "Archived",
                url: "#",
              },
            ],
          },
          {
            title: "Proposal",
            icon: IconFileDescription,
            url: "#",
            items: [
              {
                title: "Active Proposals",
                url: "#",
              },
              {
                title: "Archived",
                url: "#",
              },
            ],
          },
          {
            title: "Prompts",
            icon: IconFileAi,
            url: "#",
            items: [
              {
                title: "Active Proposals",
                url: "#",
              },
              {
                title: "Archived",
                url: "#",
              },
            ],
          },
        ],
        documents: [
          {
            name: "Data Library",
            url: "#",
            icon: IconDatabase,
          },
          {
            name: "Reports",
            url: "#",
            icon: IconReport,
          },
          {
            name: "Word Assistant",
            url: "#",
            icon: IconFileWord,
          },
        ],
      };

    case UserRole.USER:
      return {
        ...baseData,
        navMain: [
          {
            title: "Dashboard",
            url: "#",
            icon: IconDashboard,
          },
          {
            title: "WhatsApp",
            url: "/whatsapp",
            icon: IconFileAi, // You can change this to a WhatsApp icon if available
          },
           {
            title: "Mensajes",
            url: "/Mensajes",
            icon: IconFileAi, // You can change this to a WhatsApp icon if available
          },
        ],
        navClouds: [],
        documents: [],
      };

    case UserRole.GUEST:
    default:
      return {
        ...baseData,
        navMain: [],
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
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user ? { ...user, avatar: user.avatar || "/avatars/default.jpg" } : data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
