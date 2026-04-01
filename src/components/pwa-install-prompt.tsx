'use client';

import { useState, useEffect } from 'react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, SmartphoneIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Komponen UI untuk mengajak pengguna menginstal website sebagai aplikasi Android/iOS.
 * Menggunakan desain premium Obsidian Emerald dengan skema Biru-Kuning.
 * Kebijakan: Zero Italics.
 */
export function PWAInstallPrompt() {
  const { isInstallable, handleInstall } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Tampilkan prompt setelah 5 detik jika aplikasi dapat diinstal
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
      <Card className="glass-premium border-accent/30 overflow-hidden rounded-[2.5rem] shadow-[0_20px_50px_rgba(59,130,246,0.2)] bg-card/90 backdrop-blur-2xl border-2">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary"></div>
        <CardContent className="p-7">
          <div className="flex gap-5">
            <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-[0_10px_20px_rgba(59,130,246,0.3)] group relative overflow-hidden">
              <div className='absolute inset-0 bg-white/10 animate-pulse'></div>
              <SmartphoneIcon size={32} className="relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className='flex items-center gap-2'>
                    <Sparkles size={14} className='text-accent animate-pulse' />
                    <h4 className="font-black uppercase text-[11px] tracking-tighter font-headline">App Portal Ready</h4>
                </div>
                <button onClick={onDismiss} className="text-muted-foreground hover:text-primary transition-colors p-1" aria-label="Tutup">
                  <X size={18} />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
                Pasang aplikasi resmi <span className='text-primary'>SMKS PGRI 2 KEDONDONG</span> untuk akses portal & ujian lebih cepat dan aman.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button 
              onClick={onDismiss}
              className="rounded-xl h-12 font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground hover:bg-slate-50 transition-colors"
            >
              Nanti Saja
            </button>
            <Button 
              onClick={onInstallClick}
              className="rounded-xl h-12 font-black text-[9px] uppercase tracking-[0.2em] shadow-xl glow-primary bg-primary text-white hover:bg-primary/90"
            >
              <Download size={16} className="mr-2" /> INSTAL SEKARANG
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
