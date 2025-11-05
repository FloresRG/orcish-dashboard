// app/actions/auth.ts
'use server';

import { login } from '@/lib/auth';
import { LoginCredentials } from '@/types/auth';
import { clearAuthData } from '@/lib/storage';
import { redirect } from 'next/navigation';

export async function loginAction(credentials: LoginCredentials) {
  try {
    const result = await login(credentials);
    // Aquí podrías establecer una sesión con next-auth o cookies
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: (error as Error).message };
  }
}

export async function logoutAction() {
  // Clear all authentication data
  clearAuthData();

  // Force redirect to home page
  redirect('/');
}