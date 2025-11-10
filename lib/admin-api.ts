// lib/admin-api.ts
import {
  AdminUser,
  CreateUserRequest,
  UpdateUserRequest,
  UserStats,
  WhatsAppSession,
  CreateSessionRequest,
  CreateSessionResponse,
  QRCodeResponse,
  SessionStatusResponse,
  AutoResponseConfig,
  AutoResponseStats,
  TestAutoResponseRequest,
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
  ContactMessage,
  Course,
  UpdateCourseRequest,
  LearningContent,
  CreateLearningContentRequest,
  UpdateLearningContentRequest,
  RAGQueryRequest,
  RAGChatRequest,
  OllamaChatRequest,
  RAGResponse,
  OllamaModel,
  AIMetrics,
  DashboardOverview,
  WhatsAppStats,
  ContactStats,
  MessageStats,
  CourseStats,
  MessageTrend,
  ContactGrowth,
  SessionActivity,
  RealtimeStats,
  TopContact,
  TopGroup,
  PerformanceMetrics,
  DashboardCard,
  MessageDistribution,
  LeadsFunnel,
  SeederStatus,
  ApiResponse,
  PaginatedResponse,
} from '@/types/admin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return response.json();
};

// User Management API
export const adminUsersApi = {
  create: (data: CreateUserRequest): Promise<AdminUser> =>
    apiRequest('/api/v1/users/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: (role?: string): Promise<AdminUser[]> => {
    const params = role ? `?role=${role}` : '';
    return apiRequest(`/api/v1/users/admin${params}`);
  },

  get: (userId: string): Promise<AdminUser> =>
    apiRequest(`/api/v1/users/admin/${userId}`),

  update: (userId: string, data: UpdateUserRequest): Promise<AdminUser> =>
    apiRequest(`/api/v1/users/admin/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (userId: string): Promise<void> =>
    apiRequest(`/api/v1/users/admin/${userId}`, {
      method: 'DELETE',
    }),

  toggleStatus: (userId: string): Promise<AdminUser> =>
    apiRequest(`/api/v1/users/admin/${userId}/toggle-status`, {
      method: 'PUT',
    }),

  getStats: (): Promise<UserStats> =>
    apiRequest('/api/v1/users/admin/stats/overview'),
};

// WhatsApp Management API
export const whatsappApi = {
  createSession: (data: CreateSessionRequest): Promise<CreateSessionResponse> =>
    apiRequest('/api/v1/whatsapp/session', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getQR: (sessionId: string): Promise<QRCodeResponse> =>
    apiRequest(`/api/v1/whatsapp/qr/${sessionId}`),

  getStatus: (sessionId: string): Promise<SessionStatusResponse> =>
    apiRequest(`/api/v1/whatsapp/status/${sessionId}`),

  listSessions: (): Promise<WhatsAppSession[]> =>
    apiRequest('/api/v1/whatsapp/sessions'),

  deleteSession: (sessionId: string): Promise<void> =>
    apiRequest(`/api/v1/whatsapp/session/${sessionId}`, {
      method: 'DELETE',
    }),

  updateAutoResponse: (sessionId: string, config: AutoResponseConfig): Promise<void> =>
    apiRequest(`/api/v1/whatsapp/auto-response/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    }),

  getAutoResponseStats: (sessionId: string): Promise<AutoResponseStats> =>
    apiRequest(`/api/v1/whatsapp/auto-response/stats/${sessionId}`),

  toggleAutoResponse: (sessionId: string, enabled: boolean): Promise<void> =>
    apiRequest(`/api/v1/whatsapp/auto-response/toggle/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    }),

  testAutoResponse: (sessionId: string, data: TestAutoResponseRequest): Promise<void> =>
    apiRequest(`/api/v1/whatsapp/auto-response/test/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Contact Management API
export const contactsApi = {
  create: (data: CreateContactRequest): Promise<Contact> =>
    apiRequest('/api/v1/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: (): Promise<Contact[]> =>
    apiRequest('/api/v1/contact'),

  update: (contactId: string, data: UpdateContactRequest): Promise<Contact> =>
    apiRequest(`/api/v1/contact/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (userId: string, contactId: string): Promise<void> =>
    apiRequest(`/api/v1/contact/user/${userId}/${contactId}`, {
      method: 'DELETE',
    }),

  getByPhone: (phone: string): Promise<Contact> =>
    apiRequest(`/api/v1/contact/phone/${phone}`),

  getMessages: (phone: string): Promise<ContactMessage[]> =>
    apiRequest(`/api/v1/contact/messages/${phone}`),

  updateWaitingMessages: (phone: string): Promise<void> =>
    apiRequest(`/api/v1/contact/actualizar-estados/${phone}`, {
      method: 'PUT',
    }),

  toggleIA: (phone: string, ia: boolean): Promise<Contact> =>
    apiRequest(`/api/v1/contact/cambiar-ia/${phone}`, {
      method: 'PATCH',
      body: JSON.stringify({ ia }),
    }),
};

// Course Management API
export const coursesApi = {
  sync: (): Promise<void> =>
    apiRequest('/api/v1/curso/sincronizar', {
      method: 'POST',
    }),

  list: (): Promise<Course[]> =>
    apiRequest('/api/v1/curso'),

  get: (courseId: string): Promise<Course> =>
    apiRequest(`/api/v1/curso/${courseId}`),

  update: (courseId: string, data: UpdateCourseRequest): Promise<Course> =>
    apiRequest(`/api/v1/curso/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (courseId: string): Promise<void> =>
    apiRequest(`/api/v1/curso/${courseId}`, {
      method: 'DELETE',
    }),

  getActive: (): Promise<Course[]> =>
    apiRequest('/api/v1/curso/estado/activo'),
};

// Learning Content API
export const learningApi = {
  create: (data: CreateLearningContentRequest): Promise<LearningContent> =>
    apiRequest('/api/v1/aprendizaje', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: (): Promise<LearningContent[]> =>
    apiRequest('/api/v1/aprendizaje'),

  get: (id: string): Promise<LearningContent> =>
    apiRequest(`/api/v1/aprendizaje/${id}`),

  update: (id: string, data: UpdateLearningContentRequest): Promise<LearningContent> =>
    apiRequest(`/api/v1/aprendizaje/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiRequest(`/api/v1/aprendizaje/${id}`, {
      method: 'DELETE',
    }),

  getActive: (): Promise<LearningContent[]> =>
    apiRequest('/api/v1/aprendizaje/estado/activo'),
};

// AI RAG System API
export const aiApi = {
  ragQuery: (data: RAGQueryRequest): Promise<RAGResponse> =>
    apiRequest('/api/v1/ia/rag/query', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  ragChat: (data: RAGChatRequest): Promise<RAGResponse> =>
    apiRequest('/api/v1/ia/rag/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  ollamaChat: (data: OllamaChatRequest): Promise<RAGResponse> =>
    apiRequest('/api/v1/ia/ollama/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  health: (): Promise<{ status: string }> =>
    apiRequest('/api/v1/ia/health'),

  listModels: (): Promise<OllamaModel[]> =>
    apiRequest('/api/v1/ia/ollama/models'),

  createVectorDB: (): Promise<void> =>
    apiRequest('/api/v1/ia/rag/create-vector-db', {
      method: 'POST',
    }),

  verifyVectorDB: (): Promise<{ valid: boolean }> =>
    apiRequest('/api/v1/ia/rag/verify-db'),

  getMetrics: (): Promise<AIMetrics> =>
    apiRequest('/api/v1/ia/metrics'),
};

// Dashboard API
export const dashboardApi = {
  getOverview: (): Promise<DashboardOverview> =>
    apiRequest('/api/v1/dashboard/overview'),

  getWhatsAppStats: (): Promise<WhatsAppStats> =>
    apiRequest('/api/v1/dashboard/whatsapp/stats'),

  getContactStats: (): Promise<ContactStats> =>
    apiRequest('/api/v1/dashboard/contacts/stats'),

  getMessageStats: (): Promise<MessageStats> =>
    apiRequest('/api/v1/dashboard/messages/stats'),

  getCourseStats: (): Promise<CourseStats> =>
    apiRequest('/api/v1/dashboard/courses/stats'),

  getMessageTrends: (days: number = 30): Promise<MessageTrend[]> =>
    apiRequest(`/api/v1/dashboard/messages/trends?days=${days}`),

  getContactGrowth: (days: number = 30): Promise<ContactGrowth[]> =>
    apiRequest(`/api/v1/dashboard/contacts/growth?days=${days}`),

  getSessionActivity: (days: number = 7): Promise<SessionActivity[]> =>
    apiRequest(`/api/v1/dashboard/sessions/activity?days=${days}`),

  getRealtimeStats: (): Promise<RealtimeStats> =>
    apiRequest('/api/v1/dashboard/realtime'),

  getTopContacts: (limit: number = 10): Promise<TopContact[]> =>
    apiRequest(`/api/v1/dashboard/contacts/top?limit=${limit}`),

  getTopGroups: (limit: number = 10): Promise<TopGroup[]> =>
    apiRequest(`/api/v1/dashboard/groups/top?limit=${limit}`),

  getPerformanceMetrics: (): Promise<PerformanceMetrics> =>
    apiRequest('/api/v1/dashboard/performance'),

  getDashboardCards: (): Promise<DashboardCard[]> =>
    apiRequest('/api/v1/dashboard/cards/overview'),

  getMessageDistribution: (): Promise<MessageDistribution> =>
    apiRequest('/api/v1/dashboard/charts/messages-distribution'),

  getLeadsFunnel: (): Promise<LeadsFunnel> =>
    apiRequest('/api/v1/dashboard/charts/leads-funnel'),
};

// Seeder API
export const seederApi = {
  run: (): Promise<void> =>
    apiRequest('/api/v1/seeder/seed', {
      method: 'POST',
    }),

  getStatus: (): Promise<SeederStatus> =>
    apiRequest('/api/v1/seeder/status'),
};