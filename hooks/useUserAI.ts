// hooks/useUserAI.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface RAGQueryRequest {
  query: string;
  conversation_history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  max_documents?: number;
}

interface RAGResponse {
  answer: string;
  sources: Array<{
    content: string;
    score: number;
    metadata?: Record<string, unknown>;
  }>;
  conversation_id?: string;
}

export const useUserAI = () => {
  const [loading, setLoading] = useState(false);

  const getAuthToken = () => localStorage.getItem('auth_token');

  const ragQuery = useCallback(async (data: RAGQueryRequest) => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/ia/rag/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to perform RAG query');
      }

      return await response.json();
    } catch (error) {
      toast.error('Failed to perform RAG query');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/ia/health', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('AI system health check failed');
      }

      return await response.json();
    } catch (error) {
      toast.error('AI system health check failed');
      throw error;
    }
  }, []);

  return {
    loading,
    ragQuery,
    checkHealth,
  };
};