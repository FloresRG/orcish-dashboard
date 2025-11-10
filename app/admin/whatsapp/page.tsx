"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAdminWhatsApp } from "@/hooks/useAdminWhatsApp";
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
import { WhatsAppSession, AutoResponseConfig } from "@/types/admin";
import {
  Phone,
  QrCode,
  MessageSquare,
  Settings,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

export default function AdminWhatsAppPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    sessions,
    loading: sessionsLoading,
    loadSessions,
    createSession,
    getQRCode,
    getSessionStatus,
    updateAutoResponse,
    toggleAutoResponse,
    getAutoResponseStats,
    deleteSession,
    testAutoResponse,
  } = useAdminWhatsApp();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedSession, setSelectedSession] = useState<WhatsAppSession | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [autoResponseConfig, setAutoResponseConfig] = useState<AutoResponseConfig>({
    privateMessage: "🤖 Gracias por tu mensaje. Te responderemos pronto.",
    groupMessage: "🤖 Mensaje automático para grupos",
    enabled: true,
  });
  const [testPhoneNumber, setTestPhoneNumber] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.ADMIN)) {
      console.log('🔐 AdminWhatsAppPage: Access denied - redirecting to home');
      router.push('/');
      return;
    }

    if (user?.role === UserRole.ADMIN) {
      console.log('📱 AdminWhatsAppPage: Loading WhatsApp sessions for admin');
      loadSessions();
    }
  }, [user, authLoading, router, loadSessions]);

  const handleCreateSession = async () => {
    if (!phoneNumber.trim()) return;

    try {
      console.log('📱 AdminWhatsAppPage: Creating session for phone:', phoneNumber);
      await createSession({ phoneNumber: phoneNumber.trim() });
      setPhoneNumber("");
      loadSessions(); // Reload sessions
    } catch (error) {
      console.error('❌ AdminWhatsAppPage: Failed to create session:', error);
    }
  };

  const handleGetQR = async (session: WhatsAppSession) => {
    try {
      console.log('📱 AdminWhatsAppPage: Getting QR for session:', session.id);
      const response = await getQRCode(session.id);
      setQrCode(response.qrCode);
      setSelectedSession(session);
    } catch (error) {
      console.error('❌ AdminWhatsAppPage: Failed to get QR code:', error);
    }
  };

  const handleCheckStatus = async (session: WhatsAppSession) => {
    try {
      console.log('📱 AdminWhatsAppPage: Checking status for session:', session.id);
      await getSessionStatus(session.id);
      loadSessions(); // Reload to get updated status
    } catch (error) {
      console.error('❌ AdminWhatsAppPage: Failed to check status:', error);
    }
  };

  const handleUpdateAutoResponse = async () => {
    if (!selectedSession) return;

    try {
      console.log('📱 AdminWhatsAppPage: Updating auto-response for session:', selectedSession.id);
      await updateAutoResponse(selectedSession.id, autoResponseConfig);
      loadSessions(); // Reload sessions
    } catch (error) {
      console.error('❌ AdminWhatsAppPage: Failed to update auto-response:', error);
    }
  };

  const handleToggleAutoResponse = async (sessionId: string) => {
    try {
      console.log('📱 AdminWhatsAppPage: Toggling auto-response for session:', sessionId);
      await toggleAutoResponse(sessionId, !sessions.find(s => s.id === sessionId)?.autoResponseEnabled);
      loadSessions(); // Reload sessions
    } catch (error) {
      console.error('❌ AdminWhatsAppPage: Failed to toggle auto-response:', error);
    }
  };

  const handleTestAutoResponse = async () => {
    if (!selectedSession || !testPhoneNumber.trim()) return;

    try {
      console.log('📱 AdminWhatsAppPage: Testing auto-response for session:', selectedSession.id);
      await testAutoResponse(selectedSession.id, { phoneNumber: testPhoneNumber.trim(), messageType: "private" });
    } catch (error) {
      console.error('❌ AdminWhatsAppPage: Failed to test auto-response:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this WhatsApp session?')) return;

    try {
      console.log('📱 AdminWhatsAppPage: Deleting session:', sessionId);
      await deleteSession(sessionId);
      loadSessions(); // Reload sessions
    } catch (error) {
      console.error('❌ AdminWhatsAppPage: Failed to delete session:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'connecting':
        return <Badge variant="secondary"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Connecting</Badge>;
      case 'qr_pending':
        return <Badge variant="outline"><QrCode className="w-3 h-3 mr-1" />QR Pending</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Disconnected</Badge>;
    }
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
                    <h1 className="text-3xl font-bold">WhatsApp Management</h1>
                    <p className="text-muted-foreground">
                      Manage unlimited WhatsApp Business sessions (Admin Access)
                    </p>
                  </div>
                </div>

                {/* Create New Session */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Create New Session
                    </CardTitle>
                    <CardDescription>
                      Add a new WhatsApp Business session for any phone number
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="+59112345678"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleCreateSession} disabled={!phoneNumber.trim()}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sessions List */}
                <div className="grid gap-4 mt-6">
                  {sessions.map((session) => (
                    <Card key={session.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Phone className="h-5 w-5" />
                              {session.phoneNumber}
                            </CardTitle>
                            <CardDescription>
                              Created: {new Date(session.createdAt).toLocaleDateString()}
                              {session.lastConnection && (
                                <span className="ml-4">
                                  Last connected: {new Date(session.lastConnection).toLocaleString()}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          {getStatusBadge(session.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGetQR(session)}
                          >
                            <QrCode className="mr-2 h-4 w-4" />
                            Get QR
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCheckStatus(session)}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Check Status
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleAutoResponse(session.id)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            {session.autoResponseEnabled ? 'Disable' : 'Enable'} Auto-Response
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSession(session)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Configure
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            Delete
                          </Button>
                        </div>

                        {/* Statistics */}
                        {(session.totalMessagesSent || 0) > 0 && (
                          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="font-medium">Total Messages</div>
                              <div className="text-muted-foreground">{session.totalMessagesSent}</div>
                            </div>
                            <div>
                              <div className="font-medium">Private Messages</div>
                              <div className="text-muted-foreground">{session.privateMessagesSent || 0}</div>
                            </div>
                            <div>
                              <div className="font-medium">Group Messages</div>
                              <div className="text-muted-foreground">{session.groupMessagesSent || 0}</div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* QR Code Display */}
                {qrCode && selectedSession && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>QR Code for {selectedSession.phoneNumber}</CardTitle>
                      <CardDescription>
                        Scan this QR code with WhatsApp on your phone
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center">
                        <img
                          src={`data:image/png;base64,${qrCode}`}
                          alt="WhatsApp QR Code"
                          className="max-w-full h-auto border rounded-lg"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Auto-Response Configuration */}
                {selectedSession && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Auto-Response Configuration</CardTitle>
                      <CardDescription>
                        Configure automatic responses for {selectedSession.phoneNumber}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="private-message">Private Chat Message</Label>
                        <Textarea
                          id="private-message"
                          placeholder="Message for private chats"
                          value={autoResponseConfig.privateMessage}
                          onChange={(e) => setAutoResponseConfig(prev => ({
                            ...prev,
                            privateMessage: e.target.value
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="group-message">Group Chat Message</Label>
                        <Textarea
                          id="group-message"
                          placeholder="Message for group chats"
                          value={autoResponseConfig.groupMessage}
                          onChange={(e) => setAutoResponseConfig(prev => ({
                            ...prev,
                            groupMessage: e.target.value
                          }))}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <Button onClick={handleUpdateAutoResponse}>
                          Update Configuration
                        </Button>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="test-phone">Test Phone:</Label>
                          <Input
                            id="test-phone"
                            placeholder="+59112345678"
                            value={testPhoneNumber}
                            onChange={(e) => setTestPhoneNumber(e.target.value)}
                            className="w-48"
                          />
                          <Button variant="outline" onClick={handleTestAutoResponse}>
                            Test Auto-Response
                          </Button>
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