// hooks/useGuestHealth.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: string;
}

export const useGuestHealth = () => {
  const [loading, setLoading] = useState(false);

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/health');

      if (!response.ok) {
        throw new Error('Health check failed');
      }

      const data: HealthStatus = await response.json();
      return data;
    } catch (error) {
      toast.error('Health check failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    checkHealth,
  };
};