"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAdminContacts } from "@/hooks/useAdminContacts";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ToggleRight,
  Search,
  ChevronLeft,
  ChevronRight
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
    getContactMessages,
    getContactMessagesByPhone,
  } = useAdminContacts();

  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    if (!contact.phone) return;
    await toggleContactIA(contact.phone, !contact.ia);
    loadContacts(); // Reload to get updated data
  };

  const handleUpdateWaitingMessages = async (contact: Contact) => {
    if (!contact.phone) return;
    await updateWaitingMessages(contact.phone);
    loadContacts(); // Reload to get updated data
  };

  // Filter and paginate contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact =>
      (contact.nombre_completo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredContacts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredContacts, currentPage, itemsPerPage]);

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

                {/* Search Bar */}
                <div className="flex items-center gap-4 mt-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, teléfono o usuario..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
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
                      <div className="text-2xl font-bold">{filteredContacts.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {searchTerm && `de ${contacts.length} totales`}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">With AI</CardTitle>
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {filteredContacts.filter(c => c.ia).length}
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
                        {filteredContacts.filter(c => c.estado !== 'cerrado' && c.estado !== null).length}
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
                        {filteredContacts.filter(c => c.estado === 'cerrado' || c.estado === null).length}
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
                    ) : filteredContacts.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {searchTerm ? 'No se encontraron contactos con ese criterio de búsqueda' : 'No contacts found'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {paginatedContacts.map((contact) => (
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
                                    {getStateBadge(contact.estado || 'frio')}
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
                                    onClick={async () => {
                                      if (confirm('Are you sure you want to delete this contact?')) {
                                        console.log('Contact object:', contact);
                                        console.log('Contact ID:', contact.id, 'Contact id_contac:', contact.id_contac, 'User ID:', contact.user?.id || user.id);
                                        const contactId = contact.id || contact.id_contac;
                                        if (contactId && contactId !== 'undefined') {
                                          try {
                                            await deleteContact(contact.user?.id || user.id, contactId);
                                            // Reload contacts after successful deletion
                                            loadContacts();
                                          } catch (error) {
                                            console.error('Failed to delete contact:', error);
                                          }
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-muted-foreground">
                          Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredContacts.length)} de {filteredContacts.length} contactos
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                              if (pageNum > totalPages) return null;
                              return (
                                <Button
                                  key={pageNum}
                                  variant={currentPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(pageNum)}
                                  className="w-8 h-8 p-0"
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Siguiente
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
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