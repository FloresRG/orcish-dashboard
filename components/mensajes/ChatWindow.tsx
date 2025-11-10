"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { Message } from "@/lib/conect-front";

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
  currentContact: { id: string; name: string; phone: string } | null;
  onLoadMore: () => void;
}

export function ChatWindow({
  messages,
  loading,
  error,
  currentContact,
  onLoadMore
}: ChatWindowProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && !loading) {
      onLoadMore();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (!currentContact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <div className="text-2xl mb-2">💬</div>
          <h3 className="text-lg font-medium">Select a contact</h3>
          <p className="text-sm text-muted-foreground">
            Choose a contact from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className="flex-1 overflow-auto"
      onScroll={handleScroll}
    >
      <div className="min-h-full p-4">
        {loading && messages.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-4">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

        <div className="grid gap-4">
          {loading && messages.length > 0 && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}

          {/* Sort messages by timestamp (oldest first) */}
          {messages
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.isSent ? 'justify-end' : ''
              }`}
            >
              {!message.isSent && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt={currentContact.name} />
                  <AvatarFallback>
                    {currentContact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[75%] rounded-lg p-3 text-sm ${
                  message.isSent
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <div className={`mt-2 text-xs ${
                  message.isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>

              {message.isSent && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="You" />
                  <AvatarFallback>Y</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {messages.length === 0 && !loading && !error && (
            <div className="text-center py-8">
              <div className="text-2xl mb-2">📭</div>
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}