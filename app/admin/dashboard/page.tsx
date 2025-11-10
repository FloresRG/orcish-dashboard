"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/auth";
import {
  Users,
  Phone,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Activity,
  BarChart3,
  Zap
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    overview,
    whatsappStats,
    contactStats,
    messageStats,
    courseStats,
    loading: dashboardLoading,
    loadAllStats,
    loadMessageTrends,
    loadContactGrowth,
  } = useAdminDashboard();

  const [messageTrends, setMessageTrends] = useState<Array<{ date: string; count: number }>>([]);
  const [contactGrowth, setContactGrowth] = useState<Array<{ date: string; newContacts: number; totalContacts: number }>>([]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.ADMIN)) {
      router.push('/');
      return;
    }

    if (user?.role === UserRole.ADMIN) {
      loadAllStats();
      // Load chart data with error handling
      loadMessageTrends(30).then(data => {
        if (data && Array.isArray(data)) {
          setMessageTrends(data);
        } else {
          setMessageTrends([]);
        }
      }).catch(() => setMessageTrends([]));

      loadContactGrowth(30).then(data => {
        if (data && Array.isArray(data)) {
          setContactGrowth(data);
        } else {
          setContactGrowth([]);
        }
      }).catch(() => setContactGrowth([]));
    }
  }, [user, authLoading, router, loadAllStats, loadMessageTrends, loadContactGrowth]);

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
                    <h1 className="text-3xl font-bold">Panel de Administración</h1>
                    <p className="text-muted-foreground">
                      Vista completa del sistema y analíticas
                    </p>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    <Zap className="mr-1 h-3 w-3" />
                    Datos en Vivo
                  </Badge>
                </div>

                {/* Overview Cards */}
                {overview && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Contactos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{overview.contacts.totalContacts || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {overview.contacts.activeContacts || 0} activos
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sesiones WhatsApp</CardTitle>
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{overview.whatsapp.totalSessions || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {overview.whatsapp.activeSessions || 0} activas
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Mensajes</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{overview.messages.totalMessages || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {overview.messages.responseRate || 0}% tasa de respuesta
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cursos</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{overview.courses.totalCourses || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {overview.courses.activeCourses || 0} activos
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Charts Section */}
                <div className="grid gap-4 md:grid-cols-2 mt-6">
                  {/* Message Trends Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Tendencias de Mensajes (Últimos 30 Días)
                      </CardTitle>
                      <CardDescription>Volumen diario de mensajes a lo largo del tiempo</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {messageTrends && messageTrends.length > 0 ? (
                        <ChartContainer
                          config={{
                            count: {
                              label: "Messages",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                          className="h-[200px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={messageTrends}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="date"
                                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                              />
                              <YAxis />
                              <ChartTooltip
                                content={<ChartTooltipContent />}
                              />
                              <Area
                                type="monotone"
                                dataKey="count"
                                stroke="hsl(var(--chart-1))"
                                fill="hsl(var(--chart-1))"
                                fillOpacity={0.3}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      ) : (
                        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                          <div className="text-center">
                            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                            <p>No hay datos de tendencias disponibles</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contact Growth Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Crecimiento de Contactos (Últimos 30 Días)
                      </CardTitle>
                      <CardDescription>Nuevos contactos a lo largo del tiempo</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {contactGrowth && contactGrowth.length > 0 ? (
                        <ChartContainer
                          config={{
                            newContacts: {
                              label: "New Contacts",
                              color: "hsl(var(--chart-2))",
                            },
                            totalContacts: {
                              label: "Total Contacts",
                              color: "hsl(var(--chart-3))",
                            },
                          }}
                          className="h-[200px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={contactGrowth}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="date"
                                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                              />
                              <YAxis />
                              <ChartTooltip
                                content={<ChartTooltipContent />}
                              />
                              <Line
                                type="monotone"
                                dataKey="newContacts"
                                stroke="hsl(var(--chart-2))"
                                strokeWidth={2}
                              />
                              <Line
                                type="monotone"
                                dataKey="totalContacts"
                                stroke="hsl(var(--chart-3))"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      ) : (
                        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                          <div className="text-center">
                            <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                            <p>No hay datos de crecimiento disponibles</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
                  {/* WhatsApp Stats */}
                  {whatsappStats && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Phone className="h-5 w-5" />
                          Resumen de WhatsApp
                        </CardTitle>
                        <CardDescription>Estadísticas de sesiones y mensajes</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Sesiones Totales:</span>
                          <span className="font-medium">{whatsappStats.totalSessions || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Conectadas:</span>
                          <span className="font-medium text-green-600">{whatsappStats.connectedSessions || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Mensajes Hoy:</span>
                          <span className="font-medium">{whatsappStats.messagesToday || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Respuestas Automáticas:</span>
                          <span className="font-medium">{whatsappStats.autoResponses || 0}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Contact Stats */}
                  {contactStats && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Gestión de Contactos
                        </CardTitle>
                        <CardDescription>Distribución del estado de leads</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Contactos Totales:</span>
                          <span className="font-medium">{contactStats.totalContacts || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Activos:</span>
                          <span className="font-medium text-green-600">{contactStats.activeContacts || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Con IA:</span>
                          <span className="font-medium">{contactStats.contactsWithIA || 0}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Estados: {contactStats.contactsByState ? Object.entries(contactStats.contactsByState).map(([state, count]) => `${state}: ${count}`).join(', ') : 'Sin datos de estado'}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Message Stats */}
                  {messageStats && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Analíticas de Mensajes
                        </CardTitle>
                        <CardDescription>Métricas de comunicación</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Mensajes Totales:</span>
                          <span className="font-medium">{messageStats.totalMessages || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Hoy:</span>
                          <span className="font-medium text-blue-600">{messageStats.messagesToday || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Esta Semana:</span>
                          <span className="font-medium">{messageStats.messagesThisWeek || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Prom/Día:</span>
                          <span className="font-medium">{messageStats.averageMessagesPerDay || 0}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* System Health */}
                <div className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Salud del Sistema
                      </CardTitle>
                      <CardDescription>Estado general del sistema y rendimiento</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Badge variant="default">
                          Sistema En Línea
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Última actualización: {overview?.timestamp ? new Date(overview.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}