"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserCourses } from "@/hooks/useUserCourses";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/auth";
import { Course } from "@/types/admin";
import { BookOpen, Clock, DollarSign, Users, RefreshCw } from "lucide-react";

export default function UserCoursesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { courses, loading: coursesLoading, loadCourses, getCourse } = useUserCourses();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.USER)) {
      console.log('🔐 UserCoursesPage: Access denied - redirecting to home');
      router.push('/');
      return;
    }

    if (user?.role === UserRole.USER) {
      console.log('📚 UserCoursesPage: Loading courses for user');
      loadCourses();
    }
  }, [user, authLoading, router, loadCourses]);

  const handleViewCourse = async (courseId: string) => {
    try {
      console.log('📚 UserCoursesPage: Viewing course details:', courseId);
      const courseDetails = await getCourse(courseId);
      console.log('📚 UserCoursesPage: Course details:', courseDetails);
      // Here you could open a modal or navigate to a detailed view
    } catch (error) {
      console.error('❌ UserCoursesPage: Failed to get course details:', error);
    }
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
                    <h1 className="text-3xl font-bold">Cursos Disponibles</h1>
                    <p className="text-muted-foreground">
                      Explora y accede a contenido educativo (Acceso de Usuario)
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => loadCourses()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Actualizar
                  </Button>
                </div>

                {coursesLoading ? (
                  <div className="flex items-center justify-center py-12">
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

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {/* Course info will be displayed here when available */}
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>Duración: Por definir</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>Precio: Contactar</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              className="flex-1"
                              onClick={() => handleViewCourse(course.id)}
                            >
                              Ver Detalles
                            </Button>
                            {course.estado === 'activo' && (
                              <Button variant="outline" size="sm">
                                <Users className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Creado: {new Date(course.createdAt).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}