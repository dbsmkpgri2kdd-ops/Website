
'use client';

import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, X, Maximize, AlertTriangle, MonitorOff, Camera, CameraOff, LoaderCircle, Clock, Timer, ShieldCheck, Zap, Wifi } from 'lucide-react';
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

export function ExamBroSession({ url, isCameraRequired = false, durationMinutes = 60, onExit }: ExamBroSessionProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [violationCount, setViolationCount] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(isCameraRequired);
  
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync session state to Firestore for teacher monitoring
  useEffect(() => {
    if (!firestore || !user || !isFullScreen || isTimeUp) return;

    const sessionRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/activeExamSessions`, user.uid);
    const interval = setInterval(() => {
        setDocumentNonBlocking(sessionRef, {
            studentName: user.profile?.displayName || user.email,
            lastHeartbeat: serverTimestamp(),
            violationCount,
            isCameraActive: hasCameraPermission,
            minutesRemaining: Math.floor(timeLeft / 60),
            status: 'ACTIVE'
        }, { merge: true });
    }, 10000); // Heartbeat every 10 seconds

    return () => {
        clearInterval(interval);
        // Mark as inactive on exit
        setDocumentNonBlocking(sessionRef, { status: 'COMPLETED', exitAt: serverTimestamp() }, { merge: true });
    };
  }, [firestore, user, violationCount, hasCameraPermission, timeLeft, isFullScreen, isTimeUp]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsTimeUp(true);
      return;
    }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
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

  useEffect(() => {
    const handleVisibilityChange = () => { if (document.hidden && !isTimeUp) handleViolation("DETEKSI: ANDA MENINGGALKAN HALAMAN UJIAN!"); };
    const handleBlur = () => { if (!isTimeUp) handleViolation("PERINGATAN: FOKUS LAYAR TERDETEKSI BERPINDAH!"); };
    const handleFullScreenChange = () => {
      const isCurrentlyFull = !!document.fullscreenElement;
      setIsFullScreen(isCurrentlyFull);
      if (!isCurrentlyFull && !isTimeUp) handleViolation("PELANGGARAN: MODE LAYAR PENUH DIMATIKAN!");
    };
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('contextmenu', preventContextMenu);
    const preventBack = () => window.history.pushState(null, "", window.location.href);
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
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200]);
    toast({ variant: "destructive", title: "KEAMANAN TERPICU", description: msg });
    if (typeof window !== 'undefined') {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
    }
  };

  const enterFullScreen = () => { if (containerRef.current?.requestFullscreen) containerRef.current.requestFullscreen(); };
  const handleExitRequest = () => { if (confirm("Apakah Anda yakin ingin mengakhiri sesi ujian?")) onExit(); }

  if (isCameraLoading) {
    return (
        <div className="fixed inset-0 z-[110] bg-background flex flex-col items-center justify-center text-center p-10">
            <LoaderCircle className="h-16 w-16 animate-spin text-primary mb-8" />
            <div className='space-y-3'>
                <h3 className="text-2xl font-black uppercase italic tracking-widest text-white font-headline">Security Initialization...</h3>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em]">Menyiapkan Enkripsi & Pengawasan Biometrik</p>
            </div>
        </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden select-none">
      <header className="h-16 bg-black/90 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-2 rounded-xl">
            <ShieldCheck className="text-primary h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">EXAMBRO v4.5 PROCTORED</span>
            <div className="flex items-center gap-3 mt-0.5">
                <div className='flex items-center gap-1.5'>
                    <div className={cn("w-1.5 h-1.5 rounded-full", violationCount > 0 ? "bg-red-500 animate-pulse" : "bg-emerald-500")}></div>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">VIOLATIONS: {violationCount}</span>
                </div>
            </div>
          </div>
        </div>

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
          {!isFullScreen && !isTimeUp && (
            <Button variant="destructive" size="sm" onClick={enterFullScreen} className="h-9 text-[9px] font-black uppercase px-6 rounded-xl shadow-2xl animate-pulse">
              <Maximize size={14} className="mr-2" /> AKTIFKAN FULLSCREEN
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleExitRequest} className="h-10 w-10 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
            <X size={20} />
          </Button>
        </div>
      </header>

      <main className="flex-1 relative bg-[#f0f0f0]">
        {isCameraRequired && (
            <div className="absolute top-6 right-6 w-36 md:w-56 aspect-video rounded-2xl overflow-hidden border-2 border-primary/40 shadow-3xl z-40 pointer-events-none">
                <video ref={videoRef} className="w-full h-full object-cover bg-black" autoPlay muted playsInline />
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">MONITORING</span>
                </div>
            </div>
        )}

        {hasCameraPermission && !isTimeUp ? (
            <iframe src={url} className="w-full h-full border-none" title="Exam Gateway" allow="autoplay; camera; microphone"/>
        ) : !isTimeUp && (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center text-center p-10">
                <CameraOff size={100} className="text-red-500 mb-8" />
                <h3 className="text-4xl font-black text-white uppercase italic mb-4 tracking-tighter font-headline">KAMERA WAJIB AKTIF</h3>
                <p className="text-muted-foreground text-sm uppercase tracking-[0.2em] max-w-lg">Ujian proctored membutuhkan akses kamera aktif selama sesi berlangsung.</p>
                <Button onClick={() => window.location.reload()} size="lg" className="mt-10 h-16 px-12 rounded-[2rem] font-black text-xs tracking-widest shadow-3xl glow-primary">RELOAD & IZINKAN</Button>
            </div>
        )}

        {!isFullScreen && !showAlarm && hasCameraPermission && !isTimeUp && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center z-40 text-center p-10">
            <MonitorOff size={100} className="text-primary mb-8 animate-pulse" />
            <h3 className="text-4xl font-black text-white uppercase italic mb-4 tracking-tighter font-headline">LAYAR PENUH DIWAJIBKAN</h3>
            <p className="text-muted-foreground text-sm uppercase tracking-[0.2em] mb-10 max-w-md">Sistem mendeteksi jendela tidak maksimal. Silakan masuk ke mode aman.</p>
            <Button size="lg" onClick={enterFullScreen} className="h-20 px-16 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-3xl glow-primary">MULAI SESI SECURE</Button>
          </div>
        )}

        {showAlarm && !isTimeUp && (
          <div className="absolute inset-0 bg-red-700/95 backdrop-blur-2xl flex flex-col items-center justify-center z-50 p-10 text-center">
            <AlertTriangle size={64} className="text-white mb-10 animate-bounce" />
            <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-6 font-headline">SECURITY ALERT!</h2>
            <p className="text-white/80 text-xl font-bold uppercase tracking-widest mb-12 max-w-2xl">DETEKSI PERCOBAAN KELUAR JENDELA UJIAN. PELANGGARAN DICATAT.</p>
            <Button size="lg" variant="secondary" onClick={() => { setShowAlarm(false); enterFullScreen(); }} className="h-20 px-16 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest shadow-3xl">KEMBALI KE UJIAN</Button>
          </div>
        )}

        {isTimeUp && (
            <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center z-[60] p-10 text-center">
                <Clock size={120} className="text-primary mb-10 animate-pulse" />
                <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-6 font-headline">WAKTU SELESAI</h2>
                <p className="text-muted-foreground text-xl font-bold uppercase tracking-[0.2em] mb-12 max-w-2xl">Alokasi waktu pengerjaan telah habis. Sesi ditutup otomatis.</p>
                <Button size="lg" onClick={onExit} className="h-20 px-16 rounded-[2.5rem] font-black text-2xl uppercase tracking-[0.3em] shadow-3xl glow-primary">KELUAR RUANG UJIAN</Button>
            </div>
        )}
      </main>

      <footer className="h-10 bg-black border-t border-white/5 px-8 flex items-center justify-between shrink-0 opacity-60">
        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.5em]">SMKS PGRI 2 KEDONDONG • DIGITAL HUB CORE v7.5</p>
        <div className="flex items-center gap-4">
            <div className='flex items-center gap-2'>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]"></div>
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">SYSTEM INTEGRITY: VERIFIED</span>
            </div>
        </div>
      </footer>
    </div>
  );
}
