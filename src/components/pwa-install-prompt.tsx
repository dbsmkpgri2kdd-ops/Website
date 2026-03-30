
'use client';

import { useState, useEffect } from 'react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Smartphone, X, Sparkles, SmartphoneIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Komponen UI untuk mengajak pengguna menginstal website sebagai aplikasi Android.
 * Menggunakan desain premium yang sesuai dengan tema Obsidian Emerald.
 */
export function PWAInstallPrompt() {
  const { isInstallable, handleInstall } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Tampilkan prompt setelah beberapa detik jika aplikasi dapat diinstal
    if (isInstallable && !isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isDismissed]);

  const onDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[70] md:left-auto md:right-8 md:w-96 animate-reveal">
      <Card className="glass-premium border-primary/20 overflow-hidden rounded-[2rem] shadow-3xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
              <SmartphoneIcon size={28} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-black uppercase italic text-sm tracking-tight">Pasang Aplikasi</h4>
                <button onClick={onDismiss} className="text-muted-foreground hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide leading-relaxed">
                Akses portal sekolah lebih cepat langsung dari layar utama Android Anda.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={onDismiss}
              className="rounded-xl h-11 font-black text-[9px] uppercase tracking-widest border-white/10"
            >
              Nanti Saja
            </Button>
            <Button 
              onClick={handleInstall}
              className="rounded-xl h-11 font-black text-[9px] uppercase tracking-widest shadow-xl glow-primary"
            >
              <Download size={14} className="mr-2" /> Instal Sekarang
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
