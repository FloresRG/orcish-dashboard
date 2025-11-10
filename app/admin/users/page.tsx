"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { AdminUserForm } from "@/components/admin/AdminUserForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserRole } from "@/types/auth";
import { CreateUserRequest, AdminUser } from "@/types/admin";
import { Plus, Users, UserCheck, UserX } from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    users,
    loading: usersLoading,
    stats,
    loadUsers,
    loadStats,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  } = useAdminUsers();

  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.ADMIN)) {
      router.push('/');
      return;
    }

    if (user?.role === UserRole.ADMIN) {
      loadUsers();
      loadStats();
    }
  }, [user, authLoading, router, loadUsers, loadStats]);

  const handleCreateUser = async (data: CreateUserRequest) => {
    await createUser(data);
    setShowCreateForm(false);
  };

  const handleEditUser = async (userData: AdminUser) => {
    // For edit, we need to create a request without password
    const updateData = {
      name: userData.name,
      role: userData.role,
      isActive: userData.isActive,
    };
    await updateUser(userData.id, updateData);
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
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
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
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">
                      Manage system users, roles, and permissions
                    </p>
                  </div>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </div>

                {/* Stats Cards */}
                {stats && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.inactive}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">By Role</CardTitle>
                        <Badge variant="outline">Admin: {stats.byRole.admin}</Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          Users: {stats.byRole.usuario} | Guests: {stats.byRole.invitado}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Users Table */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                      A list of all users in the system with their roles and status.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdminUsersTable
                      users={users}
                      loading={usersLoading}
                      onEdit={handleEditUser}
                      onDelete={deleteUser}
                      onToggleStatus={toggleUserStatus}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Create User Form */}
      <AdminUserForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreateUser}
        mode="create"
      />
    </SidebarProvider>
  );
}