"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, Camera, Mic } from "lucide-react";

export function ChatInput() {
  return (
    <div className="flex items-center gap-3 border-t bg-background px-4 py-3">
      <Input
        type="text"
        placeholder="Type a message"
        className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm"
      />
      <Button variant="ghost" size="icon" className="rounded-full">
        <Paperclip className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Camera className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Mic className="h-5 w-5" />
      </Button>
      <Button className="rounded-lg px-4 py-2 text-sm">Send</Button>
    </div>
  );
}