"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Clock, ShieldCheck, Trash2, Archive, Volume2 } from "lucide-react";

interface ContactSettingsSidebarProps {
  isMobile?: boolean;
}

export function ContactSettingsSidebar({
  isMobile = false,
}: ContactSettingsSidebarProps) {
  const contact = {
    name: "John Doe",
    phone: "+591 78271408",
    email: "john@example.com",
    joined: "2023-05-12",
    lastSeen: "12:34",
    status: "Online",
    isVerified: true,
  };

  const desktopContent = (
    <div className="flex h-full w-64 flex-col border-l bg-background p-4">
      <div className="flex flex-col items-center gap-4 py-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src="/placeholder-user.jpg" alt={contact.name} />
          <AvatarFallback>{contact.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
        </Avatar>
        {contact.isVerified && <ShieldCheck className="text-green-500 h-5 w-5" />}
        <div className="text-center">
          <h2 className="font-semibold">{contact.name}</h2>
          <p className="text-sm text-muted-foreground">{contact.status}</p>
          <Badge variant="outline" className="mt-1">WhatsApp Business</Badge>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{contact.phone}</span>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{contact.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Joined {contact.joined}</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Last seen today at {contact.lastSeen}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-2 mt-auto">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Volume2 className="h-4 w-4" />
          <span className="text-sm">Mute notifications</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Archive className="h-4 w-4" />
          <span className="text-sm">Archive chat</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 text-destructive">
          <Trash2 className="h-4 w-4" />
          <span className="text-sm">Delete chat</span>
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="hidden">
        {/* Mobile contact settings - placeholder for now */}
        {desktopContent}
      </div>
    );
  }

  return desktopContent;
}