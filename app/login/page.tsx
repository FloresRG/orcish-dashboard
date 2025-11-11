'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState } from 'react';
import { login } from '@/lib/auth';
import { saveAuthData } from '@/lib/storage';
import { toast } from 'sonner';
import { User } from '@/types/auth';

interface Login2Props {
  heading?: string;
  buttonText?: string;
  signupText?: string;
  signupUrl?: string;
  onLoginSuccess?: (user: User) => void;
}

const Login2 = ({
  heading = 'Iniciar sesión',
  buttonText = 'Iniciar sesión',
  signupText = '¿No tienes cuenta?',
  signupUrl = '/signup',
  onLoginSuccess,
}: Login2Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login({ email, password });
      const { user, token } = response;

      saveAuthData(user, token);

      if (typeof document !== 'undefined') {
        document.cookie = `auth_token=${token}; path=/; max-age=86400`;
      }

      toast.success('¡Inicio de sesión exitoso!');

      if (onLoginSuccess) {
        onLoginSuccess(user);
      } else {
        const redirectPath = getRedirectPath(user.role);
        window.location.href = redirectPath;
      }
    } catch (err) {
      toast.error((err as Error).message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  const getRedirectPath = (role?: string): string => {
    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'invitado': return '/guest/courses';
      case 'usuario':
      default: return '/dashboard';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 sm:p-6 w-full lg:w-1/2">
      <div className="w-full max-w-lg">
        <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-xl px-8 py-10 shadow-xl flex flex-col gap-y-6 transition-all duration-300 hover:shadow-2xl">
          {heading && (
            <h1 className="text-2xl font-bold text-center text-foreground">
              {heading}
            </h1>
          )}

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-foreground"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <Label htmlFor="password" className="text-foreground font-medium">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-foreground"
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2 py-6 text-base font-semibold"
              disabled={loading}
            >
              {loading ? 'Iniciando...' : buttonText}
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {signupText}{' '}
            <Link href={signupUrl} className="text-primary font-semibold hover:underline transition-colors">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login2;