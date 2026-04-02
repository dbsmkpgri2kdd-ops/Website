'use client';

import React, { useEffect, useState } from 'react';
import { AIAssistant } from '@/components/ai/ai-assistant';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { useToast } from '@/hooks/use-toast';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    
    // Registrasi Service Worker PWA dengan Logika Auto-Update Proaktif
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
          // Cek pembaruan berkala (setiap 30 menit)
          setInterval(() => {
            registration.update();
          }, 1000 * 60 * 30);

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Versi baru ditemukan dan terpasang
                  toast({
                    title: "Pembaruan Sistem",
                    description: "Versi terbaru sedang diterapkan. Aplikasi akan dimuat ulang.",
                  });
                  setTimeout(() => {
                    window.location.reload();
                  }, 2000);
                }
              });
            }
          });
        }).catch(err => console.log('PWA: Registration failed', err));
      });

      // Menangani pergantian controller (setelah skipWaiting)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, [toast]);

  return (
    <>
      {children}
      {mounted && (
        <>
          <AIAssistant />
          <PWAInstallPrompt />
        </>
      )}
    </>
  );
}
