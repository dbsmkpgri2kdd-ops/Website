'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, X, Download, CheckCircle } from 'lucide-react';

/**
 * PWA Update Notification Component
 * Menampilkan notifikasi ketika ada update PWA tersedia
 */
export function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Listen untuk custom event dari service worker
    const handleUpdateAvailable = () => {
      console.log('[PWA] Update available, showing notification');
      setShowUpdate(true);
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = () => {
    setIsUpdating(true);

    // Dispatch event untuk service worker
    window.dispatchEvent(new CustomEvent('pwa-update-accepted'));

    // Reload setelah 2 detik
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    // Simpan preference untuk tidak menampilkan lagi sampai reload berikutnya
    localStorage.setItem('pwa-update-dismissed', Date.now().toString());
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-24 left-4 right-4 z-[80] md:left-auto md:right-8 md:w-[380px] animate-reveal">
      <Card className="glass-premium border-amber-500/20 overflow-hidden rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(245,158,11,0.3)] bg-white/95 backdrop-blur-3xl border-2">
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 shadow-[0_0_10px_rgb(245,158,11)]"></div>
        <CardContent className="p-6">
          <div className="flex gap-5">
            <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-xl relative overflow-hidden">
              <div className='absolute inset-0 bg-white/10 animate-pulse'></div>
              {isUpdating ? (
                <CheckCircle size={28} className="relative z-10 animate-bounce" />
              ) : (
                <RefreshCw size={28} className="relative z-10" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className='flex items-center gap-2'>
                    <CheckCircle size={12} className='text-amber-600' />
                    <h4 className="font-black uppercase text-[9px] tracking-[0.2em] text-slate-900">
                      {isUpdating ? 'Memperbarui...' : 'Update Tersedia'}
                    </h4>
                </div>
                <button onClick={handleDismiss} className="text-slate-400 hover:text-amber-600 transition-colors p-1" aria-label="Tutup">
                  <X size={16} />
                </button>
              </div>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
                {isUpdating ? (
                  'Sedang memperbarui aplikasi ke versi terbaru...'
                ) : (
                  <>
                    Versi terbaru <span className='text-amber-600 font-black'>SMK PRIDA</span> tersedia dengan fitur dan perbaikan terbaru.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={handleDismiss}
              disabled={isUpdating}
              className="rounded-xl h-12 font-black text-[9px] uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Nanti saja
            </button>
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="rounded-xl h-12 font-black text-[9px] uppercase tracking-[0.2em] shadow-lg bg-amber-500 text-white hover:bg-amber-600 transition-all disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <CheckCircle size={14} className="mr-2 animate-spin" /> Memperbarui...
                </>
              ) : (
                <>
                  <Download size={14} className="mr-2" /> Update sekarang
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}