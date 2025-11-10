"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserDashboard } from "@/hooks/useUserDashboard";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/types/auth";
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Phone,
  BookOpen,
  Bot,
  Calendar,
  Download,
  RefreshCw
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

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    loading: analyticsLoading,
    loadMessageTrends,
    loadContactGrowth,
    loadSessionActivity,
    loadPerformanceMetrics,
    loadDashboardCards,
    loadMessageDistribution,
    loadLeadsFunnel,
    loadAllStats,
  } = useUserDashboard();

  const [analytics, setAnalytics] = useState<any>(null);

  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.ADMIN)) {
      router.push('/');
      return;
    }

    if (user?.role === UserRole.ADMIN) {
      loadAllStats();
    }
  }, [user, authLoading, router, loadAllStats]);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    // Reload analytics with new time range
    loadAllStats();
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
                    <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                    <p className="text-muted-foreground">
                      Comprehensive analytics and insights for your system
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button onClick={loadAllStats}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics?.messageStats?.totalMessages || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +{analytics?.messageStats?.messagesToday || 0} today
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Contacts</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics?.contactStats?.activeContacts || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        of {analytics?.contactStats?.totalContacts || 0} total
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">WhatsApp Sessions</CardTitle>
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics?.whatsappStats?.connectedSessions || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        of {analytics?.whatsappStats?.totalSessions || 0} active
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics?.contactStats?.contactsWithIA || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        contacts with AI enabled
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Section */}
                <div className="grid gap-4 md:grid-cols-2 mt-6">
                  {/* Message Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Message Trends
                      </CardTitle>
                      <CardDescription>
                        Message volume over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analytics?.messageTrends && analytics.messageTrends.length > 0 ? (
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
                            <AreaChart data={analytics.messageTrends}>
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

                  {/* Contact Growth */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Contact Growth
                      </CardTitle>
                      <CardDescription>
                        New contacts over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analytics?.contactGrowth && analytics.contactGrowth.length > 0 ? (
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
                            <LineChart data={analytics.contactGrowth}>
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

                {/* Detailed Analytics */}
                <div className="grid gap-4 md:grid-cols-3 mt-6">
                  {/* Message Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Message Distribution</CardTitle>
                      <CardDescription>Private vs Group messages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" onClick={loadMessageDistribution}>
                        Load Distribution
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Leads Funnel */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Leads Funnel</CardTitle>
                      <CardDescription>Contact conversion stages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" onClick={loadLeadsFunnel}>
                        Load Funnel
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Session Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Session Activity</CardTitle>
                      <CardDescription>WhatsApp session performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" onClick={() => loadSessionActivity(parseInt(timeRange))}>
                        Load Activity
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Metrics */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      System Performance
                    </CardTitle>
                    <CardDescription>
                      API response times, database performance, and system metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" onClick={loadPerformanceMetrics}>
                      Load Performance Metrics
                    </Button>
                  </CardContent>
                </Card>

                {/* Contact State Distribution */}
                {analytics?.contactStats?.contactsByState && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Contact States</CardTitle>
                      <CardDescription>
                        Distribution of contacts by their current state
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                        {analytics?.contactStats?.contactsByState ? Object.entries(analytics.contactStats.contactsByState).map(([state, count]) => (
                          <div key={state} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <div className="font-medium capitalize">{state}</div>
                              <div className="text-sm text-muted-foreground">{String(count)} contacts</div>
                            </div>
                            <Badge variant="outline">{String(count)}</Badge>
                          </div>
                        )) : (
                          <div className="text-center py-4 text-muted-foreground">
                            No contact state data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}