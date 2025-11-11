// types/admin.ts

// User Management Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'usuario' | 'invitado';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'usuario' | 'invitado';
  isActive: boolean;
}

export interface CreateCourseRequest {
  fullname: string;
  shortname: string;
  descripcion: string;
  carga_horaria: number;
  fecha_inicio: string;
  fecha_limite_inscripcion: string;
  banner: string;
  celular_referencia: string;
  inversion: number;
  descuento: number;
  pdf?: string;
  pago_qr?: string;
  pago_qr_descuento?: string;
  link_formulario?: string;
  dias?: string[];
  sesiones?: string[];
  horarios?: string[];
  fecha_inicio_descuento?: string;
  fecha_fin_descuento?: string;
  links_pdf?: string;
  duracion_del_curso?: string;
  estado?: 'activo' | 'inactivo';
}

export interface UpdateUserRequest {
  name?: string;
  role?: 'admin' | 'usuario' | 'invitado';
  isActive?: boolean;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: {
    admin: number;
    usuario: number;
    invitado: number;
  };
}

// WhatsApp Session Management Types
export interface WhatsAppSession {
  id: string;
  phoneNumber: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'qr_pending' | 'error';
  lastConnection?: string;
  createdAt: string;
  updatedAt?: string;
  qrCode?: string;
  qrGeneratedAt?: string;
  qrExpiresAt?: string;
  qrScanned?: boolean;
  autoResponseEnabled?: boolean;
  privateResponseMessage?: string;
  groupResponseMessage?: string;
  totalMessagesSent?: number;
  privateMessagesSent?: number;
  groupMessagesSent?: number;
  lastAutoResponseAt?: string;
}

export interface CreateSessionRequest {
  phoneNumber: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  phoneNumber: string;
  status: string;
}

export interface QRCodeResponse {
  qrCode: string;
  status: string;
  expiresAt?: string;
  generatedAt?: string;
  scanned?: boolean;
}

export interface SessionStatusResponse {
  sessionId: string;
  phoneNumber: string;
  status: string;
  lastConnection?: string;
}

export interface AutoResponseConfig {
  privateMessage: string;
  groupMessage: string;
  enabled: boolean;
}

export interface AutoResponseStats {
  sessionId: string;
  enabled: boolean;
  totalMessagesSent: number;
  privateMessages: number;
  groupMessages: number;
  lastActivity: string;
  messagesLast24h: number;
  averagePerDay: number;
}

export interface TestAutoResponseRequest {
  phoneNumber: string;
  messageType: 'private' | 'group';
}

// Contact Management Types
export interface Contact {
  id?: string;
  id_contac?: string;
  phone: string;
  nombre_completo: string;
  estado: 'frio' | 'tibio' | 'caliente' | 'cerrado' | null;
  ia: boolean;
  registrado: boolean;
  fecha: string;
  messageCount: number;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  lastMessage?: {
    content: string;
    fecha: string;
    estado: string;
  };
}

export interface CreateContactRequest {
  phone: string;
  nombre_completo: string;
  estado: string;
  ia: boolean;
}

export interface UpdateContactRequest {
  estado?: string;
  ia?: boolean;
  nombre_completo?: string;
}

export interface ContactMessage {
  id: string;
  content: string;
  timestamp: string;
  estado: string;
  tipo_mensaje: string;
}

