// hooks/useAdminCourses.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Course,
  UpdateCourseRequest,
} from '@/types/admin';
import { coursesApi } from '@/lib/admin-api';

export const useAdminCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const syncCourses = useCallback(async () => {
    try {
      setLoading(true);
      await coursesApi.sync();
      toast.success('Courses synchronized successfully');
      await loadCourses(); // Reload courses after sync
    } catch (error) {
      toast.error('Failed to sync courses');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await coursesApi.list();
      setCourses(data);
    } catch (error) {
      toast.error('Failed to load courses');
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCourse = useCallback(async (courseId: string) => {
    try {
      return await coursesApi.get(courseId);
    } catch (error) {
      toast.error('Failed to get course');
      throw error;
    }
  }, []);

  const updateCourse = useCallback(async (courseId: string, data: UpdateCourseRequest) => {
    try {
      const updatedCourse = await coursesApi.update(courseId, data);
      setCourses(prev => prev.map(course =>
        course.id === courseId ? updatedCourse : course
      ));
      toast.success('Course updated successfully');
      return updatedCourse;
    } catch (error) {
      toast.error('Failed to update course');
      throw error;
    }
  }, []);

  const deleteCourse = useCallback(async (courseId: string) => {
    try {
      await coursesApi.delete(courseId);
      setCourses(prev => prev.filter(course => course.id !== courseId));
      toast.success('Course deleted successfully');
    } catch (error) {
      toast.error('Failed to delete course');
      throw error;
    }
  }, []);

  const getActiveCourses = useCallback(async () => {
    try {
      const activeCourses = await coursesApi.getActive();
      setCourses(activeCourses);
      return activeCourses;
    } catch (error) {
      toast.error('Failed to load active courses');
      throw error;
    }
  }, []);

  return {
    courses,
    loading,
    syncCourses,
    loadCourses,
    getCourse,
    updateCourse,
    deleteCourse,
    getActiveCourses,
  };
};