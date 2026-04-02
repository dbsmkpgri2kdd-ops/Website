'use client';

import { useState, useEffect } from 'react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, SmartphoneIcon, ShieldCheck } from 'lucide-react';

/**
 * PWA Install Prompt v7.5.
 * Menampilkan instruksi instalasi dengan estetika Android Native yang sangat padat.
 * Kepatuhan: Standard Case & Zero Italics.
 */
export function PWAInstallPrompt() {
  const { isInstallable, handleInstall } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Tampilkan prompt setelah 5 detik jika terdeteksi dapat diinstal
    if (isInstallable && !isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isDismissed]);

  const onDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  const onInstallClick = async () => {
    await handleInstall();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[70] md:left-auto md:right-8 md:w-[380px] animate-reveal">
      <Card className="glass-premium border-primary/20 overflow-hidden rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(56,102,65,0.3)] bg-white/95 backdrop-blur-3xl border-2">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_10px_hsl(var(--primary))]"></div>
        <CardContent className="p-6">
          <div className="flex gap-5">
            <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-xl relative overflow-hidden">
              <div className='absolute inset-0 bg-white/10 animate-pulse'></div>
              <SmartphoneIcon size={28} className="relative z-10" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className='flex items-center gap-2'>
                    <ShieldCheck size={12} className='text-primary' />
                    <h4 className="font-black uppercase text-[9px] tracking-[0.2em] text-slate-900">Digital Experience</h4>
                </div>
                <button onClick={onDismiss} className="text-slate-400 hover:text-primary transition-colors p-1" aria-label="Tutup">
                  <X size={16} />
                </button>
              </div>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
                Instal <span className='text-primary font-black'>SMK PRIDA</span> ke layar utama untuk akses layanan akademik yang lebih stabil.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button 
              onClick={onDismiss}
              className="rounded-xl h-12 font-black text-[9px] uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-all"
            >
              Nanti saja
            </button>
            <Button 
              onClick={onInstallClick}
              className="rounded-xl h-12 font-black text-[9px] uppercase tracking-[0.2em] shadow-lg glow-primary bg-primary text-white hover:bg-primary/90 transition-all"
            >
              <Download size={14} className="mr-2" /> Pasang sekarang
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
