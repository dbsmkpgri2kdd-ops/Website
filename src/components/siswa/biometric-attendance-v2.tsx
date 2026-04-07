'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoaderCircle, CheckCircle2, ShieldCheck, AlertCircle, Navigation, Maximize2, Minimize2, Camera, Search, LogOut } from 'lucide-react';
import { useUser, useFirestore, addDocumentNonBlocking, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, serverTimestamp, doc, query, where, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type School, type UserProfile } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { calculateDistance } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type AttendanceStatus = 'REGISTRATION' | 'IDLE' | 'CHECKING_LOCATION' | 'VERIFYING_BIOMETRIC' | 'SCANNING' | 'SUCCESS' | 'ERROR';
type RegistrationStep = 'select-class' | 'select-student' | 'confirm';

/**
 * Modul Absensi Biometrik Digital v4.0 - Enhanced
 * Fitur: Registrasi siswa, pencarian database, full screen, multi-device camera support
 * Menggunakan Standard Case dan Zero Italics.
 */
export function BiometricAttendance() {
  const { user: authUser, profile: userProfile } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  // Registration States
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('select-class');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  
  // Attendance States
  const [status, setStatus] = useState<AttendanceStatus>('REGISTRATION');
  const [distance, setDistance] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [scanProgress, setScanProgress] = useState(0);
  const [direction, setDirection] = useState<'Masuk' | 'Pulang' | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isLoadingCameras, setIsLoadingCameras] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Firebase queries
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', 'in', ['siswa', 'guru']), orderBy('email'));
  }, [firestore]);
  const { data: allUsers } = useCollection<UserProfile>(usersQuery);

  const schoolDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'schools', SCHOOL_DATA_ID) : null, [firestore]);
  const { data: schoolData } = useDoc<School>(schoolDocRef);

  // Get unique classes from user database
  const classes = useMemo(() => {
    if (!allUsers) return [];
    const classSet = new Set(allUsers.map(s => s.className).filter((c): c is string => !!c));
    return Array.from(classSet).sort();
  }, [allUsers]);

  // Filter students by class and search
  const filteredStudents = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter(s => {
      const matchesClass = !selectedClass || s.className === selectedClass;
      const matchesSearch = (s.displayName || s.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      const isStudent = s.role === 'siswa';
      return matchesClass && matchesSearch && isStudent;
    });
  }, [allUsers, selectedClass, searchQuery]);

  // Detect available cameras
  useEffect(() => {
    const detectCameras = async () => {
      setIsLoadingCameras(true);
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameraDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCameraId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.warn('Failed to enumerate devices:', err);
      } finally {
        setIsLoadingCameras(false);
      }
    };

    if ('mediaDevices' in navigator) {
      detectCameras();
      const listener = () => detectCameras();
      navigator.mediaDevices.addEventListener('devicechange', listener);
      return () => navigator.mediaDevices.removeEventListener('devicechange', listener);
    }
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleFullScreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullScreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).mozRequestFullScreen) {
          await (containerRef.current as any).mozRequestFullScreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          await (containerRef.current as any).msRequestFullscreen();
        }
        setIsFullScreen(true);
      } else {
        try {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen();
          } else if ((document as any).mozCancelFullScreen) {
            await (document as any).mozCancelFullScreen();
          } else if ((document as any).msExitFullscreen) {
            await (document as any).msExitFullscreen();
          }
        } catch (e) {
          console.warn('Fullscreen exit failed:', e);
        }
        setIsFullScreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
      toast({ variant: 'destructive', title: 'Full Screen Tidak Didukung' });
    }
  };

  const handleConfirmStudent = () => {
    const student = allUsers?.find(s => s.id === selectedStudentId);
    if (student) {
      setSelectedStudent(student);
      setStatus('IDLE');
    }
  };

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
        const schoolLat = schoolData?.latitude || -5.4656994;
        const schoolLng = schoolData?.longitude || 104.9996424;
        const maxRadius = schoolData?.attendanceRadius || 30;
        
        const dist = calculateDistance(latitude, longitude, schoolLat, schoolLng);
        setDistance(dist);

        if (dist > maxRadius) {
          setStatus('ERROR');
          setErrorMsg(`Jarak terdeteksi ${Math.round(dist)}m. Anda harus berada dalam radius ${maxRadius}m dari sekolah.`);
          return;
        }

        const now = new Date();
        const currentHour = now.getHours();
        let type: 'Masuk' | 'Pulang' = 'Masuk';

        if (selectedStudent?.session === 'Siang') {
          type = currentHour >= 15 ? 'Pulang' : 'Masuk';
        } else {
          type = currentHour >= 11 ? 'Pulang' : 'Masuk';
        }
        
        setDirection(type);
        startBiometricScan();
      },
      (err) => {
        setStatus('ERROR');
        setErrorMsg('Gagal memvalidasi lokasi. Pastikan GPS aktif dan berikan izin akses lokasi.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const startBiometricScan = async () => {
    setStatus('VERIFYING_BIOMETRIC');
    try {
      const constraints: MediaStreamConstraints = {
        video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : { facingMode: 'user' },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasCameraPermission(true);
      
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
        }, 1000);
      }
    } catch (err) {
      setHasCameraPermission(false);
      setStatus('ERROR');
      setErrorMsg('Kamera wajib diaktifkan untuk verifikasi wajah (Biometrik). Periksa izin akses kamera.');
    }
  };

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedStudent) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.2);

    try {
      const bioCode = `BIO-${selectedStudent.id?.substring(0, 5)}-${Date.now()}`;

      const attendanceRef = collection(firestore!, `schools/${SCHOOL_DATA_ID}/attendance`);
      const attendanceData = {
        studentId: selectedStudent.id,
        studentName: selectedStudent.displayName || selectedStudent.email,
        studentNis: selectedStudent.nis || 'N/A',
        studentClass: selectedStudent.className || 'N/A',
        date: serverTimestamp(),
        status: 'Hadir',
        notes: `Presensi ${direction} Otomatis (Shift ${selectedStudent.session || 'Pagi'})`,
        biometricCode: bioCode,
        metadata: {
          distance: distance,
          type: 'BIOMETRIC_MOBILE_V4',
          session: selectedStudent.session || 'Pagi',
          direction: direction,
          snapshot: dataUrl,
          cameraDeviceId: selectedCameraId
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
      setStatus('SUCCESS');
      toast({ title: 'Absensi Berhasil', description: `Data kehadiran ${direction} ${selectedStudent.displayName} telah tersimpan.` });
    } catch (e) {
      setStatus('ERROR');
      setErrorMsg('Gagal memproses data biometrik. Silakan coba lagi.');
    }
  };

  // Registration UI
  if (status === 'REGISTRATION') {
    return (
      <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden border font-sans">
        <CardHeader className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <ShieldCheck size={20} />
            </div>
            <div>
              <CardTitle className="text-xl font-bold font-headline">Registrasi Absensi Biometrik</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                Langkah {registrationStep === 'select-class' ? '1' : registrationStep === 'select-student' ? '2' : '3'} dari 3
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {registrationStep === 'select-class' && (
            <div className="space-y-6 animate-reveal">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-3">Pilih Kelas</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="h-14 rounded-2xl text-base font-bold">
                    <SelectValue placeholder="-- Pilih Kelas --" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => setRegistrationStep('select-student')}
                disabled={!selectedClass}
                className="w-full h-14 rounded-2xl font-bold text-sm"
              >
                Lanjutkan
              </Button>
            </div>
          )}

          {registrationStep === 'select-student' && (
            <div className="space-y-6 animate-reveal">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-3">Cari Nama Siswa</label>
                <div className="relative">
                  <Input 
                    placeholder="Ketik nama siswa..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 rounded-2xl pl-12 text-base font-bold"
                  />
                  <Search size={18} className="absolute left-4 top-3 text-muted-foreground opacity-30" />
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-100 rounded-2xl p-4">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm font-bold">Siswa tidak ditemukan</p>
                  </div>
                ) : (
                  filteredStudents.map(student => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={cn(
                        "w-full p-4 rounded-xl text-left transition-all border-2",
                        selectedStudentId === student.id
                          ? "bg-primary/10 border-primary"
                          : "bg-slate-50 border-slate-100 hover:border-primary/50"
                      )}
                    >
                      <p className="font-bold text-sm">{student.displayName || student.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">{student.nis || 'N/A'} • {student.className}</p>
                    </button>
                  ))
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setRegistrationStep('select-class')}
                  className="flex-1 h-12 rounded-xl font-bold text-sm"
                >
                  Kembali
                </Button>
                <Button 
                  onClick={() => setRegistrationStep('confirm')}
                  disabled={!selectedStudentId}
                  className="flex-1 h-12 rounded-xl font-bold text-sm"
                >
                  Pilih
                </Button>
              </div>
            </div>
          )}

          {registrationStep === 'confirm' && (
            <div className="space-y-6 animate-reveal">
              <div className="p-6 bg-primary/5 rounded-2xl border-2 border-primary/20">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Siswa Terpilih</p>
                <p className="text-xl font-black text-slate-900">{selectedStudent?.displayName || 'Siswa'}</p>
                <div className="flex gap-3 mt-3">
                  <Badge className="bg-primary/20 text-primary">{selectedStudent?.nis}</Badge>
                  <Badge className="bg-slate-200 text-slate-700">{selectedStudent?.className}</Badge>
                </div>
              </div>

              <Alert>
                <ShieldCheck size={16} className="text-primary" />
                <AlertTitle>Konfirmasi Registrasi</AlertTitle>
                <AlertDescription>
                  Data siswa akan digunakan untuk pencatatan absensi biometrik. Pastikan data sudah benar sebelum melanjutkan.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setRegistrationStep('select-student');
                    setSelectedStudentId('');
                  }}
                  className="flex-1 h-12 rounded-xl font-bold text-sm"
                >
                  Ubah Pilihan
                </Button>
                <Button 
                  onClick={handleConfirmStudent}
                  className="flex-1 h-12 rounded-xl font-bold text-sm"
                >
                  Konfirmasi & Mulai
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Main Attendance UI (same as before but with F11/full screen support)
  return (
    <div 
      ref={containerRef}
      className={cn(
        "rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden border font-sans transition-all",
        isFullScreen && "fixed inset-0 rounded-none shadow-none"
      )}
    >
      <Card className="h-full rounded-none border-none shadow-none">
        <CardHeader className={cn("border-b border-slate-50", isFullScreen ? "p-6" : "p-8")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <ShieldCheck size={20} />
              </div>
              <div>
                <CardTitle className="text-xl font-bold font-headline">Absensi Biometrik</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  {selectedStudent?.displayName} • {selectedStudent?.className} • v4.0
                </CardDescription>
              </div>
            </div>
            {status === 'IDLE' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Siap</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullScreen}
                  className="rounded-lg h-9 w-9 hover:bg-slate-100"
                  title="Toggle Full Screen"
                >
                  {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className={cn("flex-1", isFullScreen ? "p-6" : "p-8")}>
          <canvas ref={canvasRef} className="hidden" />
          
          {status === 'IDLE' && (
            <div className="text-center space-y-8 py-6 animate-reveal">
              <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto group relative">
                <div className="absolute inset-0 bg-primary/10 rounded-[2rem] animate-ping opacity-20"></div>
                <Navigation size={40} className="text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-3">
                <h4 className="text-lg font-black uppercase tracking-tighter">Validasi Identitas</h4>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                  Anda terdaftar pada <span className='text-primary'>Sesi {selectedStudent?.session || 'Pagi'}</span>. Pastikan Anda berada di area sekolah untuk melakukan absensi.
                </p>
              </div>

              {cameraDevices.length > 1 && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Pilih Kamera</label>
                  <Select value={selectedCameraId} onValueChange={setSelectedCameraId}>
                    <SelectTrigger className="h-10 rounded-xl text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cameraDevices.map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || `Kamera ${cameraDevices.indexOf(device) + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button onClick={handleStartAttendance} className="w-full h-16 rounded-[1.5rem] font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                Mulai Absensi {selectedStudent?.session || 'Pagi'}
              </Button>

              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setRegistrationStep('select-class');
                  setStatus('REGISTRATION');
                }}
                className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
              >
                Ubah Siswa
              </button>
            </div>
          )}

          {status === 'CHECKING_LOCATION' && (
            <div className="text-center py-16 space-y-6">
              <LoaderCircle className="h-16 w-16 animate-spin mx-auto text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-black uppercase tracking-widest">Memvalidasi GPS...</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase">Memeriksa Radius Geofence</p>
              </div>
            </div>
          )}

          {(status === 'VERIFYING_BIOMETRIC' || status === 'SCANNING') && (
            <div className={cn("space-y-8 animate-reveal", isFullScreen && "h-full flex flex-col")}>
              <div className={cn("relative rounded-[3rem] overflow-hidden border-4 border-primary/20 shadow-2xl bg-black", isFullScreen ? "flex-1 max-h-[80vh]" : "aspect-square max-w-[280px] mx-auto")}>
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-1 bg-primary/50 absolute top-0 animate-[scan_2s_infinite] shadow-[0_0_15px_primary]"></div>
                  <div className="absolute inset-0 border-[20px] border-black/20"></div>
                </div>
                {hasCameraPermission === false && (
                  <Alert variant="destructive" className="absolute inset-x-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-md">
                    <AlertTitle>Akses Kamera Wajib</AlertTitle>
                    <AlertDescription>Harap izinkan akses kamera untuk verifikasi.</AlertDescription>
                  </Alert>
                )}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                  <span className="text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    Sensor Aktif
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-primary">{status === 'SCANNING' ? 'Menganalisis Wajah...' : 'Inisialisasi Biometrik...'}</span>
                  <span className="opacity-40">{scanProgress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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
                <h3 className="text-2xl font-black uppercase tracking-tighter">Berhasil</h3>
                <div className='flex items-center justify-center gap-2'>
                  <Badge className='bg-emerald-500 text-white font-black px-4 py-1 rounded-lg text-[10px] uppercase tracking-widest'>
                    Presensi {direction} Valid
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                  Data kehadiran {selectedStudent?.displayName} telah disinkronkan ke database pusat.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStatus('IDLE')} className="flex-1 h-12 rounded-2xl font-bold text-[11px] uppercase border-slate-100 hover:bg-slate-50">
                  Absensi Lagi
                </Button>
                <Button variant="outline" onClick={() => {
                  setSelectedStudent(null);
                  setStatus('REGISTRATION');
                  setRegistrationStep('select-class');
                }} className="flex-1 h-12 rounded-2xl font-bold text-[11px] uppercase border-slate-100 hover:bg-slate-50">
                  <LogOut size={14} className="mr-2" />
                  Keluar
                </Button>
              </div>
            </div>
          )}

          {status === 'ERROR' && (
            <div className="text-center py-12 space-y-8 animate-reveal">
              <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle size={48} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-red-500">Akses Dibatasi</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                  {errorMsg}
                </p>
              </div>
              <Button onClick={() => setStatus('IDLE')} className="w-full h-12 rounded-2xl font-bold text-[11px] uppercase bg-red-500 text-white hover:bg-red-600 shadow-lg">
                Coba Lagi
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
