// hooks/useAdminAI.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  RAGQueryRequest,
  RAGChatRequest,
  OllamaChatRequest,
  RAGResponse,
  OllamaModel,
  AIMetrics,
} from '@/types/admin';
import { aiApi } from '@/lib/admin-api';

export const useAdminAI = () => {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [metrics, setMetrics] = useState<AIMetrics | null>(null);

  const ragQuery = useCallback(async (data: RAGQueryRequest) => {
    try {
      setLoading(true);
      return await aiApi.ragQuery(data);
    } catch (error) {
      toast.error('Failed to perform RAG query');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const ragChat = useCallback(async (data: RAGChatRequest) => {
    try {
      setLoading(true);
      return await aiApi.ragChat(data);
    } catch (error) {
      toast.error('Failed to perform RAG chat');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const ollamaChat = useCallback(async (data: OllamaChatRequest) => {
    try {
      setLoading(true);
      return await aiApi.ollamaChat(data);
    } catch (error) {
      toast.error('Failed to perform Ollama chat');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      return await aiApi.health();
    } catch (error) {
      toast.error('AI system health check failed');
      throw error;
    }
  }, []);

  const loadModels = useCallback(async () => {
    try {
      const data = await aiApi.listModels();
      setModels(data);
      return data;
    } catch (error) {
      toast.error('Failed to load AI models');
      throw error;
    }
  }, []);

  const createVectorDB = useCallback(async () => {
    try {
      setLoading(true);
      await aiApi.createVectorDB();
      toast.success('Vector database created successfully');
    } catch (error) {
      toast.error('Failed to create vector database');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyVectorDB = useCallback(async () => {
    try {
      return await aiApi.verifyVectorDB();
    } catch (error) {
      toast.error('Failed to verify vector database');
      throw error;
    }
  }, []);

  const loadMetrics = useCallback(async () => {
    try {
      const data = await aiApi.getMetrics();
      setMetrics(data);
      return data;
    } catch (error) {
      toast.error('Failed to load AI metrics');
      throw error;
    }
  }, []);

  return {
    loading,
    models,
    metrics,
    ragQuery,
    ragChat,
    ollamaChat,
    checkHealth,
    loadModels,
    createVectorDB,
    verifyVectorDB,
    loadMetrics,
  };
};