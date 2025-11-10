"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCourses } from "@/hooks/useAdminCourses";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/auth";
import { Course } from "@/types/admin";
import {
  BookOpen,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function AdminCoursesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    courses,
    loading: coursesLoading,
    loadCourses,
    syncCourses,
    updateCourse,
    deleteCourse,
  } = useAdminCourses();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.ADMIN)) {
      router.push('/');
      return;
    }

    if (user?.role === UserRole.ADMIN) {
      loadCourses();
    }
  }, [user, authLoading, router, loadCourses]);

  const handleSyncCourses = async () => {
    await syncCourses();
    loadCourses(); // Reload courses
  };

  const getStateBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      activo: "default",
      inactivo: "secondary",
      borrador: "outline"
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
                    <h1 className="text-3xl font-bold">Course Management</h1>
                    <p className="text-muted-foreground">
                      Manage courses from Moodle platform
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSyncCourses} variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Courses
                    </Button>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Course
                    </Button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{courses.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {courses.filter(c => c.estado === 'activo').length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Inactive Courses</CardTitle>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {courses.filter(c => c.estado === 'inactivo').length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Draft Courses</CardTitle>
                      <Badge variant="outline" className="text-xs">Draft</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {courses.filter(c => c.estado === 'borrador').length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Courses Table */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Courses</CardTitle>
                    <CardDescription>
                      A list of all courses with their status and information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {coursesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Loading courses...</p>
                      </div>
                    ) : courses.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No courses found</p>
                        <Button onClick={handleSyncCourses} className="mt-4">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync from Moodle
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {courses.map((course) => (
                          <Card key={course.id} className="border">
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <div className="font-medium">{course.fullname}</div>
                                    <div className="text-sm text-muted-foreground">{course.shortname}</div>
                                    <div className="text-xs text-muted-foreground">
                                      ID: {course.idnumber} | Created: {new Date(course.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getStateBadge(course.estado)}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this course?')) {
                                        deleteCourse(course.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              {course.summary && (
                                <div className="mt-2 text-sm text-muted-foreground">
                                  {course.summary.substring(0, 200)}
                                  {course.summary.length > 200 && '...'}
                                </div>
                              )}
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