"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAdminContacts } from "@/hooks/useAdminContacts";
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
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

export default function AdminContactsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    contacts,
    loading: contactsLoading,
    loadContacts,
    updateContact,
    deleteContact,
    toggleContactIA,
    updateWaitingMessages,
  } = useAdminContacts();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.ADMIN)) {
      router.push('/');
      return;
    }

    if (user?.role === UserRole.ADMIN) {
      loadContacts();
    }
  }, [user, authLoading, router, loadContacts]);

  const handleToggleIA = async (contact: Contact) => {
    await toggleContactIA(contact.phone, !contact.ia);
    loadContacts(); // Reload to get updated data
  };

  const handleUpdateWaitingMessages = async (contact: Contact) => {
    await updateWaitingMessages(contact.phone);
    loadContacts(); // Reload to get updated data
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

  if (authLoading || !user || user.role !== UserRole.ADMIN) {
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">Contact Management</h1>
                    <p className="text-muted-foreground">
                      Manage leads, contacts, and AI interactions (Admin Access - All System Contacts)
                    </p>
                  </div>
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

                {/* Contacts Table */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Contacts</CardTitle>
                    <CardDescription>
                      A list of all contacts with their status and AI settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {contactsLoading ? (
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
                          <Card key={contact.id || contact.id_contac} className="border">
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <div className="font-medium">{contact.nombre_completo}</div>
                                    <div className="text-sm text-muted-foreground">{contact.phone}</div>
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
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this contact?')) {
                                        console.log('Contact object:', contact);
                                        console.log('Contact ID:', contact.id, 'Contact id_contac:', contact.id_contac, 'User ID:', contact.user?.id || user.id);
                                        const contactId = contact.id || contact.id_contac;
                                        if (contactId && contactId !== 'undefined') {
                                          deleteContact(contact.user?.id || user.id, contactId);
                                        } else {
                                          console.error('Contact ID is undefined or invalid');
                                        }
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
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