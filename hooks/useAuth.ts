// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { User } from '@/types/auth';
import { getAuthData } from '@/lib/storage';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Small delay to prevent flickering
    const timer = setTimeout(() => {
      const { user: storedUser } = getAuthData();
      setUser(storedUser);
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return { user, loading };
};