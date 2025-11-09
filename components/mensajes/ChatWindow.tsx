"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ChatWindow() {
  return (
    <ScrollArea className="flex-1 overflow-auto">
      <div className="grid gap-4 p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt="Sender" />
            <AvatarFallback>JP</AvatarFallback>
          </Avatar>
          <div className="max-w-[75%] rounded-lg bg-muted p-3 text-sm">
            <p>Hey, how are you doing?</p>
            <div className="mt-2 text-xs text-muted-foreground">12:34 PM</div>
          </div>
        </div>
        <div className="flex items-start gap-3 justify-end">
          <div className="max-w-[75%] rounded-lg bg-primary p-3 text-sm text-primary-foreground">
            <p>I'm doing great, thanks for asking!</p>
            <div className="mt-2 text-xs text-muted-foreground">12:35 PM</div>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt="You" />
            <AvatarFallback>JP</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt="Sender" />
            <AvatarFallback>JP</AvatarFallback>
          </Avatar>
          <div className="max-w-[75%] rounded-lg bg-muted p-3 text-sm">
            <p>That's great to hear! Did you have any plans for the weekend?</p>
            <div className="mt-2 text-xs text-muted-foreground">12:36 PM</div>
          </div>
        </div>
        <div className="flex items-start gap-3 justify-end">
          <div className="max-w-[75%] rounded-lg bg-primary p-3 text-sm text-primary-foreground">
            <p>I was thinking of going to the park for a picnic. Would you like to join?</p>
            <div className="mt-2 text-xs text-muted-foreground">12:37 PM</div>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt="You" />
            <AvatarFallback>JP</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </ScrollArea>
  );
}