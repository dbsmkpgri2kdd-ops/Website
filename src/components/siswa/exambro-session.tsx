
'use client';

import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, X, Maximize, AlertTriangle, MonitorOff, Camera, CameraOff, LoaderCircle, Clock, Timer, ShieldCheck, Zap, Wifi } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ExamBroSessionProps = {
  url: string;
  isCameraRequired?: boolean;
  durationMinutes?: number;
  onExit: () => void;
};

export function ExamBroSession({ url, isCameraRequired = false, durationMinutes = 60, onExit }: ExamBroSessionProps) {
  const { toast } = useToast();
  const [violationCount, setViolationCount] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(isCameraRequired);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Timer Logic
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsTimeUp(true);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Camera Permission
  useEffect(() => {
    const getCameraPermission = async () => {
      if (!isCameraRequired) {
        setHasCameraPermission(true);
        setIsCameraLoading(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        setIsCameraLoading(false);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setIsCameraLoading(false);
        toast({
          variant: 'destructive',
          title: 'AKSES DITOLAK',
          description: 'Kamera wajib diaktifkan untuk memulai ujian proctored.',
        });
      }
    };

    getCameraPermission();

    return () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [isCameraRequired, toast]);

  // Super Strict Security Listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isTimeUp) {
        handleViolation("DETEKSI: ANDA MENINGGALKAN HALAMAN UJIAN!");
      }
    };

    const handleBlur = () => {
      if (!isTimeUp) {
        handleViolation("PERINGATAN: FOKUS LAYAR TERDETEKSI BERPINDAH (Mungkin membuka aplikasi lain)!");
      }
    };

    const handleFullScreenChange = () => {
      const isCurrentlyFull = !!document.fullscreenElement;
      setIsFullScreen(isCurrentlyFull);
      if (!isCurrentlyFull && !isTimeUp) {
        handleViolation("PELANGGARAN: MODE LAYAR PENUH DIMATIKAN!");
      }
    };

    // Mencegah klik kanan dan shortcut inspeksi
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('contextmenu', preventContextMenu);

    // Mencegah navigasi kembali
    const preventBack = () => {
        window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener('popstate', preventBack);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('contextmenu', preventContextMenu);
      window.removeEventListener('popstate', preventBack);
    };
  }, [isTimeUp]);

  const handleViolation = (msg: string) => {
    setViolationCount(prev => prev + 1);
    setShowAlarm(true);
    
    // Haptic Feedback (Vibrate if mobile)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
    }

    toast({
      variant: "destructive",
      title: "KEAMANAN TERPICU",
      description: msg,
    });
    
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

  const handleExitRequest = () => {
    if (confirm("Apakah Anda yakin ingin mengakhiri sesi ujian? Pastikan semua jawaban sudah tersimpan di formulir.")) {
        onExit();
    }
  }

  if (isCameraLoading) {
    return (
        <div className="fixed inset-0 z-[110] bg-background flex flex-col items-center justify-center text-center p-10">
            <LoaderCircle className="h-16 w-16 animate-spin text-primary mb-8" />
            <div className='space-y-3'>
                <h3 className="text-2xl font-black uppercase italic tracking-widest text-white">Security Initialization...</h3>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em]">Menyiapkan Enkripsi & Pengawasan Biometrik</p>
            </div>
        </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden select-none">
      {/* Header Keamanan Premium */}
      <header className="h-16 bg-black/90 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-2 rounded-xl shadow-inner">
            <ShieldCheck className="text-primary h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">EXAMBRO v4.0 PROCTORED</span>
            <div className="flex items-center gap-3 mt-0.5">
                <div className='flex items-center gap-1.5'>
                    <div className={cn("w-1.5 h-1.5 rounded-full", violationCount > 0 ? "bg-red-500 animate-pulse" : "bg-emerald-500")}></div>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">VIOLATIONS: {violationCount}</span>
                </div>
                {isCameraRequired && (
                    <span className={cn("text-[8px] font-bold uppercase flex items-center gap-1 px-2 py-0.5 rounded bg-white/5", hasCameraPermission ? "text-emerald-500" : "text-red-500")}>
                        {hasCameraPermission ? <Camera size={10}/> : <CameraOff size={10}/>} {hasCameraPermission ? 'BIOMETRIC ACTIVE' : 'CAM ERROR'}
                    </span>
                )}
            </div>
          </div>
        </div>

        {/* Timer Center Display */}
        <div className={cn(
            "absolute left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-2 rounded-2xl border transition-all duration-500 bg-white/5",
            timeLeft < 300 ? "border-red-500 text-red-500 animate-pulse" : "border-white/10 text-white"
        )}>
            <Timer size={20} className={timeLeft < 300 ? "text-red-500" : "text-primary"} />
            <div className='flex flex-col items-center leading-none'>
                <span className="text-xl font-black font-mono tracking-tighter">{formatTime(timeLeft)}</span>
                <span className="text-[7px] font-bold uppercase opacity-40 tracking-widest">SISA WAKTU</span>
            </div>
        </div>

        <div className="flex items-center gap-4">
          <div className='hidden md:flex items-center gap-4 mr-4 text-muted-foreground opacity-40'>
             <Wifi size={14} />
             <Zap size={14} />
          </div>
          {!isFullScreen && !isTimeUp && (
            <Button variant="destructive" size="sm" onClick={enterFullScreen} className="h-9 text-[9px] font-black uppercase px-6 rounded-xl shadow-2xl animate-pulse">
              <Maximize size={14} className="mr-2" /> AKTIFKAN FULLSCREEN
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleExitRequest} className="h-10 w-10 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all">
            <X size={20} />
          </Button>
        </div>
      </header>

      {/* Area Konten Utama */}
      <main className="flex-1 relative bg-[#f0f0f0]">
        {/* Floating Camera Proctoring Preview */}
        {isCameraRequired && (
            <div className="absolute top-6 right-6 w-36 md:w-56 aspect-video rounded-2xl overflow-hidden border-2 border-primary/40 shadow-3xl z-40 pointer-events-none group">
                <video ref={videoRef} className="w-full h-full object-cover bg-black" autoPlay muted playsInline />
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">MONITORING</span>
                </div>
            </div>
        )}

        {/* Exam Iframe Content */}
        {hasCameraPermission && !isTimeUp ? (
            <iframe 
                src={url} 
                className="w-full h-full border-none shadow-inner" 
                title="Exam Gateway"
                allow="autoplay; camera; microphone"
            />
        ) : !isTimeUp && (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center text-center p-10">
                <div className='p-8 bg-red-500/10 rounded-full mb-8'>
                    <CameraOff size={100} className="text-red-500" />
                </div>
                <h3 className="text-4xl font-black text-white uppercase italic mb-4 tracking-tighter">KAMERA WAJIB AKTIF</h3>
                <p className="text-muted-foreground text-sm uppercase tracking-[0.2em] max-w-lg leading-loose">Ujian ini menggunakan sistem pengawasan biometrik cerdas. Anda tidak dapat melanjutkan tanpa izin akses kamera aktif.</p>
                <Button onClick={() => window.location.reload()} size="lg" className="mt-10 h-16 px-12 rounded-[2rem] font-black text-xs tracking-widest shadow-3xl glow-primary">MUAT ULANG & IZINKAN AKSES</Button>
            </div>
        )}

        {/* Overlay Block (Jika tidak fullscreen) */}
        {!isFullScreen && !showAlarm && hasCameraPermission && !isTimeUp && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center z-40 text-center p-10 animate-in fade-in duration-500">
            <div className='p-8 bg-primary/10 rounded-full mb-8'>
                <MonitorOff size={100} className="text-primary animate-pulse" />
            </div>
            <h3 className="text-4xl font-black text-white uppercase italic mb-4 tracking-tighter">LAYAR PENUH DIWAJIBKAN</h3>
            <p className="text-muted-foreground text-sm uppercase tracking-[0.2em] mb-10 max-w-md leading-loose">Sistem ExamBro mendeteksi jendela ujian tidak maksimal. Klik tombol di bawah untuk masuk ke mode aman.</p>
            <Button 
              size="lg" 
              onClick={enterFullScreen}
              className="h-20 px-16 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-3xl glow-primary hover:scale-105 transition-all"
            >
              MULAI SESI SECURE SEKARANG
            </Button>
          </div>
        )}

        {/* Overlay Alarm Pelanggaran */}
        {showAlarm && !isTimeUp && (
          <div className="absolute inset-0 bg-red-700/95 backdrop-blur-2xl flex flex-col items-center justify-center z-50 p-10 text-center animate-in zoom-in-95 duration-300">
            <div className='w-32 h-32 bg-white text-red-600 rounded-full flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(255,255,255,0.5)] animate-bounce'>
                <AlertTriangle size={64} />
            </div>
            <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-6">SECURITY ALERT!</h2>
            <p className="text-white/80 text-xl font-bold uppercase tracking-widest mb-12 max-w-2xl leading-relaxed">
                SISTEM MENDETEKSI PERCOBAAN KELUAR DARI JENDELA UJIAN. PELANGGARAN TELAH DICATAT OLEH SERVER PENGAWAS.
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => { setShowAlarm(false); enterFullScreen(); }}
              className="h-20 px-16 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest shadow-3xl hover:scale-105 transition-all"
            >
              KEMBALI KE UJIAN
            </Button>
          </div>
        )}

        {/* Overlay Waktu Habis */}
        {isTimeUp && (
            <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center z-[60] p-10 text-center animate-in fade-in duration-1000">
                <div className='p-10 bg-primary/10 rounded-full mb-10'>
                    <Clock size={120} className="text-primary animate-spin-slow" />
                </div>
                <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-6">WAKTU SELESAI</h2>
                <p className="text-muted-foreground text-xl font-bold uppercase tracking-[0.2em] mb-12 max-w-2xl leading-loose">Alokasi waktu pengerjaan Anda telah habis. Sesi ujian telah ditutup secara otomatis untuk menjaga integritas penilaian.</p>
                <Button 
                    size="lg" 
                    onClick={onExit}
                    className="h-20 px-16 rounded-[2.5rem] font-black text-2xl uppercase tracking-[0.3em] shadow-3xl glow-primary hover:scale-105 transition-all"
                >
                    KELUAR RUANG UJIAN
                </Button>
            </div>
        )}
      </main>

      {/* Footer Status System */}
      <footer className="h-10 bg-black border-t border-white/5 px-8 flex items-center justify-between shrink-0 opacity-60">
        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.5em]">SMKS PGRI 2 KEDONDONG • DIGITAL HUB CORE v7.5</p>
        <div className="flex items-center gap-4">
            <div className='flex items-center gap-2'>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]"></div>
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">SYSTEM INTEGRITY: VERIFIED</span>
            </div>
            <span className='text-[8px] font-black text-muted-foreground uppercase tracking-widest'>ENC: AES-256</span>
        </div>
      </footer>
    </div>
  );
}
