"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { MoreVertical } from "lucide-react";

interface ChatSidebarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function ChatSidebar({ searchTerm, onSearchChange }: ChatSidebarProps) {
  return (
    <div className="flex h-full w-72 flex-col border-r bg-background">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/placeholder-user.jpg" alt="User" />
          <AvatarFallback>JP</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search or start new chat"
            className="w-full rounded-lg bg-muted px-3 py-2 text-sm"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>New group</DropdownMenuItem>
            <DropdownMenuItem>New broadcast</DropdownMenuItem>
            <DropdownMenuItem>Linked devices</DropdownMenuItem>
            <DropdownMenuItem>Starred messages</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ScrollArea className="flex-1 overflow-auto">
        <div className="grid gap-2 p-4">
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
            prefetch={false}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder-user.jpg" alt="John Doe" />
              <AvatarFallback>JP</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">John Doe</div>
              <div className="text-sm text-muted-foreground">
                Hey, how are you doing?
              </div>
            </div>
            <div className="text-xs text-muted-foreground">12:34 PM</div>
          </Link>
          {/* Aquí irá .map(sessions) más adelante */}
        </div>
      </ScrollArea>
    </div>
  );
}