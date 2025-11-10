"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserDashboard } from "@/hooks/useUserDashboard";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/auth";
import {
  MessageSquare,
  Phone,
  Users,
  BookOpen,
  TrendingUp,
  Activity,
  Zap,
  BarChart3,
  Calendar,
  Clock
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function UserDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    loading: dashboardLoading,
    overview,
    loadAllStats,
    loadMessageTrends,
    loadContactGrowth,
  } = useUserDashboard();

  const [messageTrends, setMessageTrends] = useState<Array<{ date: string; count: number }>>([]);
  const [contactGrowth, setContactGrowth] = useState<Array<{ date: string; newContacts: number; totalContacts: number }>>([]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.USER)) {
      router.push('/');
      return;
    }

    if (user?.role === UserRole.USER) {
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
                    <h1 className="text-3xl font-bold">Mi Panel de Control</h1>
                    <p className="text-muted-foreground">
                      ¡Bienvenido de vuelta, {user.name}! Aquí tienes tu vista general personal.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    <Zap className="mr-1 h-3 w-3" />
                    Panel Personal
                  </Badge>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/whatsapp')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Administrar</div>
                      <p className="text-xs text-muted-foreground">
                        Tus sesiones de WhatsApp
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/Mensajes')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Chat</div>
                      <p className="text-xs text-muted-foreground">
                        Enviar y recibir mensajes
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/courses')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Cursos</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Aprender</div>
                      <p className="text-xs text-muted-foreground">
                        Accede a tus cursos
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/profile')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Perfil</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Configuración</div>
                      <p className="text-xs text-muted-foreground">
                        Gestiona tu cuenta
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Personal Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Mis Mensajes
                      </CardTitle>
                      <CardDescription>Tu actividad de mensajería</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Enviados:</span>
                        <span className="font-medium">{overview?.messages.outgoingMessages || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Recibidos:</span>
                        <span className="font-medium">{overview?.messages.incomingMessages || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Esta Semana:</span>
                        <span className="font-medium text-blue-600">{overview?.messages.messagesLast7Days || 0}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Mis Contactos
                      </CardTitle>
                      <CardDescription>Personas con las que te has conectado</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Contactos Totales:</span>
                        <span className="font-medium">{overview?.contacts.totalContacts || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Activos:</span>
                        <span className="font-medium text-green-600">{overview?.contacts.activeContacts || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Registrados:</span>
                        <span className="font-medium">{overview?.contacts.registeredContacts || 0}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Mi Aprendizaje
                      </CardTitle>
                      <CardDescription>Tu progreso en cursos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Cursos Totales:</span>
                        <span className="font-medium">{overview?.courses.totalCourses || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Activos:</span>
                        <span className="font-medium text-green-600">{overview?.courses.activeCourses || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Contenido de Aprendizaje:</span>
                        <span className="font-medium text-blue-600">{overview?.courses.totalLearningContent || 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Message Trends Chart */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Mi Actividad de Mensajes (Últimos 30 Días)
                    </CardTitle>
                    <CardDescription>Tus patrones de mensajería a lo largo del tiempo</CardDescription>
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
                          <p>Aún no hay datos de mensajes disponibles</p>
                          <p className="text-sm">¡Comienza a chatear para ver tu actividad!</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Actividad Reciente
                    </CardTitle>
                    <CardDescription>Tus últimas interacciones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">¡Bienvenido a tu panel de control!</p>
                          <p className="text-xs text-muted-foreground">Aquí verás las actualizaciones de tu actividad</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <Clock className="inline h-3 w-3 mr-1" />
                          Just now
                        </div>
                      </div>
                      <div className="text-center py-4 text-muted-foreground">
                        <Calendar className="h-8 w-8 mx-auto mb-2" />
                        <p>Aún no hay actividad reciente</p>
                        <p className="text-sm">Tus interacciones aparecerán aquí</p>
                      </div>
                    </div>
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
