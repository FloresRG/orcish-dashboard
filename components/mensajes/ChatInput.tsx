"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || sending || disabled) {
      console.log('⚠️ ChatInput: Cannot send message - validation failed', { trimmedMessage, sending, disabled });
      return;
    }

    console.log('📤 ChatInput: Sending message:', trimmedMessage.substring(0, 50) + (trimmedMessage.length > 50 ? '...' : ''));

    try {
      setSending(true);
      await onSendMessage(trimmedMessage);
      console.log('✅ ChatInput: Message sent successfully');
      setMessage("");
    } catch (error) {
      console.error('❌ ChatInput: Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (!sending && inputRef.current) {
      inputRef.current.focus();
    }
  }, [sending]);

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 border-t bg-background px-4 py-3">
      <Input
        ref={inputRef}
        type="text"
        placeholder={disabled ? "Select a contact to start chatting" : "Type a message..."}
        className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled || sending}
      />
      <Button
        type="submit"
        className="rounded-lg px-4 py-2 text-sm"
        disabled={!message.trim() || sending || disabled}
      >
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}