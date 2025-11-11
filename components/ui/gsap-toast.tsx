// components/ui/gsap-toast.tsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface GSAPToastProps {
  message: string;
  type: 'success' | 'error' | 'default';
  duration?: number;
}

export function GSAPToast({ message, type = 'default', duration = 5000 }: GSAPToastProps) {
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toastRef.current) return;

    const el = toastRef.current;

    // Estado inicial: invisible y fuera de pantalla
    gsap.set(el, { x: 300, opacity: 0, scale: 0.95 });

    // Animación de entrada
    const enter = gsap.to(el, {
      x: 0,
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: 'expo.out',
    });

    // Auto-cierre después de `duration`
    const timer = setTimeout(() => {
      gsap.to(el, {
        opacity: 0,
        scale: 0.9,
        x: 300,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          // Opcional: dispara evento para eliminar del DOM
          el.remove();
        },
      });
    }, duration);

    // Cleanup
    return () => {
      enter.kill();
      clearTimeout(timer);
    };
  }, []);

  // Colores según el tipo (puedes ajustarlos a tu tema)
  const bgColor = type === 'success'
    ? 'bg-green-500/90 border-green-400'
    : type === 'error'
      ? 'bg-red-500/90 border-red-400'
      : 'bg-foreground/90 border-muted';

  return (
    <div
      ref={toastRef}
      className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm font-medium text-sm max-w-xs mx-4 flex items-center gap-2 transition-none`}
      style={{ transformOrigin: 'right' }}
    >
      {message}
    </div>
  );
}