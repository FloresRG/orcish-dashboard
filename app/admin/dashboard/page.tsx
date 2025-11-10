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
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                      Complete system overview and analytics
                    </p>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    <Zap className="mr-1 h-3 w-3" />
                    Live Data
                  </Badge>
                </div>

                {/* Overview Cards */}
                {overview && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{overview.contacts.totalContacts || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {overview.contacts.activeContacts || 0} active
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">WhatsApp Sessions</CardTitle>
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{overview.whatsapp.totalSessions || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {overview.whatsapp.activeSessions || 0} active
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{overview.messages.totalMessages || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {overview.messages.responseRate || 0}% response rate
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{overview.courses.totalCourses || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {overview.courses.activeCourses || 0} active
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
                        Message Trends (Last 30 Days)
                      </CardTitle>
                      <CardDescription>Daily message volume over time</CardDescription>
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
                            <p>No trend data available</p>
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
                        Contact Growth (Last 30 Days)
                      </CardTitle>
                      <CardDescription>New contacts over time</CardDescription>
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
                            <p>No growth data available</p>
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
                          WhatsApp Overview
                        </CardTitle>
                        <CardDescription>Session and message statistics</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Sessions:</span>
                          <span className="font-medium">{whatsappStats.totalSessions || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Connected:</span>
                          <span className="font-medium text-green-600">{whatsappStats.connectedSessions || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Messages Today:</span>
                          <span className="font-medium">{whatsappStats.messagesToday || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Auto-responses:</span>
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
                          Contact Management
                        </CardTitle>
                        <CardDescription>Lead status distribution</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Contacts:</span>
                          <span className="font-medium">{contactStats.totalContacts || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Active:</span>
                          <span className="font-medium text-green-600">{contactStats.activeContacts || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">With AI:</span>
                          <span className="font-medium">{contactStats.contactsWithIA || 0}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          States: {contactStats.contactsByState ? Object.entries(contactStats.contactsByState).map(([state, count]) => `${state}: ${count}`).join(', ') : 'No state data'}
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
                          Message Analytics
                        </CardTitle>
                        <CardDescription>Communication metrics</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Messages:</span>
                          <span className="font-medium">{messageStats.totalMessages || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Today:</span>
                          <span className="font-medium text-blue-600">{messageStats.messagesToday || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">This Week:</span>
                          <span className="font-medium">{messageStats.messagesThisWeek || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Avg/Day:</span>
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
                        System Health
                      </CardTitle>
                      <CardDescription>Overall system status and performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Badge variant="default">
                          System Online
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Last updated: {overview?.timestamp ? new Date(overview.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
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