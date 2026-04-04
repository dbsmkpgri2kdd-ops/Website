'use client';

import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Cek apakah aplikasi sudah terinstall
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true ||
                          window.location.search.includes('standalone=true');

      // Cek juga di localStorage untuk tracking manual install
      const manuallyInstalled = localStorage.getItem('pwa-installed') === 'true';

      const installed = isStandalone || manuallyInstalled;
      setIsInstalled(installed);

      console.log('[PWA] Install status check:', { isStandalone, manuallyInstalled, installed });
      return installed;
    };

    // Cek status awal
    const alreadyInstalled = checkInstalled();

    const beforeInstallHandler = (e: any) => {
      console.log('[PWA] Before install prompt triggered');
      // Cegah default prompt browser agar bisa custom
      e.preventDefault();
      // Simpan event untuk dipicu manual
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    const appInstalledHandler = () => {
      console.log('[PWA] App installed event');
      setIsInstalled(true);
      setInstallPrompt(null);
      setIsInstallable(false);
      // Simpan status di localStorage
      localStorage.setItem('pwa-installed', 'true');
    };

    // Tambahkan event listeners
    window.addEventListener('beforeinstallprompt', beforeInstallHandler);
    window.addEventListener('appinstalled', appInstalledHandler);

    // Cek ulang status setiap 1 detik selama 10 detik pertama
    // untuk mendeteksi perubahan display mode
    let checkCount = 0;
    const checkInterval = setInterval(() => {
      checkCount++;
      if (checkCount > 10) {
        clearInterval(checkInterval);
        return;
      }
      checkInstalled();
    }, 1000);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
      window.removeEventListener('appinstalled', appInstalledHandler);
      clearInterval(checkInterval);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      console.warn('[PWA] No install prompt available');
      return;
    }

    try {
      console.log('[PWA] Showing install prompt');
      // Tampilkan prompt bawaan browser
      installPrompt.prompt();

      // Tunggu respon pengguna
      const { outcome } = await installPrompt.userChoice;
      console.log('[PWA] Install outcome:', outcome);

      if (outcome === 'accepted') {
        setInstallPrompt(null);
        setIsInstallable(false);
        // Status installed akan diupdate oleh event listener appinstalled
      } else {
        // User menolak, tetap bisa dicoba lagi
        setIsInstallable(true);
      }
    } catch (error) {
      console.error('[PWA] Install failed:', error);
    }
  };

  return {
    isInstallable: isInstallable && !isInstalled,
    isInstalled,
    handleInstall,
  };
}
