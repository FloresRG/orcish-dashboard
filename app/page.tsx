'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthData } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Layout, LogIn } from 'lucide-react';
import { User } from '@/types/auth';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    const { user: storedUser, token } = getAuthData();
    setUser(storedUser);

    // If we have a token but no cookie, set the cookie for middleware
    if (token && typeof window !== 'undefined') {
      document.cookie = `auth_token=${token}; path=/; max-age=86400`;
    }

    // Small delay to prevent flickering
    const timer = setTimeout(() => {
      setLoading(false);

      // If user is authenticated, redirect to role-specific dashboard
      if (storedUser) {
        switch (storedUser.role) {
          case 'admin':
            router.replace('/admin/dashboard');
            break;
          case 'usuario':
            router.replace('/dashboard');
            break;
          case 'invitado':
            router.replace('/guest/courses');
            break;
          default:
            router.replace('/dashboard');
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <div className="text-lg">Checking authentication...</div>
        </main>
      </div>
    );
  }

  // If user is authenticated, this won't render (redirected above)
  // If not authenticated, show the home page
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold mb-8">Home</h1>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          {user ? (
            <Button onClick={() => router.push('/dashboard')}>
              <Layout className="size-4" />
              Go to Dashboard
            </Button>
          ) : (
            <Button onClick={() => router.push('/login')}>
              <LogIn className="size-4" />
              Login
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
