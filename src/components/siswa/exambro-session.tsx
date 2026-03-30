
'use client';

import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, X, Maximize, AlertTriangle, MonitorOff, Camera, CameraOff, LoaderCircle, Clock, Timer, ShieldCheck, Zap, Wifi, Lock, Smartphone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { SCHOOL_DATA_ID } from '@/lib/data';

type ExamBroSessionProps = {
  url: string;
  isCameraRequired?: boolean;
  durationMinutes?: number;
  onExit: () => void;
};

/**
 * ExamBro Session v5.0 - Super Strict App Mode
 * Dioptimalkan untuk PWA Android dengan penguncian sistem berlapis.
 */
export function ExamBroSession({ url, isCameraRequired = false, durationMinutes = 60, onExit }: ExamBroSessionProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [violationCount, setViolationCount] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(isCameraRequired);
  const [isStandalone, setIsStandalone] = useState(false);
  
  // Mencegah hydration mismatch dengan menginisialisasi timer di useEffect
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    // Inisialisasi timer hanya di client
    setTimeLeft(durationMinutes * 60);
    
    if (typeof window !== 'undefined') {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      setIsStandalone(!!isStandaloneMode);
    }
  }, [durationMinutes]);

  // Screen Wake Lock Implementation
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.warn("Wake Lock failed:", err);
      }
    };

    if (isFullScreen) requestWakeLock();

    return () => {
      if (wakeLockRef.current) wakeLockRef.current.release();
    };
  }, [isFullScreen]);

  // Sync session state to Firestore
  useEffect(() => {
    if (!firestore || !user || !isFullScreen || isTimeUp || timeLeft === null) return;

    const sessionRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/activeExamSessions`, user.uid);
    const interval = setInterval(() => {
        setDocumentNonBlocking(sessionRef, {
            studentName: user.profile?.displayName || user.email,
            lastHeartbeat: serverTimestamp(),
            violationCount,
            isCameraActive: hasCameraPermission,
            minutesRemaining: Math.floor(timeLeft / 60),
            isAppMode: isStandalone,
            status: 'ACTIVE'
        }, { merge: true });
    }, 5000);

    return () => {
        clearInterval(interval);
        setDocumentNonBlocking(sessionRef, { status: 'COMPLETED', exitAt: serverTimestamp() }, { merge: true });
    };
  }, [firestore, user, violationCount, hasCameraPermission, timeLeft, isFullScreen, isTimeUp, isStandalone]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      setIsTimeUp(true);
      return;
    }
    const timerId = setInterval(() => setTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (error) {
        setHasCameraPermission(false);
        setIsCameraLoading(false);
        toast({ variant: 'destructive', title: 'AKSES DITOLAK', description: 'Kamera wajib diaktifkan untuk memulai ujian proctored.' });
      }
    };
    getCameraPermission();
    return () => {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
    }
  }, [isCameraRequired, toast]);

  // STRICT INTERACTION BLOCKING
  useEffect(() => {
    const handleVisibilityChange = () => { 
      if (document.hidden && !isTimeUp) {
        handleViolation("SISTEM: TERDETEKSI PINDAH APLIKASI / MINIMIZE!");
      } 
    };
    
    const handleBlur = () => { 
      if (!isTimeUp && isFullScreen) {
        handleViolation("PERINGATAN: FOKUS LAYAR TERDETEKSI BERPINDAH!"); 
      }
    };

    const handleFullScreenChange = () => {
      const isCurrentlyFull = !!document.fullscreenElement;
      setIsFullScreen(isCurrentlyFull);
      if (!isCurrentlyFull && !isTimeUp && hasCameraPermission) {
        handleViolation("PELANGGARAN: MODE LAYAR PENUH DIMATIKAN!");
      }
    };

    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.key === 'F12') {
        e.preventDefault();
        handleViolation(`SISTEM: TOMBOL TERLARANG ${e.key} DITEKAN!`);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeys);

    // Block Pull-to-refresh
    if (typeof document !== 'undefined') {
        document.body.style.overscrollBehavior = 'none';
        document.body.style.userSelect = 'none';
    }

    const preventBack = (e: any) => {
      window.history.pushState(null, "", window.location.href);
      if (!isTimeUp) handleViolation("AKSI TERLARANG: TOMBOL BACK!");
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener('popstate', preventBack);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeys);
      window.removeEventListener('popstate', preventBack);
      if (typeof document !== 'undefined') {
        document.body.style.overscrollBehavior = 'auto';
        document.body.style.userSelect = 'auto';
      }
    };
  }, [isTimeUp, isFullScreen, hasCameraPermission]);

  const handleViolation = (msg: string) => {
    setViolationCount(prev => prev + 1);
    setShowAlarm(true);
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }

    toast({ variant: "destructive", title: "KEAMANAN TERPICU", description: msg });
    
    if (typeof window !== 'undefined') {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
    }
  };

  const enterFullScreen = () => { 
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen().catch(() => {
        toast({ variant: 'destructive', title: 'GAGAL FULLSCREEN', description: 'Pastikan browser mendukung mode layar penuh.' });
      });
    } 
  };

  const handleExitRequest = () => { 
    if (confirm("KONFIRMASI AKHIR: Apakah Anda yakin ingin mengakhiri sesi ujian?")) {
      onExit(); 
    } 
  }

  if (isCameraLoading) {
    return (
        <div className="fixed inset-0 z-[110] bg-background flex flex-col items-center justify-center text-center p-10">
            <LoaderCircle className="h-16 w-16 animate-spin text-primary mb-8" />
            <h3 className="text-2xl font-black uppercase italic tracking-widest text-white">Security Initialization...</h3>
        </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden select-none touch-none">
      <header className="h-16 bg-black/90 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
          <div className={cn("p-2 rounded-xl", isStandalone ? "bg-emerald-500/20 text-emerald-500" : "bg-primary/20 text-primary")}>
            {isStandalone ? <Smartphone className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">EXAMBRO v5.0 {isStandalone ? 'APP' : 'BROWSER'} MODE</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">PELANGGARAN: {violationCount}</span>
          </div>
        </div>

        <div className={cn(
            "absolute left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-2 rounded-2xl border transition-all duration-500 bg-white/5",
            (timeLeft !== null && timeLeft < 300) ? "border-red-500 text-red-500 animate-pulse" : "border-white/10 text-white"
        )}>
            <Timer size={20} className={(timeLeft !== null && timeLeft < 300) ? "text-red-500" : "text-primary"} />
            <div className='flex flex-col items-center leading-none'>
                <span className="text-xl font-black font-mono tracking-tighter">{formatTime(timeLeft)}</span>
                <span className="text-[7px] font-bold uppercase opacity-40 tracking-widest">SISA WAKTU</span>
            </div>
        </div>

        <div className="flex items-center gap-4">
          {!isFullScreen && !isTimeUp && (
            <Button variant="destructive" size="sm" onClick={enterFullScreen} className="h-9 text-[9px] font-black uppercase px-6 rounded-xl animate-pulse">
              <Maximize size={14} className="mr-2" /> AKTIFKAN SECURE MODE
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleExitRequest} className="h-10 w-10 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
            <X size={20} />
          </Button>
        </div>
      </header>

      <main className="flex-1 relative bg-[#f0f0f0]">
        {isCameraRequired && (
            <div className="absolute top-6 right-6 w-32 md:w-56 aspect-video rounded-2xl overflow-hidden border-2 border-primary/40 shadow-3xl z-40 pointer-events-none">
                <video ref={videoRef} className="w-full h-full object-cover bg-black" autoPlay muted playsInline />
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[8px] font-black text-white uppercase tracking-widest font-headline">PROCTORED</span>
                </div>
            </div>
        )}

        {hasCameraPermission && !isTimeUp ? (
            <iframe src={url} className="w-full h-full border-none" title="Exam Gateway" allow="autoplay; camera"/>
        ) : !isTimeUp && (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center text-center p-10">
                <CameraOff size={100} className="text-red-500 mb-8" />
                <h3 className="text-4xl font-black text-white uppercase italic mb-4 tracking-tighter font-headline">BIOMETRIC REQUIRED</h3>
                <Button onClick={() => window.location.reload()} size="lg" className="mt-10 h-16 px-12 rounded-[2rem] font-black text-xs tracking-widest shadow-3xl glow-primary">RELOAD & IZINKAN</Button>
            </div>
        )}

        {showAlarm && !isTimeUp && (
          <div className="absolute inset-0 bg-red-700/95 backdrop-blur-2xl flex flex-col items-center justify-center z-50 p-10 text-center">
            <AlertTriangle size={64} className="text-white mb-10 animate-bounce" />
            <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-6 font-headline">SECURITY BREACH!</h2>
            <Button size="lg" variant="secondary" onClick={() => { setShowAlarm(false); enterFullScreen(); }} className="h-20 px-16 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest shadow-3xl">SAYA MENGERTI</Button>
          </div>
        )}

        {isTimeUp && (
            <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center z-[60] p-10 text-center">
                <Clock size={120} className="text-primary mb-10 animate-pulse" />
                <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-6 font-headline">TIME OVER</h2>
                <Button size="lg" onClick={onExit} className="h-20 px-16 rounded-[2.5rem] font-black text-2xl uppercase tracking-[0.3em] shadow-3xl glow-primary">KELUAR RUANG UJIAN</Button>
            </div>
        )}
      </main>

      <footer className="h-10 bg-black border-t border-white/5 px-8 flex items-center justify-between shrink-0 opacity-60">
        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.5em]">SMKS PGRI 2 KEDONDONG • DIGITAL HUB CORE v7.5</p>
        <div className='flex items-center gap-2'>
            <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_5px]", isStandalone ? "bg-emerald-500 shadow-emerald-500" : "bg-primary shadow-primary")}></div>
            <span className="text-[8px] font-black text-white uppercase tracking-widest">INTEGRITY: {isStandalone ? 'VERIFIED' : 'WEB_MODE'}</span>
        </div>
      </footer>
    </div>
  );
}
