// hooks/useUserProfile.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  sessionsCount: number;
}

interface UpdateProfileRequest {
  name?: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const getApiUrl = (endpoint: string) => `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}${endpoint}`;

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/v1/users/profile'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get profile');
      }

      const data = await response.json();
      setProfile(data);
      return data;
    } catch (error) {
      toast.error('Failed to load profile');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/v1/users/profile'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      toast.success('Profile updated successfully');
      return updatedProfile;
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profile,
    loading,
    getProfile,
    updateProfile,
  };
};