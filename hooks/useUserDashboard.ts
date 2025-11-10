// hooks/useUserDashboard.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface DashboardOverview {
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

interface WhatsAppStats {
  totalSessions: number;
  connectedSessions: number;
  totalMessages: number;
  messagesToday: number;
  autoResponses: number;
  autoResponsesToday: number;
}

interface ContactStats {
  totalContacts: number;
  activeContacts: number;
  contactsWithIA: number;
  contactsByState: Record<string, number>;
}

interface MessageStats {
  totalMessages: number;
  messagesToday: number;
  messagesThisWeek: number;
  messagesThisMonth: number;
  averageMessagesPerDay: number;
}

interface MessageTrend {
  date: string;
  count: number;
}

interface ContactGrowth {
  date: string;
  newContacts: number;
  totalContacts: number;
}

interface SessionActivity {
  sessionId: string;
  phoneNumber: string;
  messagesToday: number;
  lastActivity: string;
  status: string;
}

interface RealtimeStats {
  activeConnections: number;
  messagesPerMinute: number;
  newContactsToday: number;
  systemLoad: number;
}

interface TopContact {
  id: string;
  name: string;
  phone: string;
  messageCount: number;
  lastMessage: string;
}

interface TopGroup {
  id: string;
  name: string;
  memberCount: number;
  messageCount: number;
  lastMessage: string;
}

interface PerformanceMetrics {
  apiResponseTime: number;
  databaseQueryTime: number;
  websocketLatency: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface DashboardCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: string;
}

interface MessageDistribution {
  private: number;
  group: number;
  autoResponse: number;
  manual: number;
}

interface LeadsFunnel {
  totalContacts: number;
  frio: number;
  tibio: number;
  caliente: number;
  cerrado: number;
}

export const useUserDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [whatsappStats, setWhatsappStats] = useState<WhatsAppStats | null>(null);
  const [contactStats, setContactStats] = useState<ContactStats | null>(null);
  const [messageStats, setMessageStats] = useState<MessageStats | null>(null);

  const getAuthToken = () => localStorage.getItem('auth_token');
  const getApiUrl = (endpoint: string) => `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}${endpoint}`;

  const loadOverview = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/dashboard/overview'), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard overview');
      }

      const data = await response.json();
      setOverview(data);
      return data;
    } catch (error) {
      toast.error('Failed to load dashboard overview');
      throw error;
    }
  }, []);

  const loadWhatsAppStats = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/dashboard/whatsapp/stats'), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load WhatsApp stats');
      }

      const data = await response.json();
      setWhatsappStats(data);
      return data;
    } catch (error) {
      toast.error('Failed to load WhatsApp stats');
      throw error;
    }
  }, []);

  const loadContactStats = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/dashboard/contacts/stats'), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load contact stats');
      }

      const data = await response.json();
      setContactStats(data);
      return data;
    } catch (error) {
      toast.error('Failed to load contact stats');
      throw error;
    }
  }, []);

  const loadMessageStats = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/dashboard/messages/stats'), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load message stats');
      }

      const data = await response.json();
      setMessageStats(data);
      return data;
    } catch (error) {
      toast.error('Failed to load message stats');
      throw error;
    }
  }, []);

  const loadMessageTrends = useCallback(async (days: number = 30) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/dashboard/messages/trends?days=${days}`), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load message trends');
      }

      return await response.json();
    } catch (error) {
      toast.error('Failed to load message trends');
      throw error;
    }
  }, []);

  const loadContactGrowth = useCallback(async (days: number = 30) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/dashboard/contacts/growth?days=${days}`), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load contact growth');
      }

      return await response.json();
    } catch (error) {
      toast.error('Failed to load contact growth');
      throw error;
    }
  }, []);

  const loadSessionActivity = useCallback(async (days: number = 7) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/dashboard/sessions/activity?days=${days}`), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load session activity');
      }

      return await response.json();
    } catch (error) {
      toast.error('Failed to load session activity');
      throw error;
    }
  }, []);

  const loadRealtimeStats = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/dashboard/realtime'), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load realtime stats');
      }

      return await response.json();
    } catch (error) {
      toast.error('Failed to load realtime stats');
      throw error;
    }
  }, []);

  const loadTopContacts = useCallback(async (limit: number = 10) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/dashboard/contacts/top?limit=${limit}`), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load top contacts');
      }

      return await response.json();
    } catch (error) {
      toast.error('Failed to load top contacts');
      throw error;
    }
  }, []);

  const loadTopGroups = useCallback(async (limit: number = 10) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/dashboard/groups/top?limit=${limit}`), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load top groups');
      }

      return await response.json();
    } catch (error) {
      toast.error('Failed to load top groups');
      throw error;
    }
  }, []);

  const loadPerformanceMetrics = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/dashboard/performance'), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load performance metrics');
      }

      return await response.json();
    } catch (error) {
      toast.error('Failed to load performance metrics');
      throw error;
    }
  }, []);

  const loadDashboardCards = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/dashboard/cards/overview'), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load dashboard cards');
      }

      return await response.json();
    } catch (error) {
      toast.error('Failed to load dashboard cards');
      throw error;
    }
  }, []);

  const loadMessageDistribution = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/dashboard/charts/messages-distribution'), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load message distribution');
      }

      return await response.json();
    } catch (error) {
      toast.error('Failed to load message distribution');
      throw error;
    }
  }, []);

  const loadLeadsFunnel = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/dashboard/charts/leads-funnel'), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load leads funnel');
      }

      return await response.json();
    } catch (error) {
      toast.error('Failed to load leads funnel');
      throw error;
    }
  }, []);

  const loadAllStats = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadOverview(),
        loadWhatsAppStats(),
        loadContactStats(),
        loadMessageStats(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [loadOverview, loadWhatsAppStats, loadContactStats, loadMessageStats]);

  return {
    loading,
    overview,
    whatsappStats,
    contactStats,
    messageStats,
    loadOverview,
    loadWhatsAppStats,
    loadContactStats,
    loadMessageStats,
    loadMessageTrends,
    loadContactGrowth,
    loadSessionActivity,
    loadRealtimeStats,
    loadTopContacts,
    loadTopGroups,
    loadPerformanceMetrics,
    loadDashboardCards,
    loadMessageDistribution,
    loadLeadsFunnel,
    loadAllStats,
  };
};