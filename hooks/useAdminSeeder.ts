// hooks/useAdminSeeder.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { SeederStatus } from '@/types/admin';
import { seederApi } from '@/lib/admin-api';

export const useAdminSeeder = () => {
  const [loading, setLoading] = useState(false);
  const [seederStatus, setSeederStatus] = useState<SeederStatus | null>(null);

  const runSeeder = useCallback(async () => {
    try {
      setLoading(true);
      await seederApi.run();
      toast.success('Seeder executed successfully');
      await checkStatus(); // Check status after running
    } catch (error) {
      toast.error('Failed to run seeder');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const status = await seederApi.getStatus();
      setSeederStatus(status);
      return status;
    } catch (error) {
      toast.error('Failed to check seeder status');
      throw error;
    }
  }, []);

  return {
    loading,
    seederStatus,
    runSeeder,
    checkStatus,
  };
};