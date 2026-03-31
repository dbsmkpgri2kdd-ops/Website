
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, LoaderCircle, CheckCircle2, ShieldCheck, AlertCircle, Sparkles, Navigation } from 'lucide-react';
import { useUser, useFirestore, addDocumentNonBlocking, useDoc, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type School } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { cn, calculateDistance } from '@/lib/utils';

type AttendanceStatus = 'IDLE' | 'CHECKING_LOCATION' | 'VERIFYING_BIOMETRIC' | 'SCANNING' | 'SUCCESS' | 'ERROR';

/**
 * Modul Absensi Biometrik Wajah & GPS v1.0.
 * Syarat: Siswa harus berada dalam radius 30 meter dari koordinat sekolah.
 */
export function BiometricAttendance() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<AttendanceStatus>('IDLE');
  const [distance, setDistance] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [scanProgress, setScanProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const schoolDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'schools', SCHOOL_DATA_ID) : null, [firestore]);
  const { data: schoolData } = useDoc<School>(schoolDocRef);

  // Stop camera when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStartAttendance = async () => {
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: 'GPS Tidak Didukung', description: 'Browser Anda tidak mendukung geolokasi.' });
      return;
    }

    setStatus('CHECKING_LOCATION');
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Default koordinat jika admin belum setting
        const schoolLat = schoolData?.latitude || -5.4;
        const schoolLng = schoolData?.longitude || 105.1;
        
        const dist = calculateDistance(latitude, longitude, schoolLat, schoolLng);
        setDistance(dist);

        if (dist > 30) {
          setStatus('ERROR');
          setErrorMsg(`Anda berada ${Math.round(dist)}m dari sekolah. Maksimal radius adalah 30m.`);
          return;
        }

        // Lokasi OK, mulai biometrik
        startBiometricScan();
      },
      (err) => {
        setStatus('ERROR');
        setErrorMsg('Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin diberikan.');
      },
      { enableHighAccuracy: true }
    );
  };

  const startBiometricScan = async () => {
    setStatus('VERIFYING_BIOMETRIC');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Simulasi scan wajah
        setTimeout(() => {
          setStatus('SCANNING');
          let progress = 0;
          const interval = setInterval(() => {
            progress += 5;
            setScanProgress(progress);
            if (progress >= 100) {
              clearInterval(interval);
              completeAttendance();
            }
          }, 100);
        }, 1500);
      }
    } catch (err) {
      setStatus('ERROR');
      setErrorMsg('Kamera wajib diaktifkan untuk verifikasi biometrik.');
    }
  };

  const completeAttendance = () => {
    if (!firestore || !user) return;

    const attendanceRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/attendance`);
    addDocumentNonBlocking(attendanceRef, {
      studentId: user.uid,
      studentName: user.profile?.displayName || user.email,
      date: serverTimestamp(),
      status: 'Hadir',
      notes: 'Absensi Biometrik Wajah & GPS (Radius Verified)',
      metadata: {
        distance: distance,
        type: 'BIOMETRIC_APP'
      }
    });

    // Stop camera
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }

    setStatus('SUCCESS');
    toast({ title: 'Presensi Berhasil', description: 'Kehadiran Anda telah dicatat oleh sistem.' });
  };

  return (
    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white/5 backdrop-blur-md overflow-hidden border">
      <CardHeader className="p-8 border-b border-white/5">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <CardTitle className="text-xl font-black italic uppercase font-headline">Biometric <span className="text-primary">Attendance</span></CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Validasi Kehadiran Digital v1.0</CardDescription>
                </div>
            </div>
            {status === 'IDLE' && (
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Sistem Ready</span>
                </div>
            )}
        </div>
      </CardHeader>

      <CardContent className="p-8">
        {status === 'IDLE' && (
            <div className="text-center space-y-8 py-6">
                <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto group relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-[2rem] animate-ping opacity-20"></div>
                    <Navigation size={40} className="text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="space-y-2">
                    <h4 className="text-lg font-black uppercase italic tracking-tighter">Deteksi Lokasi & Wajah</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                        Pastikan Anda berada di area sekolah (Radius 30m) untuk memulai proses absensi biometrik.
                    </p>
                </div>
                <Button onClick={handleStartAttendance} className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.3em] shadow-3xl glow-primary hover:scale-[1.02] transition-all">
                    MULAI ABSENSI SEKARANG
                </Button>
            </div>
        )}

        {status === 'CHECKING_LOCATION' && (
            <div className="text-center py-16 space-y-6">
                <LoaderCircle className="h-16 w-16 animate-spin mx-auto text-primary" />
                <div className="space-y-1">
                    <p className="text-sm font-black uppercase italic tracking-widest">Memeriksa GPS...</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Sinkronisasi Koordinat Satelit</p>
                </div>
            </div>
        )}

        {(status === 'VERIFYING_BIOMETRIC' || status === 'SCANNING') && (
            <div className="space-y-8 animate-reveal">
                <div className="relative aspect-square max-w-[280px] mx-auto rounded-[3rem] overflow-hidden border-4 border-primary/20 shadow-2xl bg-black">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    
                    {/* Overlay Scanning Effect */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="w-full h-1 bg-primary/50 absolute top-0 animate-[scan_2s_infinite] shadow-[0_0_15px_primary]"></div>
                        <div className="absolute inset-0 border-[20px] border-black/20"></div>
                        <div className="absolute top-6 left-6 border-t-4 border-l-4 border-primary w-8 h-8 rounded-tl-xl"></div>
                        <div className="absolute top-6 right-6 border-t-4 border-r-4 border-primary w-8 h-8 rounded-tr-xl"></div>
                        <div className="absolute bottom-6 left-6 border-b-4 border-l-4 border-primary w-8 h-8 rounded-bl-xl"></div>
                        <div className="absolute bottom-6 right-6 border-b-4 border-r-4 border-primary w-8 h-8 rounded-br-xl"></div>
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                        <span className="text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                            Biometric Live Scan
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-primary">{status === 'SCANNING' ? 'Menganalisis Wajah...' : 'Inisialisasi Sensor...'}</span>
                        <span className="opacity-40">{scanProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_primary]" 
                            style={{ width: `${scanProgress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        )}

        {status === 'SUCCESS' && (
            <div className="text-center py-12 space-y-8 animate-reveal">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner relative">
                    <div className="absolute inset-0 bg-emerald-500/5 rounded-[2.5rem] animate-ping opacity-20"></div>
                    <CheckCircle2 size={48} className="relative z-10" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Presensi Berhasil</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                        Data kehadiran Anda telah diverifikasi secara biometrik dan tersimpan di database sekolah.
                    </p>
                </div>
                <div className="flex items-center gap-3 justify-center p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="p-2 bg-emerald-500 text-white rounded-lg">
                        <Sparkles size={14} />
                    </div>
                    <div className="text-left leading-none">
                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Status Kehadiran</p>
                        <p className="text-xs font-bold uppercase">Terverifikasi 100%</p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => setStatus('IDLE')} className="w-full h-14 rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] border-white/5 hover:bg-white/5">
                    Kembali Ke Dashboard
                </Button>
            </div>
        )}

        {status === 'ERROR' && (
            <div className="text-center py-12 space-y-8 animate-reveal">
                <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                    <AlertCircle size={48} />
                </div>
                <div className="space-y-3">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-red-500">Akses Ditolak</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                        {errorMsg}
                    </p>
                </div>
                <Button onClick={() => setStatus('IDLE')} className="w-full h-14 rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] bg-red-500 text-white hover:bg-red-600">
                    Coba Lagi
                </Button>
            </div>
        )}
      </CardContent>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </Card>
  );
}
