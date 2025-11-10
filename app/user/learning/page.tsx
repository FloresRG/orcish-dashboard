"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserLearning } from "@/hooks/useUserLearning";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/auth";
import { LearningContent } from "@/types/admin";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  Calendar
} from "lucide-react";

export default function UserLearningPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    learningContent,
    loading: learningLoading,
    loadLearningContent,
    createLearningContent,
    updateLearningContent,
    deleteLearningContent,
  } = useUserLearning();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingContent, setEditingContent] = useState<LearningContent | null>(null);
  const [formData, setFormData] = useState({
    content: "",
    estado: "activo" as "activo" | "inactivo"
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.USER)) {
      console.log('🔐 UserLearningPage: Access denied - redirecting to home');
      router.push('/');
      return;
    }

    if (user?.role === UserRole.USER) {
      console.log('📚 UserLearningPage: Loading learning content for user');
      loadLearningContent();
    }
  }, [user, authLoading, router, loadLearningContent]);

  const handleCreate = async () => {
    if (!formData.content.trim()) return;

    try {
      console.log('📚 UserLearningPage: Creating learning content');
      await createLearningContent(formData);
      setFormData({ content: "", estado: "activo" });
      setShowCreateForm(false);
    } catch (error) {
      console.error('❌ UserLearningPage: Failed to create learning content:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingContent || !formData.content.trim()) return;

    try {
      console.log('📚 UserLearningPage: Updating learning content:', editingContent.id);
      await updateLearningContent(editingContent.id, formData);
      setEditingContent(null);
      setFormData({ content: "", estado: "activo" });
    } catch (error) {
      console.error('❌ UserLearningPage: Failed to update learning content:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this learning content?')) return;

    try {
      console.log('📚 UserLearningPage: Deleting learning content:', id);
      await deleteLearningContent(id);
    } catch (error) {
      console.error('❌ UserLearningPage: Failed to delete learning content:', error);
    }
  };

  const startEdit = (content: LearningContent) => {
    setEditingContent(content);
    setFormData({
      content: content.content,
      estado: content.estado as "activo" | "inactivo"
    });
  };

  const cancelEdit = () => {
    setEditingContent(null);
    setFormData({ content: "", estado: "activo" });
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
                    <h1 className="text-3xl font-bold">Learning Content</h1>
                    <p className="text-muted-foreground">
                      Create and manage your educational materials
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => loadLearningContent()}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Content
                    </Button>
                  </div>
                </div>

                {/* Create/Edit Form */}
                {(showCreateForm || editingContent) && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>
                        {editingContent ? 'Edit Learning Content' : 'Create New Learning Content'}
                      </CardTitle>
                      <CardDescription>
                        {editingContent ? 'Update your educational material' : 'Add new content to your learning library'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          placeholder="Enter your learning content here..."
                          value={formData.content}
                          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                          rows={6}
                        />
                      </div>
                      <div>
                        <Label htmlFor="estado">Status</Label>
                        <select
                          id="estado"
                          value={formData.estado}
                          onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as "activo" | "inactivo" }))}
                          className="w-full px-3 py-2 border border-input bg-background rounded-md"
                        >
                          <option value="activo">Active</option>
                          <option value="inactivo">Inactive</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={editingContent ? handleUpdate : handleCreate}>
                          {editingContent ? 'Update' : 'Create'} Content
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setShowCreateForm(false);
                          cancelEdit();
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Learning Content List */}
                {learningLoading ? (
                  <div className="flex items-center justify-center py-12 mt-6">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Loading learning content...</p>
                    </div>
                  </div>
                ) : learningContent.length === 0 ? (
                  <Card className="mt-6">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No learning content yet</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        Start building your educational library by adding your first content.
                      </p>
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Content
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                    {learningContent.map((content) => (
                      <Card key={content.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg line-clamp-2 flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Learning Content
                              </CardTitle>
                              <CardDescription className="mt-1">
                                <Badge variant={content.estado === 'activo' ? 'default' : 'secondary'}>
                                  {content.estado}
                                </Badge>
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground line-clamp-4">
                            {content.content}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Created: {new Date(content.createdAt).toLocaleDateString()}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(content)}
                              className="flex-1"
                            >
                              <Edit className="mr-2 h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(content.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Statistics */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Learning Statistics</CardTitle>
                    <CardDescription>Overview of your educational content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{learningContent.length}</div>
                        <div className="text-sm text-muted-foreground">Total Content</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {learningContent.filter(c => c.estado === 'activo').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Active</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {learningContent.filter(c => c.estado === 'inactivo').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Inactive</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {learningContent.length > 0 ?
                            Math.round((learningContent.filter(c => c.estado === 'activo').length / learningContent.length) * 100) : 0
                          }%
                        </div>
                        <div className="text-sm text-muted-foreground">Active Rate</div>
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