
'use client';

import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, X, Maximize, AlertTriangle, MonitorOff, Camera, CameraOff, LoaderCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ExamBroSessionProps = {
  url: string;
  isCameraRequired?: boolean;
  onExit: () => void;
};

export function ExamBroSession({ url, isCameraRequired = false, onExit }: ExamBroSessionProps) {
  const { toast } = useToast();
  const [violationCount, setViolationCount] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(isCameraRequired);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle Camera Permission
  useEffect(() => {
    if (!isCameraRequired) {
        setHasCameraPermission(true);
        setIsCameraLoading(false);
        return;
    }

    const getCameraPermission = async () => {
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
          title: 'Akses Kamera Ditolak',
          description: 'Ujian ini mewajibkan pengawasan kamera. Silakan izinkan kamera di browser Anda.',
        });
      }
    };

    getCameraPermission();

    return () => {
        // Stop camera on exit
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [isCameraRequired]);

  // Handle Security Events
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

  if (isCameraLoading) {
    return (
        <div className="fixed inset-0 z-[110] bg-background flex flex-col items-center justify-center text-center p-10">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary mb-6" />
            <h3 className="text-xl font-black uppercase italic tracking-widest">Memulai Pengawasan Biometrik...</h3>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Menyiapkan enkripsi kamera aman</p>
        </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden">
      {/* Header Keamanan */}
      <header className="h-14 bg-black border-b border-white/5 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-1.5 rounded-lg">
            <ShieldAlert className="text-primary h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-white">EXAMBRO SECURE SESSION v2.0</span>
            <div className="flex items-center gap-2">
                <span className="text-[8px] font-bold text-red-500 uppercase">PELANGGARAN: {violationCount}</span>
                {isCameraRequired && (
                    <span className={cn("text-[8px] font-bold uppercase flex items-center gap-1", hasCameraPermission ? "text-emerald-500" : "text-red-500")}>
                        {hasCameraPermission ? <Camera size={10}/> : <CameraOff size={10}/>} {hasCameraPermission ? 'PROCTORED ON' : 'CAMERA DISABLED'}
                    </span>
                )}
            </div>
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

      {/* Konten Utama */}
      <main className="flex-1 relative bg-white">
        {/* Camera Floating Preview */}
        {isCameraRequired && (
            <div className="absolute top-4 right-4 w-32 md:w-48 aspect-video rounded-xl overflow-hidden border-2 border-primary/50 shadow-2xl z-20 pointer-events-none group">
                <video ref={videoRef} className="w-full h-full object-cover bg-black" autoPlay muted playsInline />
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[7px] font-black text-white uppercase tracking-widest">LIVE REC</span>
                </div>
            </div>
        )}

        {/* Exam Iframe */}
        {hasCameraPermission ? (
            <iframe 
                src={url} 
                className="w-full h-full border-none" 
                title="Exam Content"
                allow="autoplay; camera; microphone"
            />
        ) : (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center text-center p-10">
                <CameraOff size={80} className="text-destructive mb-6" />
                <h3 className="text-3xl font-black text-white uppercase italic mb-2">KAMERA WAJIB</h3>
                <p className="text-muted-foreground text-sm uppercase tracking-[0.2em] max-w-md">Ujian ini memerlukan pengawasan kamera aktif. Silakan muat ulang halaman dan berikan izin akses kamera.</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-8 border-white/20 text-white h-14 px-8 rounded-xl font-black text-[10px] tracking-widest">MUAT ULANG & IZINKAN</Button>
            </div>
        )}

        {/* Overlay Alarm */}
        {showAlarm && (
          <div className="absolute inset-0 bg-red-600/90 backdrop-blur-xl flex flex-col items-center justify-center z-50 p-10 text-center animate-in fade-in duration-300">
            <AlertTriangle size={120} className="text-white mb-8 animate-bounce" />
            <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-4">KEAMANAN TERDETEKSI!</h2>
            <p className="text-white/80 text-xl font-bold uppercase tracking-widest mb-10">Sistem mendeteksi aktivitas yang mencurigakan di luar jendela ujian.</p>
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
        {!isFullScreen && !showAlarm && hasCameraPermission && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-40 text-center p-10">
            <MonitorOff size={80} className="text-primary mb-6" />
            <h3 className="text-3xl font-black text-white uppercase italic mb-2">FULLSCREEN WAJIB</h3>
            <p className="text-muted-foreground text-sm uppercase tracking-[0.2em] mb-8">Klik tombol di bawah untuk membuka soal ujian dalam mode aman.</p>
            <Button 
              size="lg" 
              onClick={enterFullScreen}
              className="h-16 px-10 rounded-2xl font-black text-xs uppercase tracking-widest shadow-3xl glow-primary"
            >
              MULAI SESI SECURE
            </Button>
          </div>
        )}
      </main>

      <footer className="h-10 bg-black border-t border-white/5 px-6 flex items-center justify-center shrink-0">
        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.5em]">SMKS PGRI 2 KEDONDONG - BIOMETRIC PROCTORING v2.0</p>
      </footer>
    </div>
  );
}
