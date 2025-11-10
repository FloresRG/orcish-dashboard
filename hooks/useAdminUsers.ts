// hooks/useAdminUsers.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  AdminUser,
  CreateUserRequest,
  UpdateUserRequest,
  UserStats,
} from '@/types/admin';
import { adminUsersApi } from '@/lib/admin-api';

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);

  const loadUsers = useCallback(async (role?: string) => {
    try {
      setLoading(true);
      const data = await adminUsersApi.list(role);
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await adminUsersApi.getStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load user statistics');
      console.error('Error loading user stats:', error);
    }
  }, []);

  const createUser = useCallback(async (data: CreateUserRequest) => {
    try {
      const newUser = await adminUsersApi.create(data);
      setUsers(prev => [...prev, newUser]);
      toast.success('User created successfully');
      return newUser;
    } catch (error) {
      toast.error('Failed to create user');
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (userId: string, data: UpdateUserRequest) => {
    try {
      const updatedUser = await adminUsersApi.update(userId, data);
      setUsers(prev => prev.map(user =>
        user.id === userId ? updatedUser : user
      ));
      toast.success('User updated successfully');
      return updatedUser;
    } catch (error) {
      toast.error('Failed to update user');
      throw error;
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      await adminUsersApi.delete(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
      throw error;
    }
  }, []);

  const toggleUserStatus = useCallback(async (userId: string) => {
    try {
      const updatedUser = await adminUsersApi.toggleStatus(userId);
      setUsers(prev => prev.map(user =>
        user.id === userId ? updatedUser : user
      ));
      toast.success(`User ${updatedUser.isActive ? 'activated' : 'deactivated'}`);
      return updatedUser;
    } catch (error) {
      toast.error('Failed to toggle user status');
      throw error;
    }
  }, []);

  return {
    users,
    loading,
    stats,
    loadUsers,
    loadStats,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  };
};