"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Bell } from "lucide-react";
import { useState } from "react";
import { ContactSettingsSidebar } from "./ContactSettingsSidebar";

export function ChatHeader() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex items-center gap-3 border-b bg-background px-4 py-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src="/placeholder-user.jpg" alt="Contact" />
        <AvatarFallback>JP</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="font-medium">John Doe</div>
        <div className="text-sm text-muted-foreground">Online</div>
      </div>

      {/* Desktop: panel fijo a la derecha — no se muestra aquí */}
      {/* Mobile: botón para abrir settings */}
      <div className="md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setSheetOpen(true)}>
          <Bell className="h-5 w-5" />
        </Button>
        <ContactSettingsSidebar
          isMobile
          isOpen={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      </div>

      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View contact</DropdownMenuItem>
            <DropdownMenuItem>Media, links, and docs</DropdownMenuItem>
            <DropdownMenuItem>Search</DropdownMenuItem>
            <DropdownMenuItem>Mute notifications</DropdownMenuItem>
            <DropdownMenuItem>Delete chat</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}