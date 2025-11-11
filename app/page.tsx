'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthData } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { LogIn, Sun, Moon } from 'lucide-react';
import { User } from '@/types/auth';
import { useTheme } from 'next-themes';
import { ThreeDMarquee } from '@/components/ui/shadcn-io/3d-marquee';
import gsap from 'gsap';
import Login2 from '@/app/login/page'; // ✅ Ruta correcta a componente

const marqueeImages = [
  "https://assets.aceternity.com/cloudinary_bkp/3d-card.png",
  "https://assets.aceternity.com/animated-modal.png",
  "https://assets.aceternity.com/animated-testimonials.webp",
  "https://assets.aceternity.com/cloudinary_bkp/Tooltip_luwy44.png",
  "https://assets.aceternity.com/github-globe.png",
  "https://assets.aceternity.com/glare-card.png",
  "https://assets.aceternity.com/layout-grid.png",
  "https://assets.aceternity.com/flip-text.png",
  "https://assets.aceternity.com/hero-highlight.png",
  "https://assets.aceternity.com/carousel.webp",
  "https://assets.aceternity.com/placeholders-and-vanish-input.png",
  "https://assets.aceternity.com/shooting-stars-and-stars-background.png",
  "https://assets.aceternity.com/signup-form.png",
  "https://assets.aceternity.com/cloudinary_bkp/stars_sxle3d.png",
  "https://assets.aceternity.com/spotlight-new.webp",
  "https://assets.aceternity.com/cloudinary_bkp/Spotlight_ar5jpr.png",
  "https://assets.aceternity.com/cloudinary_bkp/Parallax_Scroll_pzlatw_anfkh7.png",
  "https://assets.aceternity.com/tabs.png",
  "https://assets.aceternity.com/cloudinary_bkp/Tracing_Beam_npujte.png",
  "https://assets.aceternity.com/cloudinary_bkp/typewriter-effect.png",
  "https://assets.aceternity.com/glowing-effect.webp",
  "https://assets.aceternity.com/hover-border-gradient.png",
  "https://assets.aceternity.com/cloudinary_bkp/Infinite_Moving_Cards_evhzur.png",
  "https://assets.aceternity.com/cloudinary_bkp/Lamp_hlq3ln.png",
  "https://assets.aceternity.com/macbook-scroll.png",
  "https://assets.aceternity.com/cloudinary_bkp/Meteors_fye3ys.png",
  "https://assets.aceternity.com/cloudinary_bkp/Moving_Border_yn78lv.png",
  "https://assets.aceternity.com/multi-step-loader.png",
  "https://assets.aceternity.com/vortex.png",
  "https://assets.aceternity.com/wobble-card.png",
  "https://assets.aceternity.com/world-map.webp",
];

const getRedirectPath = (role?: string): string => {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'invitado': return '/guest/courses';
    case 'usuario':
    default: return '/dashboard';
  }
};

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  const gifRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const hasAnimatedIn = useRef(false);

  // Verificar autenticación al montar
  useEffect(() => {
    const { user: storedUser, token } = getAuthData();
    setUser(storedUser);

    if (token && typeof document !== 'undefined') {
      document.cookie = `auth_token=${token}; path=/; max-age=86400`;
    }

    const timer = setTimeout(() => {
      setLoading(false);
      if (storedUser) {
        router.replace(getRedirectPath(storedUser.role));
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  // Animación inicial del contenido
  useEffect(() => {
    if (loading || user || showLogin || hasAnimatedIn.current) return;

    const ctx = gsap.context(() => {
      if (gifRef.current && textRef.current) {
        gsap.set([gifRef.current, textRef.current], { opacity: 0, y: 40 });
        gsap.to([gifRef.current, textRef.current], {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
        });
        hasAnimatedIn.current = true;
      }
    });
    return () => ctx.revert();
  }, [loading, user, showLogin]);

  const handleLoginSuccess = (loggedInUser: User) => {
    router.push(getRedirectPath(loggedInUser.role));
  };

  const handleLoginClick = () => {
    setShowLogin(true);

    const ctx = gsap.context(() => {
      // Solo animamos el texto (¡no el GIF!)
      if (textRef.current) {
        gsap.to(textRef.current, {
          x: '-100%',
          opacity: 0,
          duration: 0.6,
          ease: 'power2.in',
        });
      }

      // Mostrar login desde la derecha
      if (loginRef.current) {
        gsap.set(loginRef.current, { x: '100%', opacity: 0 });
        gsap.to(loginRef.current, {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          delay: 0.2,
        });
      }
    });

    // Opcional: limpieza si se desmonta
    return () => ctx.revert();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Verificando autenticación...</p>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 z-0">
        <ThreeDMarquee images={marqueeImages} />
      </div>

      {/* Controles superiores */}
      <div className="absolute top-6 right-6 z-20 flex gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => document.documentElement.classList.toggle('dark')}
          className="bg-background/80 backdrop-blur-sm"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          onClick={handleLoginClick}
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Iniciar sesión
        </Button>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 h-full flex flex-col lg:flex-row">
        {/* GIF: siempre visible, nunca se mueve */}
        <div className="w-full lg:w-1/2 h-full">
          <div ref={gifRef} className="w-full h-full">
            <img
              src="/bot.gif"
              alt="Asistente Posgradin"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Texto de bienvenida: se anima y oculta */}
        <div
          ref={textRef}
          className={`w-full lg:w-1/2 h-full flex items-center justify-center px-8 transition-all duration-500 ${
            showLogin ? 'absolute opacity-0 pointer-events-none' : 'relative opacity-100'
          }`}
        >
          <div className="max-w-xl text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              ¡Bienvenido a{' '}
              <span className="bg-gradient-to-r from-[#2563eb] via-[#7e22ce] to-[#d97706] bg-clip-text text-transparent">
                Posgradin
              </span>
              !
            </h1>
            <p className="mt-6 text-lg text-foreground/90 max-w-md mx-auto lg:mx-0">
              Tu asistente inteligente para la gestión académica en posgrados.
            </p>
          </div>
        </div>

        {/* Login: aparece encima del área derecha */}
        {showLogin && (
          <div
            ref={loginRef}
            className="absolute top-0 right-0 w-full lg:w-1/2 h-screen z-20"
          >
            <Login2 onLoginSuccess={handleLoginSuccess} />
          </div>
        )}
      </div>
    </div>
  );
}