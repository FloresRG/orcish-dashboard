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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/types/auth";
import { Course, CreateCourseRequest, UpdateCourseRequest } from "@/types/admin";
import {
  BookOpen,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Save,
  X
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// Esquemas de validación con Zod
const courseSchema = z.object({
  fullname: z.string().min(1, "El nombre completo es requerido"),
  shortname: z.string().min(1, "El nombre corto es requerido"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  carga_horaria: z.number().min(1, "La carga horaria debe ser mayor a 0"),
  fecha_inicio: z.string().optional(),
  fecha_limite_inscripcion: z.string().optional(),
  banner: z.string().url("La URL del banner debe ser válida").optional().or(z.literal("")),
  pdf: z.string().url("La URL del PDF debe ser válida").optional().or(z.literal("")),
  celular_referencia: z.string().min(1, "El teléfono de referencia es requerido"),
  inversion: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  descuento: z.number().min(0, "El descuento debe ser mayor o igual a 0").max(100, "El descuento no puede ser mayor al 100%"),
  fecha_inicio_descuento: z.string().optional(),
  fecha_fin_descuento: z.string().optional(),
  pago_qr: z.string().url("La URL del QR debe ser válida").optional().or(z.literal("")),
  pago_qr_descuento: z.string().url("La URL del QR de descuento debe ser válida").optional().or(z.literal("")),
  link_formulario: z.string().url("La URL del formulario debe ser válida").optional().or(z.literal("")),
  dias: z.array(z.string()).optional(),
  sesiones: z.array(z.string()).optional(),
  horarios: z.array(z.string()).optional(),
  links_pdf: z.string().url("La URL del PDF debe ser válida").optional().or(z.literal("")),
  duracion_del_curso: z.string().optional(),
  estado: z.enum(['activo', 'inactivo'])
});

const createCourseSchema = z.object({
  fullname: z.string().min(1, "El nombre completo es requerido"),
  shortname: z.string().min(1, "El nombre corto es requerido"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  carga_horaria: z.number().min(1, "La carga horaria debe ser mayor a 0"),
  celular_referencia: z.string().min(1, "El teléfono de referencia es requerido"),
  inversion: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  descuento: z.number().min(0, "El descuento debe ser mayor o igual a 0").max(100, "El descuento no puede ser mayor al 100%"),
  estado: z.enum(['activo', 'inactivo'])
});

const updateCourseSchema = courseSchema.partial();

export default function AdminCoursesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    courses,
    loading: coursesLoading,
    loadCourses,
    syncCourses,
    createCourse,
    updateCourse,
    patchCourse,
    deleteCourse,
  } = useAdminCourses();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<Partial<CreateCourseRequest>>({
    fullname: '',
    shortname: '',
    descripcion: '',
    carga_horaria: 0,
    inversion: 0,
    descuento: 0,
    celular_referencia: '',
    estado: 'activo'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    try {
      const result = await syncCourses();
      toast.success(`✅ ${result.message || "Cursos sincronizados exitosamente"}`);
    } catch (error) {
      console.error('Error syncing courses:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`❌ Error al sincronizar cursos: ${errorMessage}`);
    }
  };

  const handleCreateCourse = async () => {
    try {
      // Convertir strings a números antes de validar
      const dataToValidate = {
        ...formData,
        carga_horaria: formData.carga_horaria ? Number(formData.carga_horaria) : 0,
        inversion: formData.inversion ? Number(formData.inversion) : 0,
        descuento: formData.descuento ? Number(formData.descuento) : 0,
      };

      // Validar datos con Zod
      const validatedData = createCourseSchema.parse(dataToValidate);
      // Agregar campos requeridos que faltan
      const courseData: CreateCourseRequest = {
        ...validatedData,
        fecha_inicio: '',
        fecha_limite_inscripcion: '',
        banner: ''
      };
      await createCourse(courseData);
      setShowCreateDialog(false);
      resetForm();
      toast.success("✅ Curso creado exitosamente");
    } catch (error) {
      console.error('Error creating course:', error);
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(errors);
        toast.error("❌ Por favor, corrige los errores en el formulario");
      } else {
        // Manejar errores del servidor/API
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        toast.error(`❌ Error al crear el curso: ${errorMessage}`);
      }
    }
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      fullname: course.fullname || '',
      shortname: course.shortname || '',
      descripcion: course.descripcion || '',
      carga_horaria: course.carga_horaria || 0,
      fecha_inicio: course.fecha_inicio || '',
      fecha_limite_inscripcion: course.fecha_limite_inscripcion || '',
      banner: course.banner || '',
      pdf: course.pdf || '',
      celular_referencia: course.celular_referencia || '',
      inversion: course.inversion || 0,
      descuento: course.descuento || 0,
      fecha_inicio_descuento: course.fecha_inicio_descuento || '',
      fecha_fin_descuento: course.fecha_fin_descuento || '',
      pago_qr: course.pago_qr || '',
      pago_qr_descuento: course.pago_qr_descuento || '',
      link_formulario: course.link_formulario || '',
      dias: course.dias || [],
      sesiones: course.sesiones || [],
      horarios: course.horarios || [],
      links_pdf: course.links_pdf || '',
      duracion_del_curso: course.duracion_del_curso || '',
      estado: course.estado || 'activo'
    });
    setFormErrors({});
    setShowEditDialog(true);
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return;
    try {
      // Convertir strings a números antes de validar
      const dataToValidate = {
        ...formData,
        carga_horaria: formData.carga_horaria ? Number(formData.carga_horaria) : 0,
        inversion: formData.inversion ? Number(formData.inversion) : 0,
        descuento: formData.descuento ? Number(formData.descuento) : 0,
      };

      // Validar datos con Zod para actualización
      const validatedData = updateCourseSchema.parse(dataToValidate);
      await updateCourse(selectedCourse.id, validatedData);
      setShowEditDialog(false);
      setSelectedCourse(null);
      resetForm();
      toast.success("✅ Curso actualizado exitosamente");
    } catch (error) {
      console.error('Error updating course:', error);
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(errors);
        toast.error("❌ Por favor, corrige los errores en el formulario");
      } else {
        // Manejar errores del servidor/API
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        toast.error(`❌ Error al actualizar el curso: ${errorMessage}`);
      }
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.')) return;
    try {
      await deleteCourse(courseId);
      toast.success("✅ Curso eliminado exitosamente");
    } catch (error) {
      console.error('Error deleting course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`❌ Error al eliminar el curso: ${errorMessage}`);
    }
  };

  const resetForm = () => {
    setFormData({
      fullname: '',
      shortname: '',
      descripcion: '',
      carga_horaria: 0,
      fecha_inicio: '',
      fecha_limite_inscripcion: '',
      banner: '',
      pdf: '',
      celular_referencia: '',
      inversion: 0,
      descuento: 0,
      fecha_inicio_descuento: '',
      fecha_fin_descuento: '',
      pago_qr: '',
      pago_qr_descuento: '',
      link_formulario: '',
      dias: [],
      sesiones: [],
      horarios: [],
      links_pdf: '',
      duracion_del_curso: '',
      estado: 'activo'
    });
    setFormErrors({});
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
    <>
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
                      <h1 className="text-3xl font-bold">Gestión de Cursos</h1>
                      <p className="text-muted-foreground">
                        Gestionar cursos desde la plataforma Moodle
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSyncCourses} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sincronizar Cursos
                      </Button>
                      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Curso
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Crear Nuevo Curso</DialogTitle>
                            <DialogDescription>
                              Agregar un nuevo curso al sistema
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="fullname">Nombre Completo *</Label>
                                <Input
                                  id="fullname"
                                  value={formData.fullname}
                                  onChange={(e) => setFormData(prev => ({ ...prev, fullname: e.target.value }))}
                                  placeholder="Nombre completo del curso"
                                  className={formErrors.fullname ? "border-red-500" : ""}
                                />
                                {formErrors.fullname && <p className="text-sm text-red-500 mt-1">{formErrors.fullname}</p>}
                              </div>
                              <div>
                                <Label htmlFor="shortname">Nombre Corto *</Label>
                                <Input
                                  id="shortname"
                                  value={formData.shortname}
                                  onChange={(e) => setFormData(prev => ({ ...prev, shortname: e.target.value }))}
                                  placeholder="Nombre corto del curso"
                                  className={formErrors.shortname ? "border-red-500" : ""}
                                />
                                {formErrors.shortname && <p className="text-sm text-red-500 mt-1">{formErrors.shortname}</p>}
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="descripcion">Descripción *</Label>
                              <Textarea
                                id="descripcion"
                                value={formData.descripcion}
                                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                                placeholder="Descripción detallada del curso"
                                className={formErrors.descripcion ? "border-red-500" : ""}
                              />
                              {formErrors.descripcion && <p className="text-sm text-red-500 mt-1">{formErrors.descripcion}</p>}
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="carga_horaria">Horas *</Label>
                                <Input
                                  id="carga_horaria"
                                  type="number"
                                  value={formData.carga_horaria}
                                  onChange={(e) => setFormData(prev => ({ ...prev, carga_horaria: parseInt(e.target.value) || 0 }))}
                                  className={formErrors.carga_horaria ? "border-red-500" : ""}
                                />
                                {formErrors.carga_horaria && <p className="text-sm text-red-500 mt-1">{formErrors.carga_horaria}</p>}
                              </div>
                              <div>
                                <Label htmlFor="inversion">Precio (Bs) *</Label>
                                <Input
                                  id="inversion"
                                  type="number"
                                  step="0.01"
                                  value={formData.inversion}
                                  onChange={(e) => setFormData(prev => ({ ...prev, inversion: parseFloat(e.target.value) || 0 }))}
                                  className={formErrors.inversion ? "border-red-500" : ""}
                                />
                                {formErrors.inversion && <p className="text-sm text-red-500 mt-1">{formErrors.inversion}</p>}
                              </div>
                              <div>
                                <Label htmlFor="descuento">Descuento (%) *</Label>
                                <Input
                                  id="descuento"
                                  type="number"
                                  step="0.01"
                                  value={formData.descuento}
                                  onChange={(e) => setFormData(prev => ({ ...prev, descuento: parseFloat(e.target.value) || 0 }))}
                                  className={formErrors.descuento ? "border-red-500" : ""}
                                />
                                {formErrors.descuento && <p className="text-sm text-red-500 mt-1">{formErrors.descuento}</p>}
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="celular_referencia">Teléfono de Referencia *</Label>
                              <Input
                                id="celular_referencia"
                                value={formData.celular_referencia}
                                onChange={(e) => setFormData(prev => ({ ...prev, celular_referencia: e.target.value }))}
                                placeholder="+59169999999"
                                className={formErrors.celular_referencia ? "border-red-500" : ""}
                              />
                              {formErrors.celular_referencia && <p className="text-sm text-red-500 mt-1">{formErrors.celular_referencia}</p>}
                            </div>
                            <div>
                              <Label htmlFor="estado">Estado *</Label>
                              <Select value={formData.estado} onValueChange={(value: 'activo' | 'inactivo') => setFormData(prev => ({ ...prev, estado: value }))}>
                                <SelectTrigger className={formErrors.estado ? "border-red-500" : ""}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="activo">Activo</SelectItem>
                                  <SelectItem value="inactivo">Inactivo</SelectItem>
                                </SelectContent>
                              </Select>
                              {formErrors.estado && <p className="text-sm text-red-500 mt-1">{formErrors.estado}</p>}
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                              <X className="mr-2 h-4 w-4" />
                              Cancelar
                            </Button>
                            <Button onClick={handleCreateCourse}>
                              <Save className="mr-2 h-4 w-4" />
                              Crear Curso
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
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
                        <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${(() => {
                            const total = courses?.reduce((sum, c) => {
                              const inversion = typeof c.inversion === 'number' ? c.inversion : parseFloat(c.inversion || '0') || 0;
                              return sum + inversion;
                            }, 0) || 0;
                            return total.toFixed(2);
                          })()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total investment
                        </p>
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
                  </div>

                  {/* Courses Table */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Cursos</CardTitle>
                      <CardDescription>
                        Una lista de todos los cursos con su estado e información.
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
                            Sincronizar desde Moodle
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
                                        ID: {course.idnumber || course.id} | Created: {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {getStateBadge(course.estado)}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditCourse(course)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteCourse(course.id)}
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

      {/* Edit Course Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
            <DialogDescription>
              Actualizar toda la información del curso
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Básica</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-fullname">Nombre Completo *</Label>
                  <Input
                    id="edit-fullname"
                    value={formData.fullname}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullname: e.target.value }))}
                    placeholder="Nombre completo del curso"
                    className={formErrors.fullname ? "border-red-500" : ""}
                  />
                  {formErrors.fullname && <p className="text-sm text-red-500 mt-1">{formErrors.fullname}</p>}
                </div>
                <div>
                  <Label htmlFor="edit-shortname">Nombre Corto *</Label>
                  <Input
                    id="edit-shortname"
                    value={formData.shortname}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortname: e.target.value }))}
                    placeholder="Nombre corto del curso"
                    className={formErrors.shortname ? "border-red-500" : ""}
                  />
                  {formErrors.shortname && <p className="text-sm text-red-500 mt-1">{formErrors.shortname}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="edit-descripcion">Descripción *</Label>
                <Textarea
                  id="edit-descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción detallada del curso"
                  rows={3}
                  className={formErrors.descripcion ? "border-red-500" : ""}
                />
                {formErrors.descripcion && <p className="text-sm text-red-500 mt-1">{formErrors.descripcion}</p>}
              </div>
            </div>

            {/* Dates and Duration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Fechas y Duración</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-fecha_inicio">Start Date</Label>
                  <Input
                    id="edit-fecha_inicio"
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-fecha_limite_inscripcion">Registration Deadline</Label>
                  <Input
                    id="edit-fecha_limite_inscripcion"
                    type="date"
                    value={formData.fecha_limite_inscripcion}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_limite_inscripcion: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-carga_horaria">Hours</Label>
                  <Input
                    id="edit-carga_horaria"
                    type="number"
                    value={formData.carga_horaria}
                    onChange={(e) => setFormData(prev => ({ ...prev, carga_horaria: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-duracion_del_curso">Course Duration</Label>
                  <Input
                    id="edit-duracion_del_curso"
                    value={formData.duracion_del_curso}
                    onChange={(e) => setFormData(prev => ({ ...prev, duracion_del_curso: e.target.value }))}
                    placeholder="e.g., 3 months"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Precios</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-inversion">Price (Bs)</Label>
                  <Input
                    id="edit-inversion"
                    type="number"
                    step="0.01"
                    value={formData.inversion}
                    onChange={(e) => setFormData(prev => ({ ...prev, inversion: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-descuento">Discount (%)</Label>
                  <Input
                    id="edit-descuento"
                    type="number"
                    step="0.01"
                    value={formData.descuento}
                    onChange={(e) => setFormData(prev => ({ ...prev, descuento: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Final Price</Label>
                  <Input
                    value={(() => {
                      const inversion = formData.inversion || 0;
                      const descuento = formData.descuento || 0;
                      if (inversion > 0 && descuento > 0) {
                        return (inversion - (inversion * descuento / 100)).toFixed(2);
                      }
                      return inversion.toString();
                    })()}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-fecha_inicio_descuento">Discount Start Date</Label>
                  <Input
                    id="edit-fecha_inicio_descuento"
                    type="date"
                    value={formData.fecha_inicio_descuento}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_inicio_descuento: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-fecha_fin_descuento">Discount End Date</Label>
                  <Input
                    id="edit-fecha_fin_descuento"
                    type="date"
                    value={formData.fecha_fin_descuento}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_fin_descuento: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Media and Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Medios y Enlaces</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-banner">Banner URL</Label>
                  <Input
                    id="edit-banner"
                    value={formData.banner}
                    onChange={(e) => setFormData(prev => ({ ...prev, banner: e.target.value }))}
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-pdf">PDF URL</Label>
                  <Input
                    id="edit-pdf"
                    value={formData.pdf}
                    onChange={(e) => setFormData(prev => ({ ...prev, pdf: e.target.value }))}
                    placeholder="https://example.com/info.pdf"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-pago_qr">Payment QR</Label>
                  <Input
                    id="edit-pago_qr"
                    value={formData.pago_qr}
                    onChange={(e) => setFormData(prev => ({ ...prev, pago_qr: e.target.value }))}
                    placeholder="https://example.com/qr.png"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-pago_qr_descuento">Discount Payment QR</Label>
                  <Input
                    id="edit-pago_qr_descuento"
                    value={formData.pago_qr_descuento}
                    onChange={(e) => setFormData(prev => ({ ...prev, pago_qr_descuento: e.target.value }))}
                    placeholder="https://example.com/qr_descuento.png"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-link_formulario">Registration Form URL</Label>
                <Input
                  id="edit-link_formulario"
                  value={formData.link_formulario}
                  onChange={(e) => setFormData(prev => ({ ...prev, link_formulario: e.target.value }))}
                  placeholder="https://example.com/formulario"
                />
              </div>
              <div>
                <Label htmlFor="edit-links_pdf">Additional PDF Links</Label>
                <Input
                  id="edit-links_pdf"
                  value={formData.links_pdf}
                  onChange={(e) => setFormData(prev => ({ ...prev, links_pdf: e.target.value }))}
                  placeholder="https://example.com/material.pdf"
                />
              </div>
            </div>

            {/* Contact and Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contacto y Horario</h3>
              <div>
                <Label htmlFor="edit-celular_referencia">Reference Phone</Label>
                <Input
                  id="edit-celular_referencia"
                  value={formData.celular_referencia}
                  onChange={(e) => setFormData(prev => ({ ...prev, celular_referencia: e.target.value }))}
                  placeholder="+59169999999"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-dias">Days</Label>
                  <Input
                    id="edit-dias"
                    value={formData.dias?.join(', ') || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, dias: e.target.value.split(',').map(d => d.trim()) }))}
                    placeholder="Lunes, Miércoles, Viernes"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-sesiones">Sessions</Label>
                  <Input
                    id="edit-sesiones"
                    value={formData.sesiones?.join(', ') || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, sesiones: e.target.value.split(',').map(s => s.trim()) }))}
                    placeholder="Sesión 1, Sesión 2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-horarios">Schedule</Label>
                  <Input
                    id="edit-horarios"
                    value={formData.horarios?.join(' - ') || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, horarios: e.target.value.split(' - ').map(h => h.trim()) }))}
                    placeholder="08:00 - 12:00"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Estado</h3>
              <div>
                <Label htmlFor="edit-estado">Course Status</Label>
                <Select value={formData.estado} onValueChange={(value: 'activo' | 'inactivo') => setFormData(prev => ({ ...prev, estado: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Active</SelectItem>
                    <SelectItem value="inactivo">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={handleUpdateCourse}>
              <Save className="mr-2 h-4 w-4" />
              Actualizar Curso
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  return (
    <>
      {/* Edit Course Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update all course information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-fullname">Full Name *</Label>
                  <Input
                    id="edit-fullname"
                    value={formData.fullname}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullname: e.target.value }))}
                    placeholder="Course full name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-shortname">Short Name *</Label>
                  <Input
                    id="edit-shortname"
                    value={formData.shortname}
                    onChange={(e) => setFormData(prev => ({ ...prev, shortname: e.target.value }))}
                    placeholder="Course short name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-descripcion">Description *</Label>
                <Textarea
                  id="edit-descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Course description"
                  rows={3}
                />
              </div>
            </div>

            {/* Dates and Duration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dates and Duration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-fecha_inicio">Start Date</Label>
                  <Input
                    id="edit-fecha_inicio"
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-fecha_limite_inscripcion">Registration Deadline</Label>
                  <Input
                    id="edit-fecha_limite_inscripcion"
                    type="date"
                    value={formData.fecha_limite_inscripcion}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_limite_inscripcion: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-carga_horaria">Hours</Label>
                  <Input
                    id="edit-carga_horaria"
                    type="number"
                    value={formData.carga_horaria}
                    onChange={(e) => setFormData(prev => ({ ...prev, carga_horaria: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-duracion_del_curso">Course Duration</Label>
                  <Input
                    id="edit-duracion_del_curso"
                    value={formData.duracion_del_curso}
                    onChange={(e) => setFormData(prev => ({ ...prev, duracion_del_curso: e.target.value }))}
                    placeholder="e.g., 3 months"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-inversion">Price (Bs)</Label>
                  <Input
                    id="edit-inversion"
                    type="number"
                    step="0.01"
                    value={formData.inversion}
                    onChange={(e) => setFormData(prev => ({ ...prev, inversion: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-descuento">Discount (%)</Label>
                  <Input
                    id="edit-descuento"
                    type="number"
                    step="0.01"
                    value={formData.descuento}
                    onChange={(e) => setFormData(prev => ({ ...prev, descuento: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Final Price</Label>
                  <Input
                    value={(() => {
                      const inversion = formData.inversion || 0;
                      const descuento = formData.descuento || 0;
                      if (inversion > 0 && descuento > 0) {
                        return (inversion - (inversion * descuento / 100)).toFixed(2);
                      }
                      return inversion.toString();
                    })()}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-fecha_inicio_descuento">Discount Start Date</Label>
                  <Input
                    id="edit-fecha_inicio_descuento"
                    type="date"
                    value={formData.fecha_inicio_descuento}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_inicio_descuento: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-fecha_fin_descuento">Discount End Date</Label>
                  <Input
                    id="edit-fecha_fin_descuento"
                    type="date"
                    value={formData.fecha_fin_descuento}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_fin_descuento: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Media and Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Media and Links</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-banner">Banner URL</Label>
                  <Input
                    id="edit-banner"
                    value={formData.banner}
                    onChange={(e) => setFormData(prev => ({ ...prev, banner: e.target.value }))}
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-pdf">PDF URL</Label>
                  <Input
                    id="edit-pdf"
                    value={formData.pdf}
                    onChange={(e) => setFormData(prev => ({ ...prev, pdf: e.target.value }))}
                    placeholder="https://example.com/info.pdf"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-pago_qr">Payment QR</Label>
                  <Input
                    id="edit-pago_qr"
                    value={formData.pago_qr}
                    onChange={(e) => setFormData(prev => ({ ...prev, pago_qr: e.target.value }))}
                    placeholder="https://example.com/qr.png"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-pago_qr_descuento">Discount Payment QR</Label>
                  <Input
                    id="edit-pago_qr_descuento"
                    value={formData.pago_qr_descuento}
                    onChange={(e) => setFormData(prev => ({ ...prev, pago_qr_descuento: e.target.value }))}
                    placeholder="https://example.com/qr_descuento.png"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-link_formulario">Registration Form URL</Label>
                <Input
                  id="edit-link_formulario"
                  value={formData.link_formulario}
                  onChange={(e) => setFormData(prev => ({ ...prev, link_formulario: e.target.value }))}
                  placeholder="https://example.com/formulario"
                />
              </div>
              <div>
                <Label htmlFor="edit-links_pdf">Additional PDF Links</Label>
                <Input
                  id="edit-links_pdf"
                  value={formData.links_pdf}
                  onChange={(e) => setFormData(prev => ({ ...prev, links_pdf: e.target.value }))}
                  placeholder="https://example.com/material.pdf"
                />
              </div>
            </div>

            {/* Contact and Schedule */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact and Schedule</h3>
              <div>
                <Label htmlFor="edit-celular_referencia">Reference Phone</Label>
                <Input
                  id="edit-celular_referencia"
                  value={formData.celular_referencia}
                  onChange={(e) => setFormData(prev => ({ ...prev, celular_referencia: e.target.value }))}
                  placeholder="+59169999999"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-dias">Days</Label>
                  <Input
                    id="edit-dias"
                    value={formData.dias?.join(', ') || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, dias: e.target.value.split(',').map(d => d.trim()) }))}
                    placeholder="Lunes, Miércoles, Viernes"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-sesiones">Sessions</Label>
                  <Input
                    id="edit-sesiones"
                    value={formData.sesiones?.join(', ') || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, sesiones: e.target.value.split(',').map(s => s.trim()) }))}
                    placeholder="Sesión 1, Sesión 2"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-horarios">Schedule</Label>
                  <Input
                    id="edit-horarios"
                    value={formData.horarios?.join(' - ') || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, horarios: e.target.value.split(' - ').map(h => h.trim()) }))}
                    placeholder="08:00 - 12:00"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status</h3>
              <div>
                <Label htmlFor="edit-estado">Course Status</Label>
                <Select value={formData.estado} onValueChange={(value: 'activo' | 'inactivo') => setFormData(prev => ({ ...prev, estado: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Active</SelectItem>
                    <SelectItem value="inactivo">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleUpdateCourse}>
              <Save className="mr-2 h-4 w-4" />
              Update Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}