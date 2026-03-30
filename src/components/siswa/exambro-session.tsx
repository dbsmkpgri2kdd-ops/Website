
'use client';

import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, X, Maximize, AlertTriangle, MonitorOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ExamBroSessionProps = {
  url: string;
  onExit: () => void;
};

export function ExamBroSession({ url, onExit }: ExamBroSessionProps) {
  const { toast } = useToast();
  const [violationCount, setViolationCount] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Effect untuk menangani keamanan
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("Anda meninggalkan halaman ujian!");
      }
    };

    const handleBlur = () => {
      handleViolation("Peringatan: Fokus layar terdeteksi berpindah!");
    };

    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        handleViolation("Ujian wajib dalam mode layar penuh!");
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const handleViolation = (msg: string) => {
    setViolationCount(prev => prev + 1);
    setShowAlarm(true);
    toast({
      variant: "destructive",
      title: "PELANGGARAN DETEKSI",
      description: msg,
    });
    
    // Suara alarm (opsional, menggunakan beep sistem jika diizinkan browser)
    if (typeof window !== 'undefined') {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
    }
  };

  const enterFullScreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Header Keamanan */}
      <header className="h-14 bg-black border-b border-white/5 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-1.5 rounded-lg">
            <ShieldAlert className="text-primary h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-white">EXAMBRO SECURE SESSION</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase">PELANGGARAN: {violationCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isFullScreen && (
            <Button variant="destructive" size="sm" onClick={enterFullScreen} className="h-8 text-[9px] font-black uppercase px-4 rounded-lg animate-pulse">
              <Maximize size={12} className="mr-2" /> AKTIFKAN FULLSCREEN
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onExit} className="h-8 w-8 hover:bg-white/5 text-muted-foreground hover:text-white">
            <X size={16} />
          </Button>
        </div>
      </header>

      {/* Konten Utama (Exam Iframe) */}
      <main className="flex-1 relative bg-white">
        <iframe 
          src={url} 
          className="w-full h-full border-none" 
          title="Exam Content"
          allow="autoplay; camera; microphone"
        />

        {/* Overlay Alarm */}
        {showAlarm && (
          <div className="absolute inset-0 bg-red-600/90 backdrop-blur-xl flex flex-col items-center justify-center z-50 p-10 text-center animate-in fade-in duration-300">
            <AlertTriangle size={120} className="text-white mb-8 animate-bounce" />
            <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-4">KEAMANAN TERDETEKSI!</h2>
            <p className="text-white/80 text-xl font-bold uppercase tracking-widest mb-10">Anda mencoba berpindah jendela atau menutup mode layar penuh.</p>
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => { setShowAlarm(false); enterFullScreen(); }}
              className="h-20 px-12 rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-3xl hover:scale-105 transition-all"
            >
              LANJUTKAN UJIAN
            </Button>
          </div>
        )}

        {/* Overlay Block (Jika tidak fullscreen) */}
        {!isFullScreen && !showAlarm && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-40 text-center p-10">
            <MonitorOff size={80} className="text-primary mb-6" />
            <h3 className="text-3xl font-black text-white uppercase italic mb-2">FULLSCREEN WAJIB</h3>
            <p className="text-muted-foreground text-sm uppercase tracking-[0.2em] mb-8">Klik tombol di bawah untuk membuka soal ujian.</p>
            <Button 
              size="lg" 
              onClick={enterFullScreen}
              className="h-16 px-10 rounded-2xl font-black text-xs uppercase tracking-widest glow-primary"
            >
              MULAI MODE AMAN
            </Button>
          </div>
        )}
      </main>

      <footer className="h-10 bg-black border-t border-white/5 px-6 flex items-center justify-center shrink-0">
        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.5em]">SMKS PGRI 2 KEDONDONG - DIGITAL HUB ENTERPRISE PROTECTION</p>
      </footer>
    </div>
  );
}
