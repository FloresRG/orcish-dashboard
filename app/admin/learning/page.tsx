"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAdminLearning } from "@/hooks/useAdminLearning";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { UserRole } from "@/types/auth";
import { LearningContent, CreateLearningContentRequest } from "@/types/admin";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";

export default function AdminLearningPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    learningContent,
    loading: learningLoading,
    loadLearningContent,
    createLearningContent,
    updateLearningContent,
    deleteLearningContent,
  } = useAdminLearning();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [editingContent, setEditingContent] = useState<LearningContent | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.ADMIN)) {
      router.push('/');
      return;
    }

    if (user?.role === UserRole.ADMIN) {
      loadLearningContent();
    }
  }, [user, authLoading, router, loadLearningContent]);

  const handleCreateContent = async () => {
    if (!newContent.trim()) return;

    const request: CreateLearningContentRequest = {
      content: newContent.trim(),
      estado: 'activo'
    };

    await createLearningContent(request);
    setNewContent("");
    setShowCreateForm(false);
    loadLearningContent(); // Reload content
  };

  const handleUpdateContent = async (content: LearningContent) => {
    if (!editingContent) return;

    await updateLearningContent(content.id, {
      content: editingContent.content,
      estado: content.estado
    });

    setEditingContent(null);
    loadLearningContent(); // Reload content
  };

  const getStateBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      activo: "default",
      inactivo: "secondary"
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
                    <h1 className="text-3xl font-bold">Learning Content Management</h1>
                    <p className="text-muted-foreground">
                      Manage AI learning content and knowledge base
                    </p>
                  </div>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Content
                  </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{learningContent.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Content</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {learningContent.filter(c => c.estado === 'activo').length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Inactive Content</CardTitle>
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {learningContent.filter(c => c.estado === 'inactivo').length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                      <Badge variant="outline" className="text-xs">Recent</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {learningContent.length > 0
                          ? new Date(Math.max(...learningContent.map(c => new Date(c.updatedAt).getTime()))).toLocaleDateString()
                          : 'No content'
                        }
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Create Content Form */}
                {showCreateForm && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Add New Learning Content</CardTitle>
                      <CardDescription>
                        Add content that will be used by the AI system for learning and responses.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="Enter learning content..."
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        rows={6}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleCreateContent} disabled={!newContent.trim()}>
                          Create Content
                        </Button>
                        <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Learning Content List */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Learning Content</CardTitle>
                    <CardDescription>
                      A list of all learning content used by the AI system.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {learningLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Loading content...</p>
                      </div>
                    ) : learningContent.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No learning content found</p>
                        <Button onClick={() => setShowCreateForm(true)} className="mt-4">
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Content
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {learningContent.map((content) => (
                          <Card key={content.id} className="border">
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getStateBadge(content.estado)}
                                  <span className="text-xs text-muted-foreground">
                                    Created: {new Date(content.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingContent(content)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this content?')) {
                                        deleteLearningContent(content.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="text-sm">
                                {editingContent?.id === content.id ? (
                                  <div className="space-y-2">
                                    <Textarea
                                      value={editingContent.content}
                                      onChange={(e) => setEditingContent(prev => prev ? {...prev, content: e.target.value} : null)}
                                      rows={4}
                                    />
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => handleUpdateContent(content)}>
                                        Save
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => setEditingContent(null)}>
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="whitespace-pre-wrap">
                                    {content.content.substring(0, 300)}
                                    {content.content.length > 300 && '...'}
                                  </div>
                                )}
                              </div>
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