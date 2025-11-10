"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  createWhatsAppSession,
  getQRCode,
  getSessionStatus,
  getWhatsAppSessions,
  SessionStatus,
  WhatsAppSession,
  updateAutoResponse,
  toggleAutoResponse,
  getAutoResponseStats,
  AutoResponseConfig,
  deleteWhatsAppSession,
  testAutoResponse,
} from "@/lib/whatsapp";
import {
  ArrowLeft,
  QrCode,
  CheckCircle,
  Loader2,
  Plus,
  Settings,
  BarChart3,
  MessageSquare,
  Users,
  Phone,
} from "lucide-react";
import { UserRole } from "@/types/auth";
import { getAuthData } from "@/lib/storage";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type Step = "phone" | "qr" | "verify";

export default function WhatsAppPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role: UserRole;
  } | null>(null);
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<WhatsAppSession | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [autoResponseConfig, setAutoResponseConfig] =
    useState<AutoResponseConfig>({
      privateMessage: "🤖 Estás hablando con PosGrading - Sistema automatizado",
      groupMessage:
        "🤖 Estás hablando con PosGrading en un grupo - Sistema automatizado",
      enabled: true,
    });

  // Load user data and sessions on mount
  useEffect(() => {
    const { user: storedUser } = getAuthData();
    console.log("User data:", storedUser);
    setUser(storedUser);

    if (storedUser) {
      loadSessions();
    }
  }, []);

  const loadSessions = async () => {
    try {
      console.log("Loading sessions...");
      const sessionsData = await getWhatsAppSessions();
      console.log("Sessions loaded:", sessionsData);
      setSessions(sessionsData);
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast.error("Failed to load sessions");
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setLoading(true);
    try {
      console.log("Creating WhatsApp session for phone:", phoneNumber);
      const response = await createWhatsAppSession(phoneNumber);
      console.log("Session created:", response);
      setSessionId(response.sessionId);
      setCurrentStep("qr");
      toast.success("Session created successfully!");
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetQR = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      console.log("Getting QR code for session:", sessionId);
      const response = await getQRCode(sessionId);
      console.log("QR code response:", response);
      setQrCode(response.qrCode);
      toast.success("QR code generated!");
    } catch (error) {
      console.error("Error getting QR code:", error);
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyStatus = async () => {
    if (!sessionId) return;

    setVerifying(true);
    try {
      console.log("Verifying session status for:", sessionId);
      const response = await getSessionStatus(sessionId);
      console.log("Session status response:", response);
      if (response.status === SessionStatus.CONNECTED) {
        setCurrentStep("verify");
        toast.success("WhatsApp connected successfully!");
        // Reload sessions after successful connection
        setTimeout(() => {
          loadSessions();
          setCurrentStep("phone");
          setPhoneNumber("");
          setSessionId("");
          setQrCode("");
        }, 2000);
      } else {
        toast.info(`Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error verifying session status:", error);
      toast.error((error as Error).message);
    } finally {
      setVerifying(false);
    }
  };

  const renderPhoneStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeft
            className="h-5 w-5 cursor-pointer"
            onClick={() => router.push("/dashboard")}
          />
          Conectar WhatsApp
        </CardTitle>
        <CardDescription>
          Ingresa tu número de teléfono para iniciar el proceso de conexión de WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Número de Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+59112345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando Sesión...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderQRStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeft
            className="h-5 w-5 cursor-pointer"
            onClick={() => setCurrentStep("phone")}
          />
          Escanear Código QR
        </CardTitle>
        <CardDescription>
          Abre WhatsApp en tu teléfono y escanea el código QR a continuación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qrCode ? (
          <div className="text-center">
            <Button onClick={handleGetQR} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando QR...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Obtener Código QR
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${qrCode}`}
                alt="WhatsApp QR Code"
                className="max-w-full h-auto border rounded-lg"
                onError={(e) => {
                  console.error("Failed to load QR image:", e);
                  toast.error(
                    "Failed to load QR code image. Check console for details."
                  );
                }}
              />
            </div>
            <Button
              onClick={handleVerifyStatus}
              className="w-full"
              disabled={verifying}
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando Conexión...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  I&apos;ve Scanned the QR Code
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderVerifyStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          WhatsApp Connected!
        </CardTitle>
        <CardDescription>
          Your WhatsApp session has been successfully connected. Redirecting to
          dashboard...
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </CardContent>
    </Card>
  );

  // Role-based rendering
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // GUEST users get access denied message
  if (user.role === UserRole.GUEST) {
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
                  <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        WhatsApp Access Restricted
                      </CardTitle>
                      <CardDescription>
                        WhatsApp features are not available for guest users
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Phone className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Access Denied</h3>
                        <p className="text-muted-foreground mb-4">
                          As a guest user, you don't have access to WhatsApp functionality.
                          Please register as a regular user to access WhatsApp features.
                        </p>
                        <Button onClick={() => router.push('/login')}>
                          Register / Login
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
                {/* USER role: Show session management or creation (Max 1 session) */}
                {user.role === UserRole.USER && (
                  <>
                    {sessions.length === 0 || showCreateForm ? (
                      // Show creation form
                      <div className="flex items-center justify-center p-4">
                        {currentStep === "phone" && renderPhoneStep()}
                        {currentStep === "qr" && renderQRStep()}
                        {currentStep === "verify" && renderVerifyStep()}
                      </div>
                    ) : (
                      // Show session management for existing session
                      renderUserSessionManagement(
                        sessions,
                        setShowCreateForm,
                        autoResponseConfig,
                        setAutoResponseConfig,
                        testPhoneNumber,
                        setTestPhoneNumber,
                        loadSessions
                      )
                    )}
                  </>
                )}

                {/* ADMIN role: Show multiple session management */}
                {user.role === UserRole.ADMIN && (
                  <>
                    {showCreateForm ? (
                      <div className="flex items-center justify-center p-4">
                        {currentStep === "phone" && renderPhoneStep()}
                        {currentStep === "qr" && renderQRStep()}
                        {currentStep === "verify" && renderVerifyStep()}
                      </div>
                    ) : (
                      renderAdminSessionManagement(sessions, setShowCreateForm)
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function renderUserSessionManagement(
  sessions: WhatsAppSession[],
  setShowCreateForm: (show: boolean) => void,
  autoResponseConfig: AutoResponseConfig,
  setAutoResponseConfig: (config: AutoResponseConfig) => void,
  testPhoneNumber: string,
  setTestPhoneNumber: (phone: string) => void,
  loadSessions: () => void
) {
  const session = sessions[0]; // USER has only one session

  if (!session) {
    return (
      <div className="text-center py-8">
        <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No session found</p>
        <Button className="mt-4" onClick={() => setShowCreateForm(true)}>
          Create Session
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">WhatsApp Session</h1>
        <p className="text-muted-foreground">
          Manage your WhatsApp Business session (User Access - Max 1 Session)
        </p>
      </div>

      <div className="grid gap-6">
        {/* Session Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Session Status
            </CardTitle>
            <CardDescription>Phone: {session?.phoneNumber}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  session?.status === SessionStatus.CONNECTED
                    ? "default"
                    : "secondary"
                }
              >
                {session?.status || "Unknown"}
              </Badge>
              {session?.lastConnection && (
                <span className="text-sm text-muted-foreground">
                  Last connected:{" "}
                  {new Date(session.lastConnection).toLocaleString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Auto-Response Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Auto-Response Settings
            </CardTitle>
            <CardDescription>
              Configure automatic responses for incoming messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Auto-response enabled</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  session &&
                  toggleAutoResponse(session.id, !session.autoResponseEnabled)
                }
              >
                {session?.autoResponseEnabled ? "Disable" : "Enable"}
              </Button>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <Label>Private Chat Message</Label>
                <Input
                  value={autoResponseConfig.privateMessage}
                  onChange={(e) =>
                    setAutoResponseConfig({
                      ...autoResponseConfig,
                      privateMessage: e.target.value,
                    })
                  }
                  placeholder="Message for private chats"
                />
              </div>
              <div>
                <Label>Group Chat Message</Label>
                <Input
                  value={autoResponseConfig.groupMessage}
                  onChange={(e) =>
                    setAutoResponseConfig({
                      ...autoResponseConfig,
                      groupMessage: e.target.value,
                    })
                  }
                  placeholder="Message for group chats"
                />
              </div>
              <Button
                onClick={() =>
                  session && updateAutoResponse(session.id, autoResponseConfig)
                }
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                Update Messages
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Message Statistics
            </CardTitle>
            <CardDescription>
              Overview of your WhatsApp activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {session?.totalMessagesSent || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Messages
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {session?.privateMessagesSent || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Private Messages
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {session?.groupMessagesSent || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Group Messages
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {session?.lastAutoResponseAt ? "Active" : "Inactive"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Auto-Response
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Auto-Response */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Test Auto-Response
            </CardTitle>
            <CardDescription>
              Send a test message to verify auto-response functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Test Phone Number</Label>
                <Input
                  placeholder="+59112345678"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                />
              </div>
              <div>
                <Label>Message Type</Label>
                <Select defaultValue="private">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private Chat</SelectItem>
                    <SelectItem value="group">Group Chat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={() =>
                session &&
                testAutoResponse(session.id, testPhoneNumber, "private")
              }
              className="w-full"
            >
              Send Test Message
            </Button>
          </CardContent>
        </Card>

        {/* Delete Session */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete your WhatsApp session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!session) return;
                if (
                  confirm(
                    "Are you sure you want to delete this WhatsApp session? This action cannot be undone."
                  )
                ) {
                  try {
                    await deleteWhatsAppSession(session.id);
                    toast.success("Session deleted successfully");
                    // Reload sessions
                    loadSessions();
                  } catch (error) {
                    toast.error((error as Error).message);
                  }
                }
              }}
            >
              Delete Session
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function renderAdminSessionManagement(
  sessions: WhatsAppSession[],
  setShowCreateForm: (show: boolean) => void
) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">WhatsApp Sessions</h1>
        <p className="text-muted-foreground">
          Manage multiple WhatsApp Business sessions (Admin Access - Unlimited)
        </p>
      </div>

      <div className="grid gap-6">
        {/* Create New Session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Create New Session</span>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </CardTitle>
            <CardDescription>
              Add a new WhatsApp Business session
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Existing Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>All Sessions ({sessions.length})</CardTitle>
            <CardDescription>
              Manage your WhatsApp Business sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No sessions created yet</p>
                <Button
                  className="mt-4"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Session
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session.id} className="border">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium">
                              {session.phoneNumber}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Created:{" "}
                              {new Date(session.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge
                            variant={
                              session.status === SessionStatus.CONNECTED
                                ? "default"
                                : "secondary"
                            }
                          >
                            {session.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {session.lastConnection && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Last connected:{" "}
                          {new Date(session.lastConnection).toLocaleString()}
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
  );
}
