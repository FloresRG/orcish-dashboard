// hooks/useUserCourses.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Course } from '@/types/admin';

export const useUserCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const getAuthToken = () => localStorage.getItem('auth_token');
  const getApiUrl = (endpoint: string) => `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}${endpoint}`;

  const loadCourses = useCallback(async (estado?: string) => {
    try {
      setLoading(true);
      const params = estado ? `?estado=${estado}` : '';
      const response = await fetch(getApiUrl(`/api/v1/curso${params}`), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load courses');
      }

      const data = await response.json();
      setCourses(data);
      return data;
    } catch (error) {
      toast.error('Failed to load courses');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCourse = useCallback(async (courseId: number) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/curso/${courseId}`), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get course');
      }

      return await response.json();
    } catch (error) {
      toast.error('Failed to get course');
      throw error;
    }
  }, []);

  const getActiveCourses = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/curso/estado/activo'), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load active courses');
      }

      const data = await response.json();
      setCourses(data);
      return data;
    } catch (error) {
      toast.error('Failed to load active courses');
      throw error;
    }
  }, []);

  const getCoursesByEstado = useCallback(async (estado: 'activo' | 'inactivo') => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/curso/estado/${estado}`), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load ${estado} courses`);
      }

      const data = await response.json();
      setCourses(data);
      return data;
    } catch (error) {
      toast.error(`Failed to load ${estado} courses`);
      throw error;
    }
  }, []);

  return {
    courses,
    loading,
    loadCourses,
    getCourse,
    getActiveCourses,
    getCoursesByEstado,
  };
};