// hooks/useAdminDashboard.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
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
} from '@/types/admin';
import { dashboardApi } from '@/lib/admin-api';

export const useAdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [whatsappStats, setWhatsappStats] = useState<WhatsAppStats | null>(null);
  const [contactStats, setContactStats] = useState<ContactStats | null>(null);
  const [messageStats, setMessageStats] = useState<MessageStats | null>(null);
  const [courseStats, setCourseStats] = useState<CourseStats | null>(null);

  const loadOverview = useCallback(async () => {
    try {
      const data = await dashboardApi.getOverview();
      setOverview(data);
      return data;
    } catch (error) {
      toast.error('Failed to load dashboard overview');
      throw error;
    }
  }, []);

  const loadWhatsAppStats = useCallback(async () => {
    try {
      const data = await dashboardApi.getWhatsAppStats();
      setWhatsappStats(data);
      return data;
    } catch (error) {
      toast.error('Failed to load WhatsApp stats');
      throw error;
    }
  }, []);

  const loadContactStats = useCallback(async () => {
    try {
      const data = await dashboardApi.getContactStats();
      setContactStats(data);
      return data;
    } catch (error) {
      toast.error('Failed to load contact stats');
      throw error;
    }
  }, []);

  const loadMessageStats = useCallback(async () => {
    try {
      const data = await dashboardApi.getMessageStats();
      setMessageStats(data);
      return data;
    } catch (error) {
      toast.error('Failed to load message stats');
      throw error;
    }
  }, []);

  const loadCourseStats = useCallback(async () => {
    try {
      const data = await dashboardApi.getCourseStats();
      setCourseStats(data);
      return data;
    } catch (error) {
      toast.error('Failed to load course stats');
      throw error;
    }
  }, []);

  const loadMessageTrends = useCallback(async (days: number = 30) => {
    try {
      return await dashboardApi.getMessageTrends(days);
    } catch (error) {
      toast.error('Failed to load message trends');
      throw error;
    }
  }, []);

  const loadContactGrowth = useCallback(async (days: number = 30) => {
    try {
      return await dashboardApi.getContactGrowth(days);
    } catch (error) {
      toast.error('Failed to load contact growth');
      throw error;
    }
  }, []);

  const loadSessionActivity = useCallback(async (days: number = 7) => {
    try {
      return await dashboardApi.getSessionActivity(days);
    } catch (error) {
      toast.error('Failed to load session activity');
      throw error;
    }
  }, []);

  const loadRealtimeStats = useCallback(async () => {
    try {
      return await dashboardApi.getRealtimeStats();
    } catch (error) {
      toast.error('Failed to load realtime stats');
      throw error;
    }
  }, []);

  const loadTopContacts = useCallback(async (limit: number = 10) => {
    try {
      return await dashboardApi.getTopContacts(limit);
    } catch (error) {
      toast.error('Failed to load top contacts');
      throw error;
    }
  }, []);

  const loadTopGroups = useCallback(async (limit: number = 10) => {
    try {
      return await dashboardApi.getTopGroups(limit);
    } catch (error) {
      toast.error('Failed to load top groups');
      throw error;
    }
  }, []);

  const loadPerformanceMetrics = useCallback(async () => {
    try {
      return await dashboardApi.getPerformanceMetrics();
    } catch (error) {
      toast.error('Failed to load performance metrics');
      throw error;
    }
  }, []);

  const loadDashboardCards = useCallback(async () => {
    try {
      return await dashboardApi.getDashboardCards();
    } catch (error) {
      toast.error('Failed to load dashboard cards');
      throw error;
    }
  }, []);

  const loadMessageDistribution = useCallback(async () => {
    try {
      return await dashboardApi.getMessageDistribution();
    } catch (error) {
      toast.error('Failed to load message distribution');
      throw error;
    }
  }, []);

  const loadLeadsFunnel = useCallback(async () => {
    try {
      return await dashboardApi.getLeadsFunnel();
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
        loadCourseStats(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [loadOverview, loadWhatsAppStats, loadContactStats, loadMessageStats, loadCourseStats]);

  return {
    loading,
    overview,
    whatsappStats,
    contactStats,
    messageStats,
    courseStats,
    loadOverview,
    loadWhatsAppStats,
    loadContactStats,
    loadMessageStats,
    loadCourseStats,
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