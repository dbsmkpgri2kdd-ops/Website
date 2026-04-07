'use client';

import React, { useEffect, useState } from 'react';
import { AIAssistant } from '@/components/ai/ai-assistant';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { PWAUpdateNotification } from '@/components/pwa-update-notification';
import { useToast } from '@/hooks/use-toast';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    
    // Registrasi Service Worker PWA dengan Logika Auto-Update Proaktif
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
          console.log('[PWA] Service Worker registered');

          // Cek pembaruan setiap 15 menit (lebih sering untuk update yang lebih cepat)
          setInterval(() => {
            registration.update();
          }, 1000 * 60 * 15);

          // Listen untuk update yang ditemukan
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              console.log('[PWA] New version found, installing...');
              
              newWorker.addEventListener('statechange', () => {
                console.log('[PWA] Worker state:', newWorker.state);
                
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Versi baru ditemukan dan terpasang
                  console.log('[PWA] New version installed, dispatching update event');
                  
                  // Dispatch custom event untuk menampilkan notifikasi update
                  window.dispatchEvent(new CustomEvent('pwa-update-available'));
                } else if (newWorker.state === 'installed' && !navigator.serviceWorker.controller) {
                  // PWA baru pertama kali diinstall
                  console.log('[PWA] PWA installed for first time');
                }
              });
            }
          });

          // Cek update saat aplikasi dimuat
          registration.update();
          
          // Listen untuk update yang diterima user
          const handleUpdateAccepted = () => {
            console.log('[PWA] Update accepted by user, skipping waiting...');
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
          };

          window.addEventListener('pwa-update-accepted', handleUpdateAccepted);
          
        }).catch(err => {
          console.error('[PWA] Registration failed:', err);
        });
      });

      // Menangani pergantian controller (setelah skipWaiting)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('[PWA] Controller changed, reloading...');
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
          <PWAUpdateNotification />
        </>
      )}
    </>
  );
}
