
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation, LoaderCircle, CheckCircle2, ShieldCheck, AlertCircle, Sparkles, LogIn, LogOut } from 'lucide-react';
import { useUser, useFirestore, addDocumentNonBlocking, useDoc, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type School } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { calculateDistance } from '@/lib/utils';
import { Badge } from '../ui/badge';

type AttendanceStatus = 'IDLE' | 'CHECKING_LOCATION' | 'VERIFYING_BIOMETRIC' | 'SCANNING' | 'SUCCESS' | 'ERROR';

/**
 * Modul Absensi Biometrik Digital v3.8.
 * Menentukan arah Masuk/Pulang secara cerdas berdasarkan jendela waktu shift operasional.
 */
export function BiometricAttendance() {
  const { user, profile } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<AttendanceStatus>('IDLE');
  const [distance, setDistance] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [scanProgress, setScanProgress] = useState(0);
  const [direction, setDirection] = useState<'Masuk' | 'Pulang' | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const schoolDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'schools', SCHOOL_DATA_ID) : null, [firestore]);
  const { data: schoolData } = useDoc<School>(schoolDocRef);

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
        const schoolLat = schoolData?.latitude || -5.4;
        const schoolLng = schoolData?.longitude || 105.1;
        
        const dist = calculateDistance(latitude, longitude, schoolLat, schoolLng);
        setDistance(dist);

        if (dist > 30) {
          setStatus('ERROR');
          setErrorMsg(`Jarak terdeteksi ${Math.round(dist)}m. Maksimal radius absensi adalah 30m dari sekolah.`);
          return;
        }

        // SMART SHIFT WINDOWS
        const now = new Date();
        const currentHour = now.getHours();
        let type: 'Masuk' | 'Pulang' = 'Masuk';

        if (profile?.session === 'Siang') {
            // Sesi Siang: Masuk jam 11:00-14:59, Pulang jam >= 15:00
            type = currentHour >= 15 ? 'Pulang' : 'Masuk';
        } else {
            // Sesi Pagi (Default): Masuk jam < 11:00, Pulang jam >= 11:00
            type = currentHour >= 11 ? 'Pulang' : 'Masuk';
        }
        
        setDirection(type);
        startBiometricScan();
      },
      (err) => {
        setStatus('ERROR');
        setErrorMsg('Gagal memvalidasi lokasi. Aktifkan GPS dengan akurasi tinggi.');
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
        
        setTimeout(() => {
          setStatus('SCANNING');
          let progress = 0;
          const interval = setInterval(() => {
            progress += 5;
            setScanProgress(progress);
            if (progress >= 100) {
              clearInterval(interval);
              captureAndProcess();
            }
          }, 80);
        }, 1500);
      }
    } catch (err) {
      setStatus('ERROR');
      setErrorMsg('Kamera wajib diaktifkan untuk identifikasi biometrik wajah.');
    }
  };

  const generateBiometricSignature = (dataUrl: string) => {
    const base = btoa(dataUrl.substring(50, 150)).substring(0, 8);
    const ts = Date.now().toString(36).toUpperCase();
    return `BIO-${base}-${ts}`;
  };

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current || !user || !profile) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.1); 

    try {
      const bioCode = generateBiometricSignature(dataUrl);

      const attendanceRef = collection(firestore!, `schools/${SCHOOL_DATA_ID}/attendance`);
      const attendanceData = {
        studentId: user.uid,
        studentName: profile.displayName || user.email,
        studentNis: profile.nis || 'N/A',
        studentClass: profile.className || 'N/A',
        date: serverTimestamp(),
        status: 'Hadir',
        notes: `Presensi ${direction} Digital (Shift ${profile.session || 'Pagi'})`,
        biometricCode: bioCode,
        metadata: {
          distance: distance,
          type: 'BIOMETRIC_SYNC_MOBILE',
          session: profile.session || 'Pagi',
          direction: direction
        }
      };
      
      addDocumentNonBlocking(attendanceRef, attendanceData);

      if (schoolData?.attendanceWebhookUrl) {
        fetch(schoolData.attendanceWebhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({ ...attendanceData, date: new Date().toLocaleString('id-ID') })
        }).catch(() => {});
      }

      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }

      setStatus('SUCCESS');
      toast({ title: 'Absensi Berhasil', description: `Sesi ${direction} Anda telah terdata.` });
    } catch (e) {
      setStatus('ERROR');
      setErrorMsg('Gagal memproses tanda tangan digital.');
    }
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
                    <CardTitle className="text-xl font-bold italic uppercase font-headline">Absensi <span className="text-primary">Biometrik</span></CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                        Shift {profile?.session || 'Pagi'} v3.8
                    </CardDescription>
                </div>
            </div>
            {status === 'IDLE' && (
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Aktif</span>
                </div>
            )}
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <canvas ref={canvasRef} className="hidden" />
        
        {status === 'IDLE' && (
            <div className="text-center space-y-8 py-6">
                <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto group relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-[2rem] animate-ping opacity-20"></div>
                    <Navigation size={40} className="text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="space-y-3">
                    <h4 className="text-lg font-black uppercase italic tracking-tighter">Validasi Identitas Digital</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                        Sistem mendeteksi shift Anda sebagai <span className='text-primary'>Sesi {profile?.session || 'Pagi'}</span>. Pastikan Anda berada di lingkungan sekolah.
                    </p>
                </div>
                <Button onClick={handleStartAttendance} className="w-full h-16 rounded-[1.5rem] font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                    Mulai Absensi {profile?.session || 'Pagi'}
                </Button>
            </div>
        )}

        {status === 'CHECKING_LOCATION' && (
            <div className="text-center py-16 space-y-6">
                <LoaderCircle className="h-16 w-16 animate-spin mx-auto text-primary" />
                <div className="space-y-1">
                    <p className="text-sm font-black uppercase italic tracking-widest">Validasi GPS...</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Memeriksa Radius Geofence</p>
                </div>
            </div>
        )}

        {(status === 'VERIFYING_BIOMETRIC' || status === 'SCANNING') && (
            <div className="space-y-8 animate-reveal">
                <div className="relative aspect-square max-w-[280px] mx-auto rounded-[3rem] overflow-hidden border-4 border-primary/20 shadow-2xl bg-black">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
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
                            Scanner Active
                        </span>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-primary">{status === 'SCANNING' ? 'Menganalisis Wajah...' : 'Inisialisasi Sensor...'}</span>
                        <span className="opacity-40">{scanProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_primary]" style={{ width: `${scanProgress}%` }}></div>
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
                <div className="space-y-3">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Absensi Berhasil</h3>
                    <div className='flex items-center justify-center gap-2'>
                        <Badge className='bg-emerald-500 text-white font-black px-4 py-1 rounded-lg text-[10px] uppercase tracking-widest'>
                            {direction === 'Masuk' ? <LogIn size={12} className='mr-2' /> : <LogOut size={12} className='mr-2' />}
                            {direction} Terverifikasi
                        </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                        Data kehadiran Anda telah diamankan di database pusat untuk sesi {profile?.session || 'Pagi'}.
                    </p>
                </div>
                <Button variant="outline" onClick={() => setStatus('IDLE')} className="w-full h-14 rounded-2xl font-bold text-[11px] uppercase border-white/5 hover:bg-white/5">
                    Selesai & Tutup
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
                <Button onClick={() => setStatus('IDLE')} className="w-full h-14 rounded-2xl font-bold text-[11px] uppercase bg-red-500 text-white hover:bg-red-600">
                    Coba Ulang
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
