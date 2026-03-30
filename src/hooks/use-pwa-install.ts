
'use client';

import { useState, useEffect } from 'react';

/**
 * Hook untuk menangani event 'beforeinstallprompt' dari browser.
 * Digunakan untuk menampilkan UI kustom saat website terdeteksi dapat diinstal (PWA).
 */
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Cek apakah sudah terinstal
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      // Mencegah browser menampilkan prompt default secara otomatis
      e.preventDefault();
      // Simpan event untuk dipicu nanti via tombol UI kustom
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    // Tampilkan prompt instalasi browser
    installPrompt.prompt();

    // Tunggu pilihan pengguna
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  return {
    isInstallable: !!installPrompt && !isInstalled,
    handleInstall,
  };
}
