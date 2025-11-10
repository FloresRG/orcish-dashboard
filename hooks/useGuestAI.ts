// hooks/useGuestAI.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface RAGQueryRequest {
  query: string;
  max_documents?: number;
}

interface RAGResponse {
  question: string;
  answer: string;
  conversation_state: string;
  source_documents: Array<{
    content: string;
    score: number;
    metadata?: Record<string, unknown>;
  }>;
}

export const useGuestAI = () => {
  const [loading, setLoading] = useState(false);

  const getAuthToken = () => localStorage.getItem('auth_token');
  const getApiUrl = (endpoint: string) => `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}${endpoint}`;

  const ragQuery = useCallback(async (data: RAGQueryRequest) => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/v1/ia/rag/query'), {
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
      const response = await fetch(getApiUrl('/api/v1/ia/health'), {
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