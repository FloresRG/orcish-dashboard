"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Phone, Video, Search, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatHeaderProps {
  contact: { id: string; name: string; phone: string } | null;
  isWebSocketConnected?: boolean;
  onReconnect?: () => void;
}

export function ChatHeader({ contact, isWebSocketConnected = false, onReconnect }: ChatHeaderProps) {

  if (!contact) {
    return (
      <div className="flex items-center gap-3 border-b bg-background px-4 py-3">
        <div className="flex-1">
          <div className="font-medium">Select a contact</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 border-b bg-background px-4 py-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src="/placeholder-user.jpg" alt={contact.name} />
        <AvatarFallback>
          {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="font-medium">{contact.name}</div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">{contact.phone}</div>
          <Badge variant={isWebSocketConnected ? "default" : "secondary"} className="text-xs">
            {isWebSocketConnected ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                En línea
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Sin conexión
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Video className="h-5 w-5" />
        </Button>

        {/* Reconnect button - only show when disconnected */}
        {!isWebSocketConnected && onReconnect && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReconnect}
            className="rounded-full text-xs"
          >
            Reconectar
          </Button>
        )}

        {/* Desktop: dropdown menu */}
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

        {/* Mobile: contact settings */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}