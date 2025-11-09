"use client";

import { useState, useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Loader2 } from "lucide-react";
import { getAuthData } from "@/lib/storage";
import { UserRole } from "@/types/auth";
import { getWhatsAppSessions } from "@/lib/whatsapp";
import { toast } from "sonner";
import { ChatSidebar } from "@/components/mensajes/ChatSidebar";
import { ChatHeader } from "@/components/mensajes/ChatHeader";
import { ChatWindow } from "@/components/mensajes/ChatWindow";
import { ChatInput } from "@/components/mensajes/ChatInput";
import { ContactSettingsSidebar } from "@/components/mensajes/ContactSettingsSidebar";

export default function MensajesPage() {
  const [user, setUser] = useState<{ name: string; email: string; role: UserRole } | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const loadSessions = async () => {
    try {
      const sessionsData = await getWhatsAppSessions();
      setSessions(sessionsData);
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast.error("Failed to load sessions");
    }
  };

  useEffect(() => {
    const { user: storedUser } = getAuthData();
    setUser(storedUser);
    if (storedUser) loadSessions();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (user.role === UserRole.GUEST) return null;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={user} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex h-[calc(100vh-var(--header-height))] w-full">
          <ChatSidebar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          {/* Área principal de chat */}
          <div className="flex h-full flex-1 flex-col">
            <ChatHeader />
            <ChatWindow />
            <ChatInput />
          </div>

          {/* Panel de configuración del contacto — solo en escritorio */}
          <div className="hidden md:block">
            <ContactSettingsSidebar />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}