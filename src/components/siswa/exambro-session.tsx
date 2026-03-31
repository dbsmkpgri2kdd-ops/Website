'use client';

import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, X, Maximize, AlertTriangle, MonitorOff, Camera, CameraOff, LoaderCircle, Clock, Timer, ShieldCheck, Zap, Wifi, Lock, Smartphone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { SCHOOL_DATA_ID } from '@/lib/data';

type ExamBroSessionProps = {
  url: string;
  isCameraRequired?: boolean;
  durationMinutes?: number;
  unlockToken: string;
  onExit: () => void;
};

/**
 * ExamBro Session v5.5 - Super Strict App Mode
 * Implementasi fitur Lockdown pada pelanggaran ke-3.
 */
export function ExamBroSession({ url, isCameraRequired = false, durationMinutes = 60, unlockToken, onExit }: ExamBroSessionProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [violationCount, setViolationCount] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(isCameraRequired);
  const [isStandalone, setIsStandalone] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    setTimeLeft(durationMinutes * 60);
    
    if (typeof window !== 'undefined') {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      setIsStandalone(!!isStandaloneMode);
    }
  }, [durationMinutes]);

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
            isLocked,
            status: 'ACTIVE'
        }, { merge: true });
    }, 5000);

    return () => {
        clearInterval(interval);
        setDocumentNonBlocking(sessionRef, { status: 'COMPLETED', exitAt: serverTimestamp() }, { merge: true });
    };
  }, [firestore, user, violationCount, hasCameraPermission, timeLeft, isFullScreen, isTimeUp, isStandalone, isLocked]);

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
        toast({ variant: 'destructive', title: 'Akses ditolak', description: 'Kamera wajib diaktifkan untuk memulai ujian.' });
      }
    };
    getCameraPermission();
    return () => {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
    }
  }, [isCameraRequired, toast]);

  useEffect(() => {
    const handleVisibilityChange = () => { 
      if (document.hidden && !isTimeUp && isFullScreen && !isLocked) {
        handleViolation("Sistem: Terdeteksi pindah aplikasi / minimize!");
      } 
    };
    
    const handleBlur = () => { 
      if (!isTimeUp && isFullScreen && !isLocked) {
        handleViolation("Peringatan: Fokus layar terdeteksi berpindah!"); 
      }
    };

    const handleFullScreenChange = () => {
      const isCurrentlyFull = !!document.fullscreenElement;
      setIsFullScreen(isCurrentlyFull);
      if (!isCurrentlyFull && !isTimeUp && hasCameraPermission && !isLocked) {
        handleViolation("Pelanggaran: Mode layar penuh dimatikan!");
      }
    };

    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.key === 'F12') {
        e.preventDefault();
        if (!isLocked) handleViolation(`Sistem: Tombol terlarang ${e.key} ditekan!`);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isTimeUp) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeys);
    window.addEventListener('beforeunload', handleBeforeUnload);

    if (typeof document !== 'undefined') {
        document.body.style.overscrollBehavior = 'none';
        document.body.style.userSelect = 'none';
    }

    const preventBack = (e: any) => {
      window.history.pushState(null, "", window.location.href);
      if (!isTimeUp && !isLocked) handleViolation("Aksi terlarang: Tombol kembali ditekan!");
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
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (typeof document !== 'undefined') {
        document.body.style.overscrollBehavior = 'auto';
        document.body.style.userSelect = 'auto';
      }
    };
  }, [isTimeUp, isFullScreen, hasCameraPermission, isLocked]);

  const handleViolation = (msg: string) => {
    const newCount = violationCount + 1;
    setViolationCount(newCount);
    
    if (newCount >= 3) {
      setIsLocked(true);
      setShowAlarm(false);
    } else {
      setShowAlarm(true);
    }
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }

    toast({ variant: "destructive", title: "Keamanan terpicu", description: msg });
    
    if (typeof window !== 'undefined') {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
    }
  };

  const handleUnlock = () => {
    if (tokenInput.toUpperCase() === unlockToken.toUpperCase()) {
      setIsLocked(false);
      setViolationCount(0);
      setTokenInput('');
      enterFullScreen();
      toast({ title: 'Akses dibuka', description: 'Silakan lanjutkan pengerjaan ujian Anda.' });
    } else {
      toast({ variant: 'destructive', title: 'Token salah', description: 'Token keamanan tidak valid. Hubungi pengawas.' });
    }
  };

  const enterFullScreen = () => { 
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen().catch(() => {
        toast({ variant: 'destructive', title: 'Gagal fullscreen', description: 'Pastikan browser mendukung mode layar penuh.' });
      });
    } 
  };

  const handleExitRequest = () => { 
    if (confirm("Konfirmasi akhir: Apakah Anda yakin ingin mengakhiri sesi ujian?")) {
      onExit(); 
    } 
  }

  if (isCameraLoading) {
    return (
        <div className="fixed inset-0 z-[110] bg-background flex flex-col items-center justify-center text-center p-10">
            <LoaderCircle className="h-16 w-16 animate-spin text-primary mb-8" />
            <h3 className="text-2xl font-bold uppercase italic tracking-widest text-foreground font-headline">Security initializing...</h3>
        </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden select-none touch-none">
      <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
          <div className={cn("p-2 rounded-xl", isStandalone ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary")}>
            {isStandalone ? <Smartphone className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">ExamBro v5.5 {isStandalone ? 'App' : 'Browser'} Mode</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Pelanggaran: {violationCount}</span>
          </div>
        </div>

        <div className={cn(
            "absolute left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-2 rounded-2xl border transition-all duration-500 bg-muted/30",
            (timeLeft !== null && timeLeft < 300) ? "border-red-500 text-red-500 animate-pulse" : "border-border text-foreground"
        )}>
            <Timer size={20} className={(timeLeft !== null && timeLeft < 300) ? "text-red-500" : "text-primary"} />
            <div className='flex flex-col items-center leading-none'>
                <span className="text-xl font-bold font-mono tracking-tighter">{formatTime(timeLeft)}</span>
                <span className="text-[8px] font-bold uppercase opacity-40 tracking-widest">Sisa waktu</span>
            </div>
        </div>

        <div className="flex items-center gap-4">
          {!isFullScreen && !isTimeUp && !isLocked && (
            <Button variant="destructive" size="sm" onClick={enterFullScreen} className="h-9 text-[10px] font-bold uppercase px-6 rounded-xl animate-pulse shadow-lg">
              <Maximize size={14} className="mr-2" /> Aktifkan secure mode
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleExitRequest} className="h-10 w-10 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
            <X size={20} />
          </Button>
        </div>
      </header>

      <main className="flex-1 relative bg-muted/20">
        {isCameraRequired && (
            <div className="absolute top-6 right-6 w-32 md:w-56 aspect-video rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl z-40 pointer-events-none bg-black">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[8px] font-bold text-white uppercase tracking-widest font-headline">Live</span>
                </div>
            </div>
        )}

        {hasCameraPermission && !isTimeUp ? (
            <iframe src={url} className="w-full h-full border-none bg-white" title="Exam Gateway" allow="autoplay; camera"/>
        ) : !isTimeUp && (
            <div className="w-full h-full bg-background flex flex-col items-center justify-center text-center p-10">
                <CameraOff size={100} className="text-red-500 mb-8 opacity-20" />
                <h3 className="text-3xl font-bold text-foreground uppercase italic mb-4 tracking-tighter font-headline">Biometric required</h3>
                <Button onClick={() => window.location.reload()} size="lg" className="mt-10 h-16 px-12 rounded-[2rem] font-bold text-xs tracking-widest shadow-xl">Reload & izinkan</Button>
            </div>
        )}

        {showAlarm && !isTimeUp && !isLocked && (
          <div className="absolute inset-0 bg-destructive/95 backdrop-blur-3xl flex flex-col items-center justify-center z-50 p-10 text-center text-white">
            <AlertTriangle size={64} className="mb-10 animate-bounce" />
            <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-6 font-headline">Security breach!</h2>
            <Button size="lg" variant="secondary" onClick={() => { setShowAlarm(false); enterFullScreen(); }} className="h-20 px-16 rounded-[2.5rem] font-bold text-xl uppercase tracking-widest shadow-2xl">Saya mengerti</Button>
          </div>
        )}

        {isLocked && !isTimeUp && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-3xl flex flex-col items-center justify-center z-[55] p-10 text-center space-y-8 animate-reveal">
            <div className="w-24 h-24 bg-destructive text-destructive-foreground rounded-[2.5rem] flex items-center justify-center shadow-2xl animate-pulse">
                <Lock size={48} />
            </div>
            <div className="space-y-3">
                <h2 className="text-4xl font-bold italic uppercase tracking-tighter font-headline">Exam lockdown</h2>
                <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                    Sesi Anda terkunci karena pelanggaran berulang. Silakan hubungi pengawas untuk mendapatkan token pembuka.
                </p>
            </div>
            
            <div className="w-full max-w-xs space-y-4">
                <Input 
                    placeholder="Masukkan token keamanan" 
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                    className="h-16 rounded-2xl bg-muted border-border text-center font-bold text-xl tracking-[0.5em] focus-visible:ring-destructive"
                />
                <Button onClick={handleUnlock} size="lg" className="w-full h-16 rounded-2xl font-bold uppercase tracking-widest shadow-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Verifikasi & buka akses
                </Button>
            </div>
          </div>
        )}

        {isTimeUp && (
            <div className="absolute inset-0 bg-background/98 backdrop-blur-3xl flex flex-col items-center justify-center z-[60] p-10 text-center">
                <Clock size={120} className="text-primary mb-10 animate-pulse opacity-20" />
                <h2 className="text-6xl font-bold text-foreground uppercase italic tracking-tighter mb-6 font-headline">Time over</h2>
                <Button size="lg" onClick={onExit} className="h-20 px-16 rounded-[2.5rem] font-bold text-2xl uppercase tracking-widest shadow-xl">Keluar ruang ujian</Button>
            </div>
        )}
      </main>

      <footer className="h-10 bg-card border-t border-border px-8 flex items-center justify-between shrink-0 opacity-60">
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Digital Hub Enterprise v7.5 • SMKS PGRI 2 Kedondong</p>
        <div className='flex items-center gap-2'>
            <div className={cn("w-1.5 h-1.5 rounded-full", isStandalone ? "bg-emerald-500" : "bg-primary")}></div>
            <span className="text-[9px] font-bold text-foreground uppercase tracking-widest">Integrity: {isStandalone ? 'Verified' : 'Web mode'}</span>
        </div>
      </footer>
    </div>
  );
}