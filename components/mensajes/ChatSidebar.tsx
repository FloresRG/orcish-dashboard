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
import { Loader2 } from "lucide-react";
import { useContacts } from "@/hooks/useContacts";
import { Contact } from "@/lib/conect-front";
import { Badge } from "@/components/ui/badge";

interface ChatSidebarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onContactSelect: (contact: Contact) => void;
  selectedContactId: string | null;
  sessionId?: string | null;
}

export function ChatSidebar({
  searchTerm,
  onSearchChange,
  onContactSelect,
  selectedContactId,
  sessionId
}: ChatSidebarProps) {
  const {
    contacts,
    loading,
    error,
    loadMoreContacts,
    searchContacts
  } = useContacts(sessionId || null);


  const handleSearchChange = (value: string) => {
    console.log('🔍 ChatSidebar: Search term changed:', value);
    onSearchChange(value);
    searchContacts(value);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (nearBottom && !loading) {
      loadMoreContacts();
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex h-full w-72 flex-col border-r bg-background">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/placeholder-user.jpg" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Buscar contactos..."
            className="w-full rounded-lg bg-muted px-3 py-2 text-sm"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Nuevo grupo</DropdownMenuItem>
            <DropdownMenuItem>Nueva transmisión</DropdownMenuItem>
            <DropdownMenuItem>Dispositivos vinculados</DropdownMenuItem>
            <DropdownMenuItem>Mensajes destacados</DropdownMenuItem>
            <DropdownMenuItem>Configuración</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-1 overflow-auto" onScroll={handleScroll}>
        {error && (
          <div className="p-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-1 p-2">
          {contacts.map((contact) => (
            <button
              key={contact.id_contac || contact.id}
              onClick={() => {
                console.log('👆 ChatSidebar: Contact clicked:', contact.nombre_completo || contact.name, contact.id_contac || contact.id);
                console.log('📋 Full contact object:', contact);
                onContactSelect(contact);
              }}
              className={`flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted ${
                selectedContactId === (contact.id_contac || contact.id) ? 'bg-muted' : ''
              }`}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src="/placeholder-user.jpg" alt={contact.nombre_completo} />
                <AvatarFallback>
                  {(contact.nombre_completo || contact.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium truncate">{contact.nombre_completo || contact.name}</div>
                  <div className="flex items-center gap-1">
                    {contact.estado && (
                      <Badge variant={
                        contact.estado === 'caliente' ? 'default' :
                        contact.estado === 'tibio' ? 'secondary' : 'outline'
                      } className="text-xs">
                        {contact.estado}
                      </Badge>
                    )}
                    {contact.ia && (
                      <Badge variant="outline" className="text-xs">
                        IA
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground truncate">
                    {contact.phone || 'Sin teléfono'}
                  </div>
                  {contact.messageCount && contact.messageCount > 0 && (
                    <div className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {contact.messageCount}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}

          {loading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {!loading && contacts.length === 0 && !error && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No se encontraron contactos
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}