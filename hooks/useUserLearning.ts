// hooks/useUserLearning.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface LearningContent {
  id: string;
  content: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateLearningContentRequest {
  content: string;
  estado: string;
}

interface UpdateLearningContentRequest {
  content?: string;
  estado?: string;
}

export const useUserLearning = () => {
  const [learningContent, setLearningContent] = useState<LearningContent[]>([]);
  const [loading, setLoading] = useState(false);

  const getAuthToken = () => localStorage.getItem('auth_token');
  const getApiUrl = (endpoint: string) => `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}${endpoint}`;

  const loadLearningContent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/v1/aprendizaje'), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load learning content');
      }

      const data = await response.json();
      setLearningContent(data);
      return data;
    } catch (error) {
      toast.error('Failed to load learning content');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createLearningContent = useCallback(async (data: CreateLearningContentRequest) => {
    try {
      const response = await fetch(getApiUrl('/api/v1/aprendizaje'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create learning content');
      }

      const newContent = await response.json();
      setLearningContent(prev => [...prev, newContent]);
      toast.success('Learning content created successfully');
      return newContent;
    } catch (error) {
      toast.error('Failed to create learning content');
      throw error;
    }
  }, []);

  const getLearningContent = useCallback(async (id: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/aprendizaje/${id}`), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get learning content');
      }

      return await response.json();
    } catch (error) {
      toast.error('Failed to get learning content');
      throw error;
    }
  }, []);

  const updateLearningContent = useCallback(async (id: string, data: UpdateLearningContentRequest) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/aprendizaje/${id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update learning content');
      }

      const updatedContent = await response.json();
      setLearningContent(prev => prev.map(content =>
        content.id === id ? updatedContent : content
      ));
      toast.success('Learning content updated successfully');
      return updatedContent;
    } catch (error) {
      toast.error('Failed to update learning content');
      throw error;
    }
  }, []);

  const deleteLearningContent = useCallback(async (id: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/aprendizaje/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete learning content');
      }

      setLearningContent(prev => prev.filter(content => content.id !== id));
      toast.success('Learning content deleted successfully');
    } catch (error) {
      toast.error('Failed to delete learning content');
      throw error;
    }
  }, []);

  const getActiveLearningContent = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/aprendizaje/estado/activo'), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load active learning content');
      }

      const data = await response.json();
      setLearningContent(data);
      return data;
    } catch (error) {
      toast.error('Failed to load active learning content');
      throw error;
    }
  }, []);

  return {
    learningContent,
    loading,
    loadLearningContent,
    createLearningContent,
    getLearningContent,
    updateLearningContent,
    deleteLearningContent,
    getActiveLearningContent,
  };
};