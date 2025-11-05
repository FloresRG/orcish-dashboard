'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Brain } from 'lucide-react';
import { useState } from 'react';
import { login } from '@/lib/auth';
import { saveAuthData } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Login2Props {
  heading?: string;
  logo?: {
    url: string;
    src: string;
    alt: string;
    title?: string;
  };
  buttonText?: string;
  signupText?: string;
  signupUrl?: string;
  redirectAfterLogin?: string;
}

const Login2 = ({
  heading = 'Login',
  buttonText = 'Login',
  signupText = 'Need an account?',
  signupUrl = 'https://shadcnblocks.com',
  redirectAfterLogin = '/dashboard',
}: Login2Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login({ email, password });
      saveAuthData(response.user, response.token);
      toast.success('Login successful! Redirecting to dashboard...');
      router.push(redirectAfterLogin);
    } catch (err) {
      toast.error((err as Error).message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-muted flex flex-col md:flex-row">
      {/* Panel de login - Izquierda */}
      <div className="flex flex-col items-center justify-center p-6 w-full md:w-1/2">
        <div className="w-full max-w-sm">
          <div className="bg-background border border-muted rounded-md px-6 py-8 shadow-md flex flex-col gap-y-6">
            {heading && (
              <h1 className="text-xl font-semibold text-center">{heading}</h1>
            )}

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : buttonText}
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {signupText}{' '}
              <Link
                href={signupUrl}
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Panel de ícono (IA) - Derecha, solo en md+ */}
      <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-background">
        <div className="flex flex-col items-center text-center px-8">
          <Brain className="h-24 w-24 text-primary mb-6" />
          <h2 className="text-2xl font-bold mb-2">Powered by AI</h2>
          <p className="text-muted-foreground max-w-md">
            Intelligent automation, seamless experience, and secure access—all in one place.
          </p>
        </div>
      </div>
    </section>
  );
};

export default function LoginPage() {
  return (
    <Login2 />
  );
}