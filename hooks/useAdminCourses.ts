// hooks/useAdminCourses.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
} from '@/types/admin';
import { coursesApi } from '@/lib/admin-api';

export const useAdminCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const syncCourses = useCallback(async () => {
    try {
      setLoading(true);
      const result = await coursesApi.sync();
      toast.success(result.message);
      await loadCourses(); // Reload courses after sync
      return result;
    } catch (error) {
      toast.error('Failed to sync courses');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCourses = useCallback(async (estado?: string) => {
    try {
      setLoading(true);
      const data = await coursesApi.list(estado);
      setCourses(data);
    } catch (error) {
      toast.error('Failed to load courses');
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCourse = useCallback(async (courseId: number) => {
    try {
      return await coursesApi.get(courseId);
    } catch (error) {
      toast.error('Failed to get course');
      throw error;
    }
  }, []);

  const createCourse = useCallback(async (data: CreateCourseRequest) => {
    try {
      const newCourse = await coursesApi.create(data);
      setCourses(prev => [...prev, newCourse]);
      toast.success('Course created successfully');
      return newCourse;
    } catch (error) {
      toast.error('Failed to create course');
      throw error;
    }
  }, []);

  const updateCourse = useCallback(async (courseId: number, data: UpdateCourseRequest) => {
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

  const patchCourse = useCallback(async (courseId: number, data: Partial<UpdateCourseRequest>) => {
    try {
      const updatedCourse = await coursesApi.patch(courseId, data);
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

  const deleteCourse = useCallback(async (courseId: number) => {
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

  const getCoursesByEstado = useCallback(async (estado: 'activo' | 'inactivo') => {
    try {
      const coursesByEstado = await coursesApi.getByEstado(estado);
      setCourses(coursesByEstado);
      return coursesByEstado;
    } catch (error) {
      toast.error(`Failed to load ${estado} courses`);
      throw error;
    }
  }, []);

  return {
    courses,
    loading,
    syncCourses,
    loadCourses,
    getCourse,
    createCourse,
    updateCourse,
    patchCourse,
    deleteCourse,
    getActiveCourses,
    getCoursesByEstado,
  };
};