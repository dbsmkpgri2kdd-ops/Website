'use client';

import React, { useEffect, useState } from 'react';
import { AIAssistant } from '@/components/ai/ai-assistant';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';

/**
 * ClientLayout v1.0
 * Menangani seluruh logika sisi klien untuk menghindari kesalahan hidrasi.
 * Termasuk registrasi Service Worker PWA dan komponen mengambang.
 */
export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Registrasi Service Worker PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  window.location.reload();
                }
              };
            }
          };
        }).catch(err => console.log('PWA: Registration failed', err));
      });
    }
  }, []);

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
