"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/auth";
import { Contact } from "@/types/admin";
import {
  Users,
  MessageSquare,
  Bot,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Phone,
  RefreshCw
} from "lucide-react";

export default function UserContactsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.USER)) {
      console.log('🔐 UserContactsPage: Access denied - redirecting to home');
      router.push('/');
      return;
    }

    if (user?.role === UserRole.USER) {
      console.log('👥 UserContactsPage: Loading contacts for user');
      loadContacts();
    }
  }, [user, authLoading, router]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to get user's contacts
      // const response = await fetch(`/api/v1/contact/user/${user.id}`);
      // const data = await response.json();
      // setContacts(data);

      // Mock data for now
      setContacts([
        {
          id: "1",
          nombre_completo: "Juan Pérez",
          phone: "59112345678",
          estado: "frio",
          ia: true,
          registrado: false,
          fecha: "2024-01-15T10:00:00.000Z",
          messageCount: 5,
          lastMessage: {
            content: "Hola, quiero información sobre cursos",
            fecha: "2024-01-15T10:30:00.000Z",
            estado: "recibido"
          }
        },
        {
          id: "2",
          nombre_completo: "María García",
          phone: "59187654321",
          estado: "tibio",
          ia: false,
          registrado: true,
          fecha: "2024-01-14T15:20:00.000Z",
          messageCount: 12,
          lastMessage: {
            content: "¿Cuál es el precio del curso?",
            fecha: "2024-01-15T09:15:00.000Z",
            estado: "enviado"
          }
        }
      ]);
    } catch (error) {
      console.error('❌ UserContactsPage: Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIA = async (contact: Contact) => {
    try {
      // TODO: Implement API call to toggle IA
      // await fetch(`/api/v1/contact/cambiar-ia/${contact.phone}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ ia: !contact.ia })
      // });

      // Update local state
      setContacts(prev => prev.map(c =>
        c.id === contact.id ? { ...c, ia: !c.ia } : c
      ));
    } catch (error) {
      console.error('❌ UserContactsPage: Failed to toggle IA:', error);
    }
  };

  const handleUpdateWaitingMessages = async (contact: Contact) => {
    try {
      // TODO: Implement API call to update waiting messages
      // await fetch(`/api/v1/contact/actualizar-estados/${contact.phone}`, {
      //   method: 'PUT'
      // });

      console.log('📝 Updated waiting messages for contact:', contact.phone);
    } catch (error) {
      console.error('❌ UserContactsPage: Failed to update waiting messages:', error);
    }
  };

  const getStateBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      frio: "outline",
      tibio: "secondary",
      caliente: "default",
      cerrado: "destructive"
    };
    return <Badge variant={variants[estado] || "outline"}>{estado}</Badge>;
  };

  if (authLoading || !user || user.role !== UserRole.USER) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar user={user} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">My Contacts</h1>
                    <p className="text-muted-foreground">
                      Manage your personal contacts and lead interactions (User Access)
                    </p>
                  </div>
                  <Button variant="outline" onClick={loadContacts}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{contacts.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">With AI</CardTitle>
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {contacts.filter(c => c.ia).length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {contacts.filter(c => c.estado !== 'cerrado').length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Converted</CardTitle>
                      <Badge variant="default" className="text-xs">Closed</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {contacts.filter(c => c.estado === 'cerrado').length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contacts List */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>My Contacts</CardTitle>
                    <CardDescription>
                      Manage your personal contacts and their lead status.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Loading contacts...</p>
                      </div>
                    ) : contacts.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No contacts found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {contacts.map((contact) => (
                          <Card key={contact.id} className="border">
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <div className="font-medium">{contact.nombre_completo}</div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {contact.phone}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Created: {new Date(contact.fecha).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getStateBadge(contact.estado)}
                                    {contact.ia && <Badge variant="outline">AI</Badge>}
                                    <Badge variant="secondary">{contact.messageCount} messages</Badge>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleIA(contact)}
                                  >
                                    {contact.ia ? (
                                      <ToggleRight className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <ToggleLeft className="h-4 w-4 text-gray-400" />
                                    )}
                                    <span className="ml-1">AI</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateWaitingMessages(contact)}
                                  >
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Update Messages
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              {contact.lastMessage && (
                                <div className="mt-2 text-sm text-muted-foreground">
                                  Last: {contact.lastMessage.content.substring(0, 100)}
                                  {contact.lastMessage.content.length > 100 && '...'}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}