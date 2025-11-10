"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/auth";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  RefreshCw
} from "lucide-react";

export default function UserProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, getProfile, updateProfile } = useUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.USER)) {
      console.log('🔐 UserProfilePage: Access denied - redirecting to home');
      router.push('/');
      return;
    }

    if (user?.role === UserRole.USER) {
      console.log('👤 UserProfilePage: Loading user profile');
      getProfile();
    }
  }, [user, authLoading, router, getProfile]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        name: profile.name,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      console.log('👤 UserProfilePage: Updating profile');
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('❌ UserProfilePage: Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: profile?.name || "",
    });
    setIsEditing(false);
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
                    <h1 className="text-3xl font-bold">My Profile</h1>
                    <p className="text-muted-foreground">
                      Manage your account information and preferences
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => getProfile()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>

                {/* Profile Overview */}
                <div className="grid gap-6 mt-6 md:grid-cols-3">
                  {/* Profile Card */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                          </CardTitle>
                          <CardDescription>
                            Your personal account details
                          </CardDescription>
                        </div>
                        {!isEditing && (
                          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {profileLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : profile ? (
                        <>
                          {/* Name Field */}
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            {isEditing ? (
                              <Input
                                id="name"
                                value={editForm.name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                className="mt-1"
                              />
                            ) : (
                              <p className="mt-1 text-sm font-medium">{profile.name}</p>
                            )}
                          </div>

                          {/* Email Field (Read-only) */}
                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm font-medium">{profile.email}</p>
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            </div>
                          </div>

                          {/* Role Field (Read-only) */}
                          <div>
                            <Label>Account Type</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <Badge variant="default">
                                User
                              </Badge>
                            </div>
                          </div>

                          {/* Account Created */}
                          <div>
                            <Label>Account Created</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <p className="text-sm">
                                {new Date(profile.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>

                          {/* Edit Actions */}
                          {isEditing && (
                            <div className="flex gap-2 pt-4">
                              <Button onClick={handleSave} size="sm">
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                              </Button>
                              <Button variant="outline" onClick={handleCancel} size="sm">
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Failed to load profile information</p>
                          <Button variant="outline" onClick={() => getProfile()} className="mt-2">
                            Try Again
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Account Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Statistics</CardTitle>
                      <CardDescription>
                        Your activity overview
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Sessions Created</span>
                        <span className="font-medium">{profile?.sessionsCount || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Account Status</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Last Login</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Role</span>
                        <Badge variant="outline">
                          {user.role === 'usuario' ? 'User' : user.role}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Security Notice */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-orange-600">Security Notice</CardTitle>
                    <CardDescription>
                      Important information about your account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Your email address is verified and secure.</p>
                      <p>• Password changes require email confirmation.</p>
                      <p>• Account activity is monitored for security.</p>
                      <p>• Contact support if you notice any suspicious activity.</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Common tasks and shortcuts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => router.push('/dashboard')}
                      >
                        <User className="h-6 w-6" />
                        <span className="text-sm">View Dashboard</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => router.push('/whatsapp')}
                      >
                        <Shield className="h-6 w-6" />
                        <span className="text-sm">Manage WhatsApp</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => router.push('/user/courses')}
                      >
                        <Calendar className="h-6 w-6" />
                        <span className="text-sm">Browse Courses</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => router.push('/user/learning')}
                      >
                        <Edit className="h-6 w-6" />
                        <span className="text-sm">Learning Content</span>
                      </Button>
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