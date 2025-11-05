// lib/storage.ts
import { User } from '@/types/auth';

const USER_STORAGE_KEY = 'auth_user';
const TOKEN_STORAGE_KEY = 'auth_token';

export const saveAuthData = (user: User, token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_STORAGE_KEY, token);

    // Also save to cookies for middleware
    document.cookie = `${TOKEN_STORAGE_KEY}=${token}; path=/; max-age=86400`; // 24 hours
  }
};

export const getAuthData = (): { user: User | null; token: string | null } => {
  if (typeof window === 'undefined') return { user: null, token: null };

  try {
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const user = userStr ? (JSON.parse(userStr) as User) : null;
    return { user, token };
  } catch (e) {
    console.warn('Error al leer auth data del localStorage', e);
    return { user: null, token: null };
  }
};

export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);

    // Also clear cookies
    document.cookie = `${TOKEN_STORAGE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};