'use client';

import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, X, Maximize, AlertTriangle, MonitorOff, Camera, CameraOff, LoaderCircle, Clock, Timer, ShieldCheck, Zap, Wifi, Lock, Smartphone, RefreshCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { SCHOOL_DATA_ID } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ExamBroSessionProps = {
  examId: string;
  examTitle: string;
  url: string;
  isCameraRequired?: boolean;
  durationMinutes?: number;
  unlockToken: string;
  onExit: () => void;
};

/**
 * ExamBro Session v5.5 - Super Strict Secure Mode.
 * Melindungi sesi ujian dari multitasking, navigasi ilegal, dan memantau status siswa secara real-time.
 * Mendukung Live Camera Snapshots untuk pengawasan proctoring.
 * Kebijakan: Zero Italics & Standard Case.
 */
export function ExamBroSession({ examId, examTitle, url, isCameraRequired = false, durationMinutes = 60, unlockToken, onExit }: ExamBroSessionProps) {
  const { toast } = useToast();
  const firestore = firestoreInst;
  const { user } = useUser();
  const [violationCount, setViolationCount] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(isCameraRequired);
  const [isStandalone, setIsStandalone] = useState(false);
  const [lastSnapshot, setLastSnapshot] = useState<string | null>(null);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wakeLockRef = useRef<any>(null);

  const firestoreInst = useFirestore();

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
        console.warn("Screen Wake Lock failed:", err);
      }
    };

    if (isFullScreen) requestWakeLock();

    return () => {
      if (wakeLockRef.current) wakeLockRef.current.release();
    };
  }, [isFullScreen]);

  useEffect(() => {
    if (!firestoreInst || !user || !isFullScreen || isTimeUp || timeLeft === null) return;

    const sessionRef = doc(firestoreInst, `schools/${SCHOOL_DATA_ID}/activeExamSessions`, user.uid);
    
    const interval = setInterval(() => {
        let currentSnap = lastSnapshot;
        if (hasCameraPermission && videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = 320;
            canvas.height = 240;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                currentSnap = canvas.toDataURL('image/jpeg', 0.25);
                setLastSnapshot(currentSnap);
            }
        }

        setDocumentNonBlocking(sessionRef, {
            examId,
            examTitle,
            studentName: user.profile?.displayName || user.email,
            lastHeartbeat: serverTimestamp(),
            violationCount,
            isCameraActive: !!hasCameraPermission,
            lastSnapshot: currentSnap,
            minutesRemaining: Math.floor(timeLeft / 60),
            isAppMode: isStandalone,
            isLocked,
            status: 'ACTIVE'
        }, { merge: true });
    }, 15000);

    return () => {
        clearInterval(interval);
        setDocumentNonBlocking(sessionRef, { status: 'COMPLETED', exitAt: serverTimestamp() }, { merge: true });
    };
  }, [firestoreInst, user, violationCount, hasCameraPermission, timeLeft, isFullScreen, isTimeUp, isStandalone, isLocked, examId, examTitle, lastSnapshot]);

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
    if (seconds === null) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        setHasCameraPermission(true);
        setIsCameraLoading(false);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (error) {
        setHasCameraPermission(false);
        setIsCameraLoading(false);
        if (isCameraRequired) {
            toast({ variant: 'destructive', title: 'Sensor Kamera Gagal', description: 'Izin kamera wajib diberikan untuk pengawasan ujian.' });
        }
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
        handleViolation("Terdeteksi memindahkan fokus atau membuka aplikasi lain!");
      } 
    };
    
    const handleBlur = () => { 
      if (!isTimeUp && isFullScreen && !isLocked) {
        handleViolation("Fokus layar terputus. Pastikan tidak ada pop-up atau jendela lain."); 
      }
    };

    const handleFullScreenChange = () => {
      const isCurrentlyFull = !!document.fullscreenElement;
      setIsFullScreen(isCurrentlyFull);
      if (!isCurrentlyFull && !isTimeUp && !isLocked) {
        handleViolation("Mode layar penuh (Secure Mode) dinonaktifkan secara paksa!");
      }
    };

    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.key === 'F12' || e.key === 'PrintScreen') {
        e.preventDefault();
        if (!isLocked) handleViolation(`Tombol terlarang (${e.key}) terdeteksi!`);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeys);

    if (typeof document !== 'undefined') {
        document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeys);
      if (typeof document !== 'undefined') {
        document.body.style.userSelect = 'auto';
      }
    };
  }, [isTimeUp, isFullScreen, isLocked, violationCount]);

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
      navigator.vibrate([500, 200, 500]);
    }

    toast({ variant: "destructive", title: "Peringatan Keamanan", description: msg });
  };

  const handleUnlock = () => {
    if (tokenInput.toUpperCase() === unlockToken.toUpperCase()) {
      setIsLocked(false);
      setViolationCount(0);
      setTokenInput('');
      enterFullScreen();
      toast({ title: 'Sesi Dibuka', description: 'Akses pengerjaan ujian telah dipulihkan.' });
    } else {
      toast({ variant: 'destructive', title: 'Token Tidak Valid', description: 'Gunakan token yang diberikan oleh pengawas.' });
    }
  };

  const enterFullScreen = () => { 
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen().catch(() => {
        toast({ variant: 'destructive', title: 'Gagal Secure Mode', description: 'Harap aktifkan mode layar penuh secara manual.' });
      });
    } 
  };

  const handleExitRequest = () => { 
    if (confirm("Apakah Anda yakin ingin mengakhiri sesi ujian ini?")) {
      onExit(); 
    } 
  }

  if (isCameraLoading) {
    return (
        <div className="fixed inset-0 z-[110] bg-background flex flex-col items-center justify-center text-center p-10">
            <LoaderCircle className="h-16 w-16 animate-spin text-primary mb-8" />
            <h3 className="text-2xl font-bold font-headline uppercase tracking-widest text-foreground">Inisialisasi Shield...</h3>
            <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-4 opacity-60'>Menghubungkan ke gateway biometrik</p>
        </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden select-none touch-none font-sans animate-reveal">
      <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
          <div className={cn("p-2 rounded-xl", isStandalone ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary")}>
            {isStandalone ? <Smartphone className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">ExamBro v5.5 {isStandalone ? 'App' : 'Web'} Mode</span>
            <span className={cn("text-[9px] font-black uppercase tracking-widest mt-0.5", violationCount > 0 ? "text-red-500" : "text-muted-foreground")}>
                Integritas: {violationCount} / 3 Pelanggaran
            </span>
          </div>
        </div>

        <div className={cn(
            "absolute left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-2 rounded-2xl border transition-all duration-500 bg-muted/30",
            (timeLeft !== null && timeLeft < 300) ? "border-red-500 text-red-500 animate-pulse" : "border-border text-foreground"
        )}>
            <Timer size={20} className={(timeLeft !== null && timeLeft < 300) ? "text-red-500" : "text-primary"} />
            <div className='flex flex-col items-center leading-none'>
                <span className="text-xl font-bold font-mono tracking-tighter">{formatTime(timeLeft)}</span>
                <span className="text-[8px] font-black uppercase opacity-40 tracking-widest">Sisa Waktu</span>
            </div>
        </div>

        <div className="flex items-center gap-4">
          {!isFullScreen && !isTimeUp && !isLocked && (
            <Button variant="destructive" size="sm" onClick={enterFullScreen} className="h-9 text-[10px] font-black uppercase px-6 rounded-xl animate-pulse shadow-lg glow-primary">
              <Maximize size={14} className="mr-2" /> Aktifkan Secure Mode
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleExitRequest} className="h-10 w-10 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
            <X size={20} />
          </Button>
        </div>
      </header>

      <main className="flex-1 relative bg-white">
        <canvas ref={canvasRef} className="hidden" />
        
        {isCameraRequired && (
            <div className="absolute top-6 right-6 w-32 md:w-56 aspect-video rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl z-40 pointer-events-none bg-black ring-4 ring-black/20">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded-full border border-white/10">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[8px] font-black text-white uppercase tracking-widest font-headline">Monitoring...</span>
                </div>
            </div>
        )}

        {(!isCameraRequired || hasCameraPermission) && !isTimeUp ? (
            <iframe src={url} className="w-full h-full border-none" title="Exam Gateway" allow="autoplay; camera"/>
        ) : !isTimeUp && (
            <div className="w-full h-full bg-background flex flex-col items-center justify-center text-center p-10">
                <CameraOff size={100} className="text-red-500 mb-8 opacity-20" />
                <h3 className="text-3xl font-black text-foreground uppercase mb-4 tracking-tighter font-headline leading-none">Sensor Wajib Aktif</h3>
                <p className='text-xs font-bold text-muted-foreground uppercase tracking-widest max-w-sm mx-auto leading-relaxed'>Anda harus mengizinkan akses kamera untuk pengawasan biometrik selama sesi ujian berlangsung.</p>
                <Button onClick={() => window.location.reload()} size="lg" className="mt-10 h-16 px-12 rounded-[2rem] font-bold text-xs tracking-widest shadow-xl">Izinkan & Mulai Ulang</Button>
            </div>
        )}

        {showAlarm && !isTimeUp && !isLocked && (
          <div className="absolute inset-0 bg-red-600/95 backdrop-blur-3xl flex flex-col items-center justify-center z-50 p-10 text-center text-white animate-in fade-in duration-300">
            <AlertTriangle size={80} className="mb-10 animate-bounce" />
            <h2 className="text-5xl font-black uppercase tracking-tighter mb-6 font-headline leading-none">Pelanggaran Sistem!</h2>
            <p className='text-lg font-bold uppercase tracking-widest opacity-80 mb-10 max-w-2xl mx-auto leading-relaxed'>Anda terdeteksi melakukan tindakan yang dilarang. Pelanggaran ini telah dicatat secara otomatis ke server pengawas.</p>
            <Button size="lg" variant="secondary" onClick={() => { setShowAlarm(false); enterFullScreen(); }} className="h-20 px-16 rounded-[2.5rem] font-black text-xl uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform">Saya Mengerti</Button>
          </div>
        )}

        {isLocked && !isTimeUp && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-3xl flex flex-col items-center justify-center z-[55] p-10 text-center space-y-8 animate-reveal">
            <div className="w-24 h-24 bg-red-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl animate-pulse ring-8 ring-red-600/20">
                <Lock size={48} />
            </div>
            <div className="space-y-3">
                <h2 className="text-4xl font-black uppercase tracking-tighter font-headline text-red-600 leading-none">Sesi Terkunci</h2>
                <p className="text-muted-foreground text-[11px] font-black uppercase tracking-widest max-w-sm mx-auto leading-relaxed opacity-80">
                    Sesi Anda telah dibekukan karena pelanggaran berulang. Harap hubungi pengawas ruangan untuk mendapatkan token pembuka akses.
                </p>
            </div>
            
            <div className="w-full max-w-xs space-y-4">
                <Input 
                    placeholder="Token Pengawas" 
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                    className="h-16 rounded-2xl bg-muted border-border text-center font-bold text-xl tracking-[0.5em] focus-visible:ring-red-600"
                />
                <Button onClick={handleUnlock} size="lg" className="w-full h-16 rounded-2xl font-black uppercase tracking-widest shadow-xl bg-red-600 text-white hover:bg-red-700">
                    Verifikasi Token
                </Button>
            </div>
          </div>
        )}

        {isTimeUp && (
            <div className="absolute inset-0 bg-background/98 backdrop-blur-3xl flex flex-col items-center justify-center z-[60] p-10 text-center animate-reveal">
                <Clock size={120} className="text-primary mb-10 animate-pulse opacity-20" />
                <h2 className="text-6xl font-black text-foreground uppercase tracking-tighter mb-6 font-headline leading-none">Waktu<br/>Habis.</h2>
                <p className='text-xs font-bold text-muted-foreground uppercase tracking-[0.4em] mb-10'>Jawaban Anda telah tersimpan secara otomatis oleh sistem.</p>
                <Button size="lg" onClick={onExit} className="h-20 px-16 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest shadow-xl glow-primary">Keluar Sesi</Button>
            </div>
        )}
      </main>

      <footer className="h-10 bg-card border-t border-border px-8 flex items-center justify-between shrink-0 opacity-60">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Digital Gateway • SMKS PGRI 2 Kedondong</p>
        <div className='flex items-center gap-3'>
            <div className='flex items-center gap-1.5'>
                <Wifi size={10} className='text-emerald-500'/>
                <span className='text-[8px] font-black text-foreground uppercase tracking-widest'>Gateway Connected</span>
            </div>
            <div className='w-px h-3 bg-border'></div>
            <div className='flex items-center gap-1.5'>
                <div className={cn("w-1.5 h-1.5 rounded-full", isStandalone ? "bg-emerald-500" : "bg-primary animate-pulse")}></div>
                <span className="text-[9px] font-black text-foreground uppercase tracking-widest">Shield: {isStandalone ? 'Verified' : 'Active'}</span>
            </div>
        </div>
      </footer>
    </div>
  );
}
