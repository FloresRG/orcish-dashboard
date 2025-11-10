// hooks/useAdminLearning.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  LearningContent,
  CreateLearningContentRequest,
  UpdateLearningContentRequest,
} from '@/types/admin';
import { learningApi } from '@/lib/admin-api';

export const useAdminLearning = () => {
  const [learningContent, setLearningContent] = useState<LearningContent[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLearningContent = useCallback(async () => {
    try {
      setLoading(true);
      const data = await learningApi.list();
      setLearningContent(data);
    } catch (error) {
      toast.error('Failed to load learning content');
      console.error('Error loading learning content:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLearningContent = useCallback(async (data: CreateLearningContentRequest) => {
    try {
      const newContent = await learningApi.create(data);
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
      return await learningApi.get(id);
    } catch (error) {
      toast.error('Failed to get learning content');
      throw error;
    }
  }, []);

  const updateLearningContent = useCallback(async (id: string, data: UpdateLearningContentRequest) => {
    try {
      const updatedContent = await learningApi.update(id, data);
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
      await learningApi.delete(id);
      setLearningContent(prev => prev.filter(content => content.id !== id));
      toast.success('Learning content deleted successfully');
    } catch (error) {
      toast.error('Failed to delete learning content');
      throw error;
    }
  }, []);

  const getActiveLearningContent = useCallback(async () => {
    try {
      const activeContent = await learningApi.getActive();
      setLearningContent(activeContent);
      return activeContent;
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