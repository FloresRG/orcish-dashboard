"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useGuestCourses } from "@/hooks/useGuestCourses";
import { useGuestAI } from "@/hooks/useGuestAI";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserRole } from "@/types/auth";
import { RAGQueryRequest } from "@/types/admin";
import { BookOpen, Bot, MessageSquare, RefreshCw, Send } from "lucide-react";

export default function GuestCoursesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { courses, loading: coursesLoading, loadCourses, getCourse } = useGuestCourses();
  const { loading: aiLoading, ragQuery } = useGuestAI();

  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<{ id: number; fullname: string; shortname: string; descripcion?: string; summary: string; estado: string; createdAt: string } | null>(null);

  useEffect(() => {
    console.log('📚 GuestCoursesPage: Loading courses for guest');
    loadCourses();
  }, [loadCourses]);

  const handleViewCourse = async (courseId: string) => {
    try {
      console.log('📚 GuestCoursesPage: Viewing course details:', courseId);
      const courseDetails = await getCourse(courseId);
      console.log('📚 GuestCoursesPage: Course details:', courseDetails);
      setSelectedCourse(courseDetails);
    } catch (error) {
      console.error('❌ GuestCoursesPage: Failed to get course details:', error);
    }
  };

  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;

    try {
      console.log('🤖 GuestCoursesPage: Making AI query:', aiQuery);
      const request: RAGQueryRequest = {
        query: aiQuery,
        conversation_history: [],
        max_documents: 5
      };

      const response = await ragQuery(request);
      console.log('🤖 GuestCoursesPage: AI response:', response);
      setAiResponse(response.answer);
    } catch (error) {
      console.error('❌ GuestCoursesPage: AI query failed:', error);
      setAiResponse("Sorry, I couldn't process your query right now. Please try again later.");
    }
  };

  // Allow access for guests (no authentication required for basic course viewing)
  const isGuestOrUser = !authLoading && (!user || user.role === UserRole.GUEST || user.role === UserRole.USER);

  if (authLoading) {
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
      <AppSidebar user={user || undefined} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">Cursos Disponibles</h1>
                    <p className="text-muted-foreground">
                      Explora nuestras ofertas educativas (Acceso de Invitado)
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => loadCourses()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Actualizar
                  </Button>
                </div>

                {/* AI Assistant */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      Asistente de Cursos IA
                    </CardTitle>
                    <CardDescription>
                      Haz preguntas sobre nuestros cursos y obtén respuestas instantáneas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="ai-query">Pregunta sobre cursos</Label>
                      <div className="flex gap-2">
                        <Input
                          id="ai-query"
                          placeholder="ej., ¿Qué cursos de Python tienes?"
                          value={aiQuery}
                          onChange={(e) => setAiQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAIQuery()}
                        />
                        <Button onClick={handleAIQuery} disabled={aiLoading || !aiQuery.trim()}>
                          {aiLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {aiResponse && (
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Bot className="h-5 w-5 mt-0.5 text-primary" />
                          <div>
                            <p className="text-sm font-medium mb-1">Asistente IA</p>
                            <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Courses Grid */}
                {coursesLoading ? (
                  <div className="flex items-center justify-center py-12 mt-6">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Cargando cursos...</p>
                    </div>
                  </div>
                ) : courses.length === 0 ? (
                  <Card className="mt-6">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No hay cursos disponibles</h3>
                      <p className="text-muted-foreground text-center">
                        Actualmente no hay cursos disponibles. Por favor, vuelve a revisar más tarde.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                      <Card key={course.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg line-clamp-2">
                                {course.fullname}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {course.shortname}
                              </CardDescription>
                            </div>
                            <Badge variant={course.estado === 'activo' ? 'default' : 'secondary'}>
                              {course.estado}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {course.descripcion || course.summary}
                          </p>

                          <div className="flex gap-2">
                            <Button
                              className="flex-1"
                              onClick={() => handleViewCourse(course.id.toString())}
                            >
                              Ver Detalles
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => router.push('/login')}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Creado: {new Date(course.createdAt).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Course Details Modal */}
                {selectedCourse && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>{selectedCourse.fullname}</CardTitle>
                      <CardDescription>{selectedCourse.shortname}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Descripción</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedCourse.descripcion || selectedCourse.summary}
                        </p>
                      </div>

                      <div className="flex gap-4">
                        <Badge variant={selectedCourse.estado === 'activo' ? 'default' : 'secondary'}>
                          {selectedCourse.estado}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Creado: {new Date(selectedCourse.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => setSelectedCourse(null)} variant="outline">
                          Cerrar
                        </Button>
                        <Button onClick={() => router.push('/login')}>
                          Registrarse para Acceder
                        </Button>
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