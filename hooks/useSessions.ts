// hooks/useSessions.ts
import { useState, useEffect, useCallback } from 'react';
import { WhatsAppSession, getWhatsAppSessions } from '@/lib/whatsapp';
import { toast } from 'sonner';

export const useSessions = () => {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    console.log('🔄 useSessions: Loading WhatsApp sessions');
    try {
      setLoading(true);
      setError(null);

      const sessionsData = await getWhatsAppSessions();
      setSessions(sessionsData);

      console.log('📋 useSessions: Loaded', sessionsData.length, 'sessions');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sessions';
      console.error('❌ useSessions: Error loading sessions:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    loading,
    error,
    refetch: loadSessions,
  };
};