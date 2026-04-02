'use client';

import { useState, useEffect } from 'react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, SmartphoneIcon, Sparkles, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * PWA Install Prompt v7.5.
 * Menampilkan instruksi instalasi dengan estetika Android Native.
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
    <div className="fixed bottom-24 left-4 right-4 z-[70] md:left-auto md:right-8 md:w-[400px] animate-reveal">
      <Card className="glass-premium border-primary/20 overflow-hidden rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(56,102,65,0.3)] bg-white/90 backdrop-blur-3xl border-2">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary shadow-[0_0_15px_hsl(var(--primary))]"></div>
        <CardContent className="p-8">
          <div className="flex gap-6">
            <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-xl relative overflow-hidden group">
              <div className='absolute inset-0 bg-white/10 animate-pulse'></div>
              <SmartphoneIcon size={32} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className='flex items-center gap-2'>
                    <ShieldCheck size={14} className='text-primary animate-pulse' />
                    <h4 className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-900">App Experience</h4>
                </div>
                <button onClick={onDismiss} className="text-slate-400 hover:text-primary transition-colors p-1" aria-label="Tutup">
                  <X size={18} />
                </button>
              </div>
              <p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
                Instal portal resmi <span className='text-primary font-black'>SMK PRIDA</span> untuk akses layanan akademik yang lebih cepat dan stabil.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-10">
            <button 
              onClick={onDismiss}
              className="rounded-xl h-14 font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
            >
              Nanti saja
            </button>
            <Button 
              onClick={onInstallClick}
              className="rounded-xl h-14 font-black text-[10px] uppercase tracking-[0.3em] shadow-xl glow-primary bg-primary text-white hover:bg-primary/90 transition-all active:scale-95"
            >
              <Download size={16} className="mr-2" /> Instal sekarang
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
