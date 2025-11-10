// hooks/useAdminWhatsApp.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  WhatsAppSession,
  CreateSessionRequest,
  QRCodeResponse,
  SessionStatusResponse,
  AutoResponseConfig,
  AutoResponseStats,
  TestAutoResponseRequest,
} from '@/types/admin';
import { whatsappApi } from '@/lib/admin-api';

export const useAdminWhatsApp = () => {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<WhatsAppSession | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await whatsappApi.listSessions();
      setSessions(data);
    } catch (error) {
      toast.error('Failed to load WhatsApp sessions');
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = useCallback(async (data: CreateSessionRequest) => {
    try {
      setLoading(true);
      const response = await whatsappApi.createSession(data);
      toast.success('Session created successfully');
      await loadSessions(); // Reload sessions
      return response;
    } catch (error) {
      toast.error('Failed to create session');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadSessions]);

  const getQRCode = useCallback(async (sessionId: string) => {
    try {
      const response = await whatsappApi.getQR(sessionId);
      setQrCode(response.qrCode);
      return response;
    } catch (error) {
      toast.error('Failed to get QR code');
      throw error;
    }
  }, []);

  const getSessionStatus = useCallback(async (sessionId: string) => {
    try {
      const response = await whatsappApi.getStatus(sessionId);
      // Update session in list
      setSessions(prev => prev.map(session =>
        session.id === sessionId
          ? { ...session, status: response.status as WhatsAppSession['status'], lastConnection: response.lastConnection }
          : session
      ));
      return response;
    } catch (error) {
      toast.error('Failed to get session status');
      throw error;
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await whatsappApi.deleteSession(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Session deleted successfully');
    } catch (error) {
      toast.error('Failed to delete session');
      throw error;
    }
  }, []);

  const updateAutoResponse = useCallback(async (sessionId: string, config: AutoResponseConfig) => {
    try {
      await whatsappApi.updateAutoResponse(sessionId, config);
      // Update session in list
      setSessions(prev => prev.map(session =>
        session.id === sessionId
          ? {
              ...session,
              privateResponseMessage: config.privateMessage,
              groupResponseMessage: config.groupMessage,
              autoResponseEnabled: config.enabled
            }
          : session
      ));
      toast.success('Auto-response updated successfully');
    } catch (error) {
      toast.error('Failed to update auto-response');
      throw error;
    }
  }, []);

  const getAutoResponseStats = useCallback(async (sessionId: string) => {
    try {
      return await whatsappApi.getAutoResponseStats(sessionId);
    } catch (error) {
      toast.error('Failed to get auto-response stats');
      throw error;
    }
  }, []);

  const toggleAutoResponse = useCallback(async (sessionId: string, enabled: boolean) => {
    try {
      await whatsappApi.toggleAutoResponse(sessionId, enabled);
      // Update session in list
      setSessions(prev => prev.map(session =>
        session.id === sessionId
          ? { ...session, autoResponseEnabled: enabled }
          : session
      ));
      toast.success(`Auto-response ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to toggle auto-response');
      throw error;
    }
  }, []);

  const testAutoResponse = useCallback(async (sessionId: string, data: TestAutoResponseRequest) => {
    try {
      await whatsappApi.testAutoResponse(sessionId, data);
      toast.success('Test message sent successfully');
    } catch (error) {
      toast.error('Failed to send test message');
      throw error;
    }
  }, []);

  return {
    sessions,
    loading,
    qrCode,
    currentSession,
    loadSessions,
    createSession,
    getQRCode,
    getSessionStatus,
    deleteSession,
    updateAutoResponse,
    getAutoResponseStats,
    toggleAutoResponse,
    testAutoResponse,
    setCurrentSession,
  };
};