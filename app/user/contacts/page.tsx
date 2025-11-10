"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useContacts } from "@/hooks/useContacts";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/auth";
import { Contact as AdminContact } from "@/types/admin";
import { Contact } from "@/lib/conect-front";
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
  const {
    contacts,
    loading,
    loadContactsByUser,
    createNewContact,
    updateContactData,
    deleteContactData,
  } = useContacts(user?.id || null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.USER)) {
      console.log('🔐 UserContactsPage: Access denied - redirecting to home');
      router.push('/');
      return;
    }

    if (user?.role === UserRole.USER) {
      console.log('👥 UserContactsPage: Loading contacts for user');
      loadContactsByUser(user.id);
    }
  }, [user, authLoading, router, loadContactsByUser]);

  // Load contacts is now handled by useContacts hook

  const handleToggleIA = async (contact: Contact) => {
    try {
      if (!user?.id || !contact.id_contac) return;

      await updateContactData(user.id, contact.id_contac, { ia: !contact.ia });
    } catch (error) {
      console.error('❌ UserContactsPage: Failed to toggle IA:', error);
    }
  };

  const handleUpdateWaitingMessages = async (contact: Contact) => {
    try {
      if (!contact.phone) return;

      // Use admin API to update waiting messages
      const { contactsApi } = await import('@/lib/admin-api');
      await contactsApi.updateWaitingMessages(contact.phone);
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
                    <h1 className="text-3xl font-bold">Mis Contactos</h1>
                    <p className="text-muted-foreground">
                      Gestiona tus contactos personales e interacciones de leads (Acceso de Usuario)
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => loadContactsByUser(user?.id || '')}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Actualizar
                  </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Contactos Totales</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{contacts.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Con IA</CardTitle>
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
                      <CardTitle className="text-sm font-medium">Leads Activos</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {contacts.filter(c => c.estado !== 'cerrado' && c.estado !== null).length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
                      <Badge variant="default" className="text-xs">Closed</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {contacts.filter(c => c.estado === 'cerrado' || c.estado === null).length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contacts List */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Mis Contactos</CardTitle>
                    <CardDescription>
                      Gestiona tus contactos personales y su estado de leads.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Cargando contactos...</p>
                      </div>
                    ) : contacts.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No se encontraron contactos</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {contacts.map((contact) => (
                          <Card key={contact.id_contac} className="border">
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
                                      Creado: {contact.fecha ? new Date(contact.fecha).toLocaleDateString() : 'N/A'}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getStateBadge(contact.estado || 'frio')}
                                    {contact.ia && <Badge variant="outline">AI</Badge>}
                                    <Badge variant="secondary">{contact.messageCount} mensajes</Badge>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleIA(contact)}
                                    disabled={!contact.phone}
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
                                    disabled={!contact.phone}
                                  >
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Actualizar Mensajes
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              {contact.lastMessage && (
                                <div className="mt-2 text-sm text-muted-foreground">
                                  Último: {contact.lastMessage.content.substring(0, 100)}
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