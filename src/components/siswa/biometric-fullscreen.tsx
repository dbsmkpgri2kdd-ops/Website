'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  X, LoaderCircle, CheckCircle2, ShieldCheck, AlertCircle, 
  Maximize2, Minimize2, Volume2, VolumeX, RefreshCw, Navigation 
} from 'lucide-react';
import { useUser, useFirestore, addDocumentNonBlocking, useDoc, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type School } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { calculateDistance, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type BiometricStatus = 'IDLE' | 'CHECKING_LOCATION' | 'VERIFYING_BIOMETRIC' | 'SCANNING' | 'SUCCESS' | 'ERROR';

interface BiometricFullscreenProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Full Screen Biometric Attendance v4.0
 * Optimized untuk mobile, tablet, dan desktop dengan multiple camera support
 */
export function BiometricFullscreen({ isOpen, onClose }: BiometricFullscreenProps) {
  const { user, profile } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [status, setStatus] = useState<BiometricStatus>('IDLE');
  const [distance, setDistance] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [scanProgress, setScanProgress] = useState(0);
  const [direction, setDirection] = useState<'Masuk' | 'Pulang' | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const schoolDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'schools', SCHOOL_DATA_ID) : null, [firestore]);
  const { data: schoolData } = useDoc<School>(schoolDocRef);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      enumerateCameras();
    }
    return () => {
      document.body.style.overflow = 'unset';
      stopCamera();
    };
  }, [isOpen]);

  const enumerateCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameraDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedCameraId) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Failed to enumerate cameras:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const playSound = (type: 'success' | 'error') => {
    if (!soundEnabled) return;
    try {
      const audioUrl = type === 'success' 
        ? 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'
        : 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
      const audio = new Audio(audioUrl);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (err) {
      console.warn('Audio play blocked:', err);
    }
  };

  const handleStartAttendance = async () => {
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'GPS Tidak Didukung' });
      setStatus('ERROR');
      setErrorMsg('Browser Anda tidak mendukung geolokasi.');
      return;
    }

    setStatus('CHECKING_LOCATION');
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const schoolLat = schoolData?.latitude || -5.4656994;
        const schoolLng = schoolData?.longitude || 104.9996424;
        const maxRadius = schoolData?.attendanceRadius || 30;
        
        const dist = calculateDistance(latitude, longitude, schoolLat, schoolLng);
        setDistance(dist);

        if (dist > maxRadius) {
          setStatus('ERROR');
          setErrorMsg(`Jarak terdeteksi ${Math.round(dist)}m. Anda harus berada dalam radius ${maxRadius}m dari sekolah.`);
          playSound('error');
          return;
        }

        const now = new Date();
        const currentHour = now.getHours();
        let type: 'Masuk' | 'Pulang' = 'Masuk';

        if (profile?.session === 'Siang') {
          type = currentHour >= 15 ? 'Pulang' : 'Masuk';
        } else {
          type = currentHour >= 11 ? 'Pulang' : 'Masuk';
        }
        
        setDirection(type);
        startBiometricScan();
      },
      (err) => {
        setStatus('ERROR');
        setErrorMsg('Gagal memvalidasi lokasi. Pastikan GPS aktif dan izin akses diberikan.');
        playSound('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const startBiometricScan = async () => {
    setStatus('VERIFYING_BIOMETRIC');
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
          facingMode: { ideal: 'user' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setHasCameraPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Ensure video plays
        try {
          await videoRef.current.play();
        } catch (err) {
          console.error('Video play error:', err);
        }

        setTimeout(() => {
          setStatus('SCANNING');
          let progress = 0;
          const interval = setInterval(() => {
            progress += 2;
            setScanProgress(progress);
            if (progress >= 100) {
              clearInterval(interval);
              captureAndProcess();
            }
          }, 80);
        }, 500);
      }
    } catch (err: any) {
      setHasCameraPermission(false);
      setStatus('ERROR');
      
      if (err.name === 'NotAllowedError') {
        setErrorMsg('Izin kamera ditolak. Harap izinkan akses kamera di pengaturan browser.');
      } else if (err.name === 'NotFoundError') {
        setErrorMsg('Kamera tidak ditemukan di perangkat Anda.');
      } else {
        setErrorMsg('Gagal mengakses kamera. Pastikan tidak ada aplikasi lain menggunakan kamera.');
      }
      
      playSound('error');
    }
  };

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current || !user || !profile || !firestore) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    try {
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.2);

      const bioCode = `BIO-${user.uid.substring(0, 5)}-${Date.now()}`;
      const attendanceRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/attendance`);
      
      const attendanceData = {
        studentId: user.uid,
        studentName: profile.displayName || user.email,
        studentNis: profile.nis || 'N/A',
        studentClass: profile.className || 'N/A',
        date: serverTimestamp(),
        status: 'Hadir',
        notes: `Presensi ${direction} Otomatis Fullscreen (Shift ${profile.session || 'Pagi'})`,
        biometricCode: bioCode,
        metadata: {
          distance: distance,
          type: 'BIOMETRIC_FULLSCREEN_V4',
          session: profile.session || 'Pagi',
          direction: direction,
          camera: selectedCameraId ? 'External' : 'Default',
          snapshot: dataUrl
        }
      };
      
      addDocumentNonBlocking(attendanceRef, attendanceData);

      if (schoolData?.attendanceWebhookUrl) {
        fetch(schoolData.attendanceWebhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({ ...attendanceData, timestamp: new Date().toISOString() })
        }).catch(() => {});
      }

      stopCamera();
      playSound('success');
      setStatus('SUCCESS');
      toast({ title: 'Absensi Berhasil', description: `Data kehadiran ${direction} tersimpan.` });
    } catch (e) {
      setStatus('ERROR');
      setErrorMsg('Gagal memproses data biometrik.');
      playSound('error');
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.error('Fullscreen toggle error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "fixed inset-0 bg-slate-900 flex flex-col z-[9999]",
        isFullscreen && "w-screen h-screen"
      )}
    >
      {/* Header */}
      <div className="h-20 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/20 text-primary rounded-lg">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Absensi Biometrik Fullscreen</p>
            <p className="text-[10px] text-white/60 uppercase tracking-widest">Sesi {profile?.session || 'Pagi'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-white hover:bg-white/10"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/10"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-red-500/20"
          >
            <X size={18} />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <canvas ref={canvasRef} className="hidden" />
        
        {status === 'IDLE' && (
          <div className="text-center space-y-8 max-w-md animate-reveal">
            <div className="w-32 h-32 bg-primary/10 rounded-[3rem] flex items-center justify-center mx-auto group relative">
              <div className="absolute inset-0 bg-primary/20 rounded-[3rem] animate-ping opacity-30"></div>
              <Navigation size={56} className="text-primary group-hover:scale-110 transition-transform relative z-10" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Validasi Identitas</h3>
              <p className="text-sm text-white/70 font-medium leading-relaxed">
                Pastikan Anda berada di area sekolah. Sistem akan memverifikasi lokasi GPS dan wajah Anda secara otomatis.
              </p>
            </div>
            
            {/* Camera Selection */}
            {cameraDevices.length > 1 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-white/60 text-left block">Pilih Kamera:</label>
                <select 
                  value={selectedCameraId}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-primary"
                >
                  {cameraDevices.map(device => (
                    <option key={device.deviceId} value={device.deviceId} className="bg-slate-900">
                      {device.label || `Kamera ${device.deviceId.substring(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button 
              onClick={handleStartAttendance}
              className="w-full h-14 rounded-2xl font-bold text-base shadow-xl bg-primary text-white hover:bg-primary/90"
            >
              Mulai Absensi
            </Button>
          </div>
        )}

        {status === 'CHECKING_LOCATION' && (
          <div className="text-center space-y-6 animate-reveal">
            <LoaderCircle className="h-20 w-20 animate-spin mx-auto text-primary" />
            <div className="space-y-2">
              <p className="text-lg font-bold text-white uppercase">Memvalidasi GPS...</p>
              <p className="text-sm text-white/60">Memeriksa area geofence (30m dari sekolah)</p>
            </div>
          </div>
        )}

        {(status === 'VERIFYING_BIOMETRIC' || status === 'SCANNING') && (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
            <div className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden border-4 border-primary/30 shadow-2xl bg-black">
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover" 
                autoPlay 
                muted 
                playsInline
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-1 bg-primary/70 absolute animate-[scan_2s_infinite] shadow-[0_0_20px_hsl(var(--primary))]"></div>
                <div className="absolute inset-0 border-[30px] border-black/30"></div>
              </div>

              {hasCameraPermission === false && (
                <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <AlertCircle className="w-12 h-12 text-white mx-auto" />
                    <p className="text-white font-bold">Akses Kamera Ditolak</p>
                    <p className="text-white/70 text-sm">Harap izinkan akses kamera di pengaturan browser.</p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  Sensor Aktif
                </span>
              </div>
            </div>

            <div className="w-full max-w-2xl space-y-4">
              <div className="flex items-center justify-between text-sm font-bold text-white/70 uppercase tracking-widest">
                <span>{status === 'SCANNING' ? 'Menganalisis Wajah...' : 'Inisialisasi Biometrik...'}</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 shadow-[0_0_15px_hsl(var(--primary))]" 
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="text-center space-y-8 max-w-md animate-reveal">
            <div className="w-32 h-32 bg-emerald-500/20 text-emerald-400 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner relative">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-[3rem] animate-ping opacity-30"></div>
              <CheckCircle2 size={64} className="relative z-10" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-white uppercase">Berhasil!</h3>
              <Badge className="bg-emerald-500 text-white font-bold text-xs uppercase mx-auto">
                Presensi {direction} Valid
              </Badge>
              <p className="text-sm text-white/70 leading-relaxed">
                Data kehadiran telah disinkronkan ke database untuk Sesi {profile?.session || 'Pagi'}.
              </p>
            </div>
            <Button 
              onClick={onClose}
              className="w-full h-12 rounded-xl font-bold text-sm uppercase bg-emerald-600 hover:bg-emerald-700"
            >
              Selesai
            </Button>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="text-center space-y-8 max-w-md animate-reveal">
            <div className="w-32 h-32 bg-red-500/20 text-red-400 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle size={64} />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-white uppercase text-red-400">Akses Dibatasi</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {errorMsg}
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setStatus('IDLE')}
                className="flex-1 h-12 rounded-xl font-bold text-sm uppercase bg-primary hover:bg-primary/90"
              >
                Coba Lagi
              </Button>
              <Button 
                onClick={onClose}
                variant="outline"
                className="flex-1 h-12 rounded-xl font-bold text-sm uppercase border-white/20 text-white hover:bg-white/10"
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
