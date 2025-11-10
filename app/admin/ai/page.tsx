"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAI } from "@/hooks/useAdminAI";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserRole } from "@/types/auth";
import { OllamaModel, AIMetrics } from "@/types/admin";
import {
  Bot,
  MessageSquare,
  Database,
  Settings,
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap
} from "lucide-react";

export default function AdminAIPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    models,
    metrics,
    loading: aiLoading,
    loadModels,
    loadMetrics,
    ragQuery,
    createVectorDB,
    verifyVectorDB,
    checkHealth,
  } = useAdminAI();

  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [vectorDBStatus, setVectorDBStatus] = useState<boolean | null>(null);
  const [healthStatus, setHealthStatus] = useState<boolean | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.ADMIN)) {
      router.push('/');
      return;
    }

    if (user?.role === UserRole.ADMIN) {
      loadModels();
      loadMetrics();
      checkVectorDB();
      performHealthCheck();
    }
  }, [user, authLoading, router, loadModels, loadMetrics]);

  const checkVectorDB = async () => {
    try {
      const result = await verifyVectorDB();
      setVectorDBStatus(result.valid);
    } catch (error) {
      setVectorDBStatus(false);
    }
  };

  const performHealthCheck = async () => {
    try {
      await checkHealth();
      setHealthStatus(true);
    } catch (error) {
      setHealthStatus(false);
    }
  };

  const handleRAGQuery = async () => {
    if (!query.trim()) return;

    try {
      const result = await ragQuery({
        query: query.trim(),
        conversation_history: []
      });
      setResponse(result.answer);
    } catch (error) {
      setResponse("Error: Failed to get response from AI system");
    }
  };

  const handleCreateVectorDB = async () => {
    try {
      await createVectorDB();
      await checkVectorDB();
    } catch (error) {
      console.error("Failed to create vector DB:", error);
    }
  };

  const getHealthBadge = (status: boolean | null) => {
    if (status === null) return <Badge variant="secondary">Checking...</Badge>;
    return status ? (
      <Badge variant="default" className="bg-green-500">
        <CheckCircle className="w-3 h-3 mr-1" />
        Healthy
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Unhealthy
      </Badge>
    );
  };

  const getVectorDBBadge = (status: boolean | null) => {
    if (status === null) return <Badge variant="secondary">Checking...</Badge>;
    return status ? (
      <Badge variant="default" className="bg-green-500">
        <CheckCircle className="w-3 h-3 mr-1" />
        Ready
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Not Ready
      </Badge>
    );
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
                    <h1 className="text-3xl font-bold">AI System Management</h1>
                    <p className="text-muted-foreground">
                      Monitor and manage AI models, RAG system, and vector database
                    </p>
                  </div>
                </div>

                {/* System Status Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">AI Health</CardTitle>
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {getHealthBadge(healthStatus)}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Vector DB</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      {getVectorDBBadge(vectorDBStatus)}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Models</CardTitle>
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{models.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Queries Today</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metrics?.total_queries || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Vector Database Management */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Vector Database Management
                    </CardTitle>
                    <CardDescription>
                      Manage the vector database for RAG (Retrieval-Augmented Generation) system
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Vector Database Status</div>
                        <div className="text-sm text-muted-foreground">
                          Required for AI queries and responses
                        </div>
                      </div>
                      {getVectorDBBadge(vectorDBStatus)}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={checkVectorDB} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Check Status
                      </Button>
                      {!vectorDBStatus && (
                        <Button onClick={handleCreateVectorDB}>
                          <Database className="mr-2 h-4 w-4" />
                          Create Vector DB
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Models */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      Available AI Models
                    </CardTitle>
                    <CardDescription>
                      Models available in the Ollama system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {aiLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Loading models...</p>
                      </div>
                    ) : models.length === 0 ? (
                      <div className="text-center py-8">
                        <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No models found</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {models.map((model) => (
                          <Card key={model.name} className="border">
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{model.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Size: {(model.size / 1024 / 1024 / 1024).toFixed(2)} GB
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Modified: {new Date(model.modified_at).toLocaleDateString()}
                                  </div>
                                </div>
                                <Badge variant="outline">Ollama</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* RAG Query Testing */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Test RAG System
                    </CardTitle>
                    <CardDescription>
                      Test the Retrieval-Augmented Generation system with queries
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Input
                        placeholder="Enter your query..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleRAGQuery} disabled={!query.trim()}>
                      <Play className="mr-2 h-4 w-4" />
                      Test Query
                    </Button>
                    {response && (
                      <div className="mt-4">
                        <div className="font-medium mb-2">Response:</div>
                        <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                          {response}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Metrics */}
                {metrics && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        AI System Metrics
                      </CardTitle>
                      <CardDescription>
                        Performance and usage statistics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{metrics.total_queries}</div>
                          <div className="text-sm text-muted-foreground">Total Queries</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{metrics.successful_queries}</div>
                          <div className="text-sm text-muted-foreground">Successful</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {metrics.average_response_time.toFixed(2)}s
                          </div>
                          <div className="text-sm text-muted-foreground">Avg Response Time</div>
                        </div>
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