// Course Management Types
export interface Course {
  id: number;
  fullname: string;
  shortname: string;
  idnumber?: string;
  summary?: string;
  descripcion: string;
  carga_horaria: number;
  fecha_inicio: string;
  fecha_limite_inscripcion: string;
  banner: string;
  pdf?: string;
  celular_referencia: string;
  inversion: number;
  descuento: number;
  fecha_inicio_descuento?: string;
  fecha_fin_descuento?: string;
  pago_qr?: string;
  pago_qr_descuento?: string;
  link_formulario?: string;
  dias?: string[];
  sesiones?: string[];
  horarios?: string[];
  links_pdf?: string;
  duracion_del_curso?: string;
  estado: 'activo' | 'inactivo';
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCourseRequest {
  fullname?: string;
  shortname?: string;
  descripcion?: string;
  carga_horaria?: number;
  inversion?: number;
  descuento?: number;
  fecha_inicio?: string;
  fecha_limite_inscripcion?: string;
  banner?: string;
  pdf?: string;
  celular_referencia?: string;
  pago_qr?: string;
  pago_qr_descuento?: string;
  link_formulario?: string;
  dias?: string[];
  sesiones?: string[];
  horarios?: string[];
  fecha_inicio_descuento?: string;
  fecha_fin_descuento?: string;
  links_pdf?: string;
  duracion_del_curso?: string;
  estado?: 'activo' | 'inactivo';
}

// Learning Content Types
export interface LearningContent {
  id: string;
  content: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLearningContentRequest {
  content: string;
  estado: string;
}

export interface UpdateLearningContentRequest {
  content?: string;
  estado?: string;
}

// AI RAG System Types
export interface RAGQueryRequest {
  query: string;
  conversation_history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  max_documents?: number;
}

export interface RAGChatRequest {
  conversation_history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  question: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface OllamaChatRequest {
  conversation_history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  question: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface RAGResponse {
  answer: string;
  sources: Array<{
    content: string;
    score: number;
    metadata?: Record<string, unknown>;
  }>;
  conversation_id?: string;
}

export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
  digest: string;
}

export interface AIMetrics {
  total_queries: number;
  successful_queries: number;
  average_response_time: number;
  model_usage: Record<string, number>;
}

// Dashboard Types
export interface DashboardOverview {
  whatsapp: {
    totalSessions: number;
    activeSessions: number;
    qrPendingSessions: number;
    inactiveSessions: number;
    messagesLast30Days: number;
    averageMessagesPerSession: number;
  };
  contacts: {
    totalContacts: number;
    activeContacts: number;
    registeredContacts: number;
    inactiveContacts: number;
    leads: {
      frio: number;
      tibio: number;
      caliente: number;
      conversionRate: number;
    };
  };
  messages: {
    totalMessages: number;
    incomingMessages: number;
    outgoingMessages: number;
    groupMessages: number;
    privateMessages: number;
    messagesLast7Days: number;
    responseRate: number;
    averageMessagesPerDay: number;
  };
  courses: {
    totalCourses: number;
    activeCourses: number;
    inactiveCourses: number;
    totalLearningContent: number;
    activeLearningContent: number;
    coursesByCategory: Record<string, number>;
  };
  timestamp: string;
}

export interface WhatsAppStats {
  totalSessions: number;
  connectedSessions: number;
  totalMessages: number;
  messagesToday: number;
  autoResponses: number;
  autoResponsesToday: number;
}

export interface ContactStats {
  totalContacts: number;
  activeContacts: number;
  contactsWithIA: number;
  contactsByState: Record<string, number>;
}

export interface MessageStats {
  totalMessages: number;
  messagesToday: number;
  messagesThisWeek: number;
  messagesThisMonth: number;
  averageMessagesPerDay: number;
}

export interface CourseStats {
  totalCourses: number;
  activeCourses: number;
  coursesByState: Record<string, number>;
}

export interface MessageTrend {
  date: string;
  count: number;
}

export interface ContactGrowth {
  date: string;
  newContacts: number;
  totalContacts: number;
}

export interface SessionActivity {
  sessionId: string;
  phoneNumber: string;
  messagesToday: number;
  lastActivity: string;
  status: string;
}

export interface RealtimeStats {
  activeConnections: number;
  messagesPerMinute: number;
  newContactsToday: number;
  systemLoad: number;
}

export interface TopContact {
  id: string;
  name: string;
  phone: string;
  messageCount: number;
  lastMessage: string;
}

export interface TopGroup {
  id: string;
  name: string;
  memberCount: number;
  messageCount: number;
  lastMessage: string;
}

export interface PerformanceMetrics {
  apiResponseTime: number;
  databaseQueryTime: number;
  websocketLatency: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface DashboardCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: string;
}

export interface MessageDistribution {
  private: number;
  group: number;
  autoResponse: number;
  manual: number;
}

export interface LeadsFunnel {
  totalContacts: number;
  frio: number;
  tibio: number;
  caliente: number;
  cerrado: number;
}

// Seeder Types
export interface SeederStatus {
  completed: boolean;
  progress: number;
  currentStep: string;
  totalSteps: number;
  errors: string[];
}

// Generic API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}