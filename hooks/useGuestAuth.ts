// hooks/useGuestAuth.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}

export const useGuestAuth = () => {
  const [loading, setLoading] = useState(false);

  const register = useCallback(async (data: RegisterRequest) => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const result: AuthResponse = await response.json();
      toast.success('Registration successful! Welcome to the system.');
      return result;
    } catch (error) {
      toast.error((error as Error).message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const result: AuthResponse = await response.json();
      toast.success('Login successful!');
      return result;
    } catch (error) {
      toast.error((error as Error).message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    register,
    login,
  };
};