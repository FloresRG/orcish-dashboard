"use client";

import { useState, useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Loader2 } from "lucide-react";
import { getAuthData } from "@/lib/storage";
import { UserRole } from "@/types/auth";
import { ChatSidebar } from "@/components/mensajes/ChatSidebar";
import { ChatHeader } from "@/components/mensajes/ChatHeader";
import { ChatWindow } from "@/components/mensajes/ChatWindow";
import { ChatInput } from "@/components/mensajes/ChatInput";
import { ContactSettingsSidebar } from "@/components/mensajes/ContactSettingsSidebar";
import { useContacts } from "@/hooks/useContacts";
import { useMessages } from "@/hooks/useMessages";
import { useWebSocketNew as useWebSocket } from "@/hooks/useWebSocketNew";
import { useSessions } from "@/hooks/useSessions";
import webSocketService from "@/lib/websocket.service";
import { Contact, Message } from "@/lib/conect-front";
import { WhatsAppSession } from "@/lib/whatsapp";
import { WebSocketMessage } from "@/hooks/useWebSocket";

export default function MensajesPage() {
  const [user, setUser] = useState<{ name: string; email: string; role: UserRole } | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<WhatsAppSession | null>(null);

  // Load available WhatsApp sessions
  const { sessions, loading: sessionsLoading, error: sessionsError } = useSessions();

  const { isConnected, subscribeToSession, unsubscribeFromSession, connect } = useWebSocket(getAuthData().token || '');

  // Auto-select session based on user role and connect WebSocket
  useEffect(() => {
    if (sessions.length > 0 && !selectedSession) {
      if (user?.role === UserRole.ADMIN) {
        // Admin: Don't auto-select, let them choose from cards
        console.log('👑 MensajesPage: Admin user - showing session selector');
      } else if (user?.role === UserRole.USER) {
        // User: Auto-select the default session
        const defaultSession = sessions.find(s => s.id === 'c80bb801-6fbc-4ee3-bb1a-d8048440d1eb') || sessions[0];
        if (defaultSession) {
          console.log('👤 MensajesPage: User auto-selecting session:', defaultSession.id);
          setSelectedSession(defaultSession);
          // Connect WebSocket first, then subscribe
          connect();
          // Small delay to ensure connection is established
          setTimeout(() => {
            subscribeToSession(defaultSession.id);
          }, 500);
        }
      }
    }
  }, [sessions, selectedSession, user?.role, connect, subscribeToSession]);

  // Hooks for data management
  const { refetch: refetchContacts } = useContacts(selectedSession?.id || null);
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    currentContact,
    loadMoreMessages,
    sendMessage: sendMessageHook,
    addIncomingMessage,
  } = useMessages(selectedSession?.id || null, selectedContact?.id || null);

  // Handle WebSocket messages - Using new service
  useEffect(() => {
    console.log('🔌 MensajesPage: Setting up WebSocket message handler');

    const handleIncomingMessage = (data?: { sessionId?: string; message?: string; timestamp?: number }) => {
      console.log('📥 MensajesPage: Incoming message:', data);

      if (!data) return;

      // Check if this message belongs to the current session
      if (data.sessionId !== selectedSession?.id) {
        console.log('📨 MensajesPage: Ignoring message from different session:', data.sessionId);
        return;
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        content: data.message || '',
        timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString(),
        isSent: false,
        isReceived: true,
        type: 'whatsapp_incoming',
        tipo_mensaje: 'espera',
      };
      addIncomingMessage(newMessage);

      // Play sound notification
      playIncomingMessageSound();

      // Refresh contacts to update last message
      refetchContacts();
    };

    const handleOutgoingMessage = (data?: { sessionId?: string; message?: string; timestamp?: number }) => {
      console.log('🤖 MensajesPage: Outgoing message:', data);

      if (!data) return;

      // Check if this message belongs to the current session
      if (data.sessionId !== selectedSession?.id) {
        console.log('📨 MensajesPage: Ignoring message from different session:', data.sessionId);
        return;
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        content: data.message || '',
        timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString(),
        isSent: true,
        isReceived: false,
        type: 'system_outgoing',
        tipo_mensaje: 'espera',
      };
      addIncomingMessage(newMessage);
    };

    const playIncomingMessageSound = () => {
      // Create audio notification for incoming messages
      try {
        const audio = new Audio('/notification.mp3'); // Add this sound file to public/
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Could not play notification sound:', e));
      } catch (error) {
        console.log('Sound notification not available');
      }
    };

    webSocketService.on('message_incoming', handleIncomingMessage);
    webSocketService.on('message_outgoing', handleOutgoingMessage);

    return () => {
      console.log('🔌 MensajesPage: Cleaning up WebSocket message handler');
      webSocketService.off('message_incoming', handleIncomingMessage);
      webSocketService.off('message_outgoing', handleOutgoingMessage);
    };
  }, [selectedSession?.id, addIncomingMessage, refetchContacts]);

  // Load user data
  useEffect(() => {
    const { user: storedUser } = getAuthData();
    setUser(storedUser);
  }, []);

  // Handle session selection
  const handleSessionSelect = (session: WhatsAppSession) => {
    console.log('📱 MensajesPage: Session selected:', session.phoneNumber, session.id);

    // Unsubscribe from previous session if exists
    if (selectedSession) {
      unsubscribeFromSession(selectedSession.id);
    }

    setSelectedSession(session);
    // Clear selected contact when switching sessions
    setSelectedContact(null);

    // Connect WebSocket if not connected, then subscribe
    if (!isConnected) {
      connect();
      // Small delay to ensure connection is established
      setTimeout(() => {
        subscribeToSession(session.id);
      }, 500);
    } else {
      subscribeToSession(session.id);
    }
  };

  // Handle contact selection
  const handleContactSelect = (contact: Contact) => {
    console.log('👆 MensajesPage: Contact selected:', contact.name, contact.id);
    setSelectedContact(contact);
  };

  // Handle sending messages
  const handleSendMessage = async (messageText: string) => {
    if (!selectedContact) {
      console.warn('⚠️ MensajesPage: Cannot send message - no contact selected');
      return;
    }

    console.log('📤 MensajesPage: Sending message to contact:', selectedContact.name);
    try {
      await sendMessageHook(messageText);
      // Refresh contacts to update last message
      console.log('🔄 MensajesPage: Refreshing contacts after message sent');
      refetchContacts();
    } catch (error) {
      console.error('❌ MensajesPage: Failed to send message:', error);
    }
  };

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
          {/* Role-based UI */}
          {user?.role === UserRole.ADMIN ? (
            // Admin: Show session selector cards
            <>
              {/* Session Selector */}
              <div className="w-64 border-r bg-background p-4">
                <h3 className="font-medium mb-4">WhatsApp Sessions</h3>

                {sessionsLoading && (
                  <div className="text-sm text-muted-foreground">Loading sessions...</div>
                )}

                {sessionsError && (
                  <div className="text-sm text-destructive">{sessionsError}</div>
                )}

                {!sessionsLoading && sessions.length === 0 && !sessionsError && (
                  <div className="text-sm text-muted-foreground">
                    No WhatsApp sessions found. Create one in the WhatsApp section.
                  </div>
                )}

                <div className="space-y-2">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleSessionSelect(session)}
                      className={`w-full p-3 text-left rounded-lg border transition-colors ${
                        selectedSession?.id === session.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted hover:bg-muted/80 border-border'
                      }`}
                    >
                      <div className="font-medium">{session.phoneNumber}</div>
                      <div className="text-sm opacity-70 capitalize">{session.status}</div>
                      {session.lastConnection && (
                        <div className="text-xs opacity-50">
                          Last: {new Date(session.lastConnection).toLocaleDateString()}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Interface - Only show if session is selected */}
              {selectedSession ? (
                <>
                  <ChatSidebar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onContactSelect={handleContactSelect}
                    selectedContactId={selectedContact?.id || null}
                    sessionId={selectedSession?.id}
                  />

                  {/* Main chat area */}
                  <div className="flex h-full flex-1 flex-col">
                    <ChatHeader contact={currentContact} isWebSocketConnected={isConnected} onReconnect={connect} />
                    <ChatWindow
                      messages={messages}
                      loading={messagesLoading}
                      error={messagesError}
                      currentContact={currentContact}
                      onLoadMore={loadMoreMessages}
                    />
                    <ChatInput
                      onSendMessage={handleSendMessage}
                      disabled={!selectedContact}
                    />
                  </div>

                  {/* Contact settings panel — desktop only */}
                  <div className="hidden md:block">
                    <ContactSettingsSidebar />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📱</div>
                    <h3 className="text-lg font-medium">Select a WhatsApp Session</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a session from the sidebar to start chatting
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : user?.role === UserRole.USER ? (
            // User: Direct messages view with auto-selected session
            selectedSession ? (
              <>
                <ChatSidebar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onContactSelect={handleContactSelect}
                  selectedContactId={selectedContact?.id || null}
                  sessionId={selectedSession?.id}
                />

                {/* Main chat area */}
                <div className="flex h-full flex-1 flex-col">
                  <ChatHeader contact={currentContact} />
                  <ChatWindow
                    messages={messages}
                    loading={messagesLoading}
                    error={messagesError}
                    currentContact={currentContact}
                    onLoadMore={loadMoreMessages}
                  />
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    disabled={!selectedContact}
                  />
                </div>

                {/* Contact settings panel — desktop only */}
                <div className="hidden md:block">
                  <ContactSettingsSidebar />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading your session...</p>
                </div>
              </div>
            )
          ) : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}