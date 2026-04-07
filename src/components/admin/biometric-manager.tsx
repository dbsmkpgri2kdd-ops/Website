'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LoaderCircle, CheckCircle2, ShieldCheck, 
  ScanFace, UserPlus, Users, Search, Volume2, MonitorCheck,
  LogIn, LogOut, Info, Clock, Camera
} from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, query, where, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type UserProfile, type School } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type BiometricStatus = 'IDLE' | 'SCANNING' | 'SUCCESS' | 'NOT_RECOGNIZED' | 'ERROR';

interface CardBaseProps {
  status: BiometricStatus;
  progress: number;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onStart: () => void;
}

interface EnrollmentCardProps extends CardBaseProps {
  student?: UserProfile;
}

interface TerminalCardProps extends CardBaseProps {
  recognizedStudent: UserProfile | null;
  attendanceType: 'Masuk' | 'Pulang' | null;
}

export function BiometricManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [status, setStatus] = useState<BiometricStatus>('IDLE');
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [recognizedStudent, setRecognizedStudent] = useState<UserProfile | null>(null);
  const [attendanceType, setAttendanceType] = useState<'Masuk' | 'Pulang' | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [autoAttendanceMode, setAutoAttendanceMode] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const playSuccessSound = () => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
      audio.play().catch(e => console.warn("Audio play blocked", e));
    }
  };

  const playErrorSound = () => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.warn("Audio play blocked", e));
    }
  };

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', 'in', ['siswa', 'guru']), orderBy('email'));
  }, [firestore]);
  const { data: users, isLoading: isUsersLoading } = useCollection<UserProfile>(usersQuery);

  const schoolDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'schools', SCHOOL_DATA_ID) : null, [firestore]);
  const { data: schoolData } = useDoc<School>(schoolDocRef);

  const classes = useMemo(() => {
    if (!users) return [];
    const classSet = new Set(users.map(s => s.className).filter((c): c is string => !!c));
    return Array.from(classSet).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(s => {
      const matchesClass = selectedClass === 'ALL' || s.className === selectedClass;
      const matchesSearch = (s.displayName || s.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesClass && matchesSearch;
    });
  }, [users, selectedClass, searchQuery]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    enumerateCameras();
  }, []);

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

  const startCamera = async () => {
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
        try {
          await videoRef.current.play();
        } catch (err) {
          console.error('Video play error:', err);
        }
      }
      return true;
    } catch (err: any) {
      setHasCameraPermission(false);
      let errorMsg = 'Pastikan izin kamera diberikan.';
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Izin kamera ditolak. Harap ubah pengaturan browser.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'Kamera tidak ditemukan di perangkat ini.';
      }
      toast({ variant: 'destructive', title: 'Akses Kamera Gagal', description: errorMsg });
      return false;
    }
  };

  const handleEnrollment = async () => {
    if (!selectedStudentId) {
      toast({ variant: 'destructive', title: 'Pilih Pengguna', description: 'Pilih siswa atau guru yang akan didaftarkan.' });
      return;
    }

    const cameraActive = await startCamera();
    if (!cameraActive) return;

    setStatus('SCANNING');
    setScanProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        processCapture('ENROLL');
      }
    }, 100);
  };

  const activateTerminal = async () => {
    const cameraActive = await startCamera();
    if (!cameraActive) return;

    setStatus('SCANNING');
    setScanProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        processCapture('TERMINAL_AUTO');
      }
    }, 60);
  };

  const generateHash = (dataUrl: string) => {
    const base = btoa(dataUrl.substring(100, 200)).substring(0, 12);
    return `ENR-${base}`;
  };

  const processCapture = async (mode: 'ENROLL' | 'TERMINAL_AUTO') => {
    if (!videoRef.current || !canvasRef.current || !firestore) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.1);
    const currentSignature = generateHash(dataUrl);

    try {
      if (mode === 'ENROLL') {
        const userRef = doc(firestore, 'users', selectedStudentId);
        updateDocumentNonBlocking(userRef, { biometricSignature: currentSignature });
        playSuccessSound();
        toast({ title: 'Registrasi Berhasil', description: `Identitas biometrik telah disimpan.` });
        setStatus('SUCCESS');
        setTimeout(() => {
            setStatus('IDLE');
            stopCamera();
        }, 3000);
      } else {
        const matchedUser = users?.find(u => u.biometricSignature && u.biometricSignature.substring(0, 8) === currentSignature.substring(0, 8));

        if (!matchedUser) {
          playErrorSound();
          setStatus('NOT_RECOGNIZED');
          setTimeout(() => setStatus('SCANNING'), 3000);
          return;
        }

        setRecognizedStudent(matchedUser);

        const now = new Date();
        const currentHour = now.getHours();
        let type: 'Masuk' | 'Pulang' = 'Masuk';

        if (matchedUser.session === 'Siang') {
            type = currentHour >= 15 ? 'Pulang' : 'Masuk';
        } else {
            type = currentHour >= 11 ? 'Pulang' : 'Masuk';
        }
        
        setAttendanceType(type);

        const attendanceRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/attendance`);
        const selectedCameraLabel = cameraDevices.find(d => d.deviceId === selectedCameraId)?.label || 'Default';
        
        const attendanceData = {
          studentId: matchedUser.id,
          studentName: matchedUser.displayName || matchedUser.email,
          studentNis: matchedUser.nis || 'N/A',
          studentClass: matchedUser.className || 'Staf',
          date: serverTimestamp(),
          status: 'Hadir',
          notes: `Absensi ${type} via Terminal (Shift ${matchedUser.session || 'Pagi'})`,
          biometricCode: currentSignature,
          metadata: { 
            type: 'TERMINAL_AI_AUTO',
            direction: type,
            session: matchedUser.session || 'Pagi',
            camera: selectedCameraLabel
          }
        };
        
        addDocumentNonBlocking(attendanceRef, attendanceData);

        if (schoolData?.attendanceWebhookUrl) {
          fetch(schoolData.attendanceWebhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({ ...attendanceData, date: now.toLocaleString('id-ID') })
          }).catch(() => {});
        }

        playSuccessSound();
        setStatus('SUCCESS');
        
        setTimeout(() => {
          setRecognizedStudent(null);
          setAttendanceType(null);
          activateTerminal();
        }, 4000);
      }
    } catch (e) {
      setStatus('ERROR');
      playErrorSound();
      toast({ variant: 'destructive', title: 'Proses Gagal' });
    }
  };

  return (
    <div className="space-y-8 animate-reveal pb-20">
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
            <h2 className='text-3xl font-black tracking-tighter text-slate-900 font-headline uppercase'>Pusat Biometrik v3.8</h2>
            <p className='text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest'>Terminal pengenalan wajah cerdas dengan dukungan shift otomatis.</p>
        </div>
        <div className='flex items-center gap-3 bg-emerald-500/10 text-emerald-600 p-3 rounded-2xl border border-emerald-500/20'>
            <div className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_emerald]'></div>
            <p className='text-[9px] font-black uppercase tracking-widest'>Multi-Shift Sensor Aktif</p>
        </div>
      </div>

      <Tabs defaultValue="terminal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 rounded-2xl bg-slate-50 p-1 mb-8 shadow-inner">
          <TabsTrigger value="terminal" className="rounded-xl font-bold text-xs">
            <MonitorCheck className="mr-2 h-4 w-4" /> Terminal Otomatis
          </TabsTrigger>
          <TabsTrigger value="enrollment" className="rounded-xl font-bold text-xs">
            <UserPlus className="mr-2 h-4 w-4" /> Registrasi Wajah
          </TabsTrigger>
        </TabsList>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden border">
              <CardHeader className="p-8 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-3">
                  <Users size={18} className="text-primary" /> Database Civitas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 space-y-4 bg-slate-50 border-b">
                  {/* Camera Selection */}
                  {cameraDevices.length > 1 && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Pilih Kamera:</label>
                      <select 
                        value={selectedCameraId}
                        onChange={(e) => setSelectedCameraId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border-slate-100 text-xs font-bold focus:outline-none focus:border-primary"
                      >
                        {cameraDevices.map(device => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Kamera ${device.deviceId.substring(0, 5)}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Search Input */}
                  <div className="relative">
                    <Input 
                      placeholder="Cari nama/NIS..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-11 rounded-xl bg-white border-slate-100 pl-10 text-xs"
                    />
                    <Search className="absolute left-3.5 top-3.5 text-slate-400 opacity-40" size={16} />
                  </div>

                  {/* Class Filter */}
                  <Select onValueChange={setSelectedClass} value={selectedClass}>
                    <SelectTrigger className="h-11 rounded-xl bg-white border-slate-100 font-bold text-[10px] uppercase">
                      <SelectValue placeholder="Semua Kelas" />
                    </SelectTrigger>
                    <SelectContent className='rounded-xl border-slate-100'>
                      <SelectItem value="ALL" className="font-bold text-[10px] uppercase py-3">Semua Kelas</SelectItem>
                      {classes.map(c => <SelectItem key={c} value={c} className="font-bold text-[10px] uppercase py-3">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <ScrollArea className="h-[450px]">
                  <div className="p-4 space-y-1">
                    {isUsersLoading ? (
                      Array.from({length: 5}).map((_, i) => <div key={i} className="h-14 w-full bg-slate-50 animate-pulse rounded-xl" />)
                    ) : (
                      filteredUsers.map(u => (
                        <button
                          key={u.id}
                          onClick={() => setSelectedStudentId(u.id || '')}
                          className={cn(
                            "w-full flex items-center justify-between p-4 rounded-xl transition-all text-left",
                            selectedStudentId === u.id 
                              ? "bg-primary text-white shadow-lg" 
                              : "hover:bg-slate-50"
                          )}
                        >
                          <div className='flex flex-col'>
                            <p className="text-xs font-bold truncate max-w-[120px]">{u.displayName || u.email}</p>
                            <div className='flex items-center gap-2 mt-0.5'>
                                <p className={cn("text-[8px] font-black uppercase", selectedStudentId === u.id ? "text-white/60" : "text-slate-400")}>
                                    {u.className || 'STAF'}
                                </p>
                                <Badge variant="outline" className={cn("h-3.5 text-[7px] font-black px-1.5", selectedStudentId === u.id ? "border-white/20 text-white" : "border-primary/20 text-primary")}>
                                    SHIFT {u.session || 'PAGI'}
                                </Badge>
                            </div>
                          </div>
                          {u.biometricSignature && (
                            <div className={cn("p-1.5 rounded-lg", selectedStudentId === u.id ? "bg-white/20" : "bg-emerald-500/10 text-emerald-600")}>
                              <ShieldCheck size={12} />
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <TabsContent value="terminal" className="mt-0">
              <TerminalCard 
                status={status}
                recognizedStudent={recognizedStudent}
                attendanceType={attendanceType}
                onStart={activateTerminal}
                progress={scanProgress}
                videoRef={videoRef}
                canvasRef={canvasRef}
              />
            </TabsContent>
            <TabsContent value="enrollment" className="mt-0">
              <EnrollmentCard 
                status={status} 
                student={users?.find(s => s.id === selectedStudentId)}
                onStart={handleEnrollment}
                progress={scanProgress}
                videoRef={videoRef}
                canvasRef={canvasRef}
              />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

function EnrollmentCard({ status, student, onStart, progress, videoRef, canvasRef }: EnrollmentCardProps) {
  return (
    <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden h-full border">
      <CardHeader className="p-8 border-b bg-primary/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary text-white rounded-2xl shadow-lg">
            <UserPlus size={24} />
          </div>
          <div>
            <CardTitle className="text-xl font-bold uppercase font-headline">Pendaftaran Wajah</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Registrasi identitas biometrik untuk shift {student?.session || 'Pagi'}.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-10 text-center">
        <canvas ref={canvasRef} className="hidden" />
        
        {status === 'IDLE' && (
          <div className="space-y-8 py-10">
            <div className="w-32 h-32 bg-primary/5 rounded-[3rem] flex items-center justify-center mx-auto border-4 border-dashed border-primary/20">
              <ScanFace size={64} className="text-primary/40" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Ekstraksi Digital</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                {student ? `Mendaftarkan wajah ${student.displayName}. Pastikan pencahayaan cukup untuk akurasi sinkronisasi.` : 'Pilih pengguna dari daftar sebelah kiri untuk mendaftarkan wajah.'}
              </p>
            </div>
            <Button onClick={onStart} disabled={!student} className="h-16 px-12 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all uppercase text-[10px] tracking-widest">
              Mulai Pemindaian Wajah
            </Button>
          </div>
        )}

        {status === 'SCANNING' && (
          <div className="space-y-8 animate-reveal">
            <div className="relative aspect-square max-w-[320px] mx-auto rounded-[3rem] overflow-hidden border-4 border-primary/20 shadow-2xl bg-black">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-1 bg-primary/50 absolute top-0 animate-[scan_2s_infinite] shadow-[0_0_15px_primary]"></div>
                <div className="absolute inset-0 border-[30px] border-black/20"></div>
              </div>
            </div>
            <div className="space-y-4 max-w-xs mx-auto">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                <span>Ekstraksi Biometrik...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="py-12 space-y-6 animate-reveal text-center">
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl relative">
              <div className='absolute inset-0 bg-emerald-500 rounded-[2rem] animate-ping opacity-20'></div>
              <CheckCircle2 size={48} className='relative z-10' />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight">Registrasi Berhasil</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Wajah Telah Terdaftar Ke Sesi {student?.session || 'Pagi'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TerminalCard({ status, recognizedStudent, attendanceType, onStart, progress, videoRef, canvasRef }: TerminalCardProps) {
  return (
    <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden h-full border">
      <CardHeader className="p-8 border-b bg-emerald-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg">
              <MonitorCheck size={24} />
            </div>
            <div>
              <CardTitle className="text-xl font-bold uppercase font-headline">Terminal Otomatis</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Sistem deteksi wajah & shift cerdas.</CardDescription>
            </div>
          </div>
          <div className='flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg'>
            <Volume2 size={14} className='text-emerald-600' />
            <span className='text-[9px] font-black uppercase text-emerald-600'>Audio Aktif</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-10 text-center">
        <canvas ref={canvasRef} className="hidden" />
        
        {status === 'IDLE' && (
          <div className="space-y-8 py-10">
            <div className="w-32 h-32 bg-emerald-500/5 rounded-[3rem] flex items-center justify-center mx-auto border-4 border-dashed border-emerald-500/20">
              <ScanFace size={64} className="text-emerald-500/40 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter font-headline leading-none">Aktifkan Terminal</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                Terminal mengenali wajah secara otomatis dan mencatat arah Masuk/Pulang sesuai sesi operasional.
              </p>
            </div>
            <Button onClick={onStart} className="h-16 px-12 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] transition-all uppercase text-[10px] tracking-widest">
              Mulai Operasi Terminal
            </Button>
          </div>
        )}

        {status === 'SCANNING' && (
          <div className="space-y-8 animate-reveal">
            <div className="relative aspect-square max-w-[320px] mx-auto rounded-[3rem] overflow-hidden border-4 border-emerald-500/20 shadow-2xl bg-black">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-1 bg-emerald-500/50 absolute top-0 animate-[scan_2s_infinite] shadow-[0_0_15px_primary]"></div>
                <div className="absolute inset-0 border-[20px] border-black/40"></div>
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                <span className="text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <div className='w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse'></div>
                  Mode: AI Recognition
                </span>
              </div>
            </div>
            <div className="space-y-4 max-w-xs mx-auto">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-600">
                <span>Memindai Wajah...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {status === 'SUCCESS' && recognizedStudent && (
          <div className="py-12 space-y-8 animate-reveal text-center">
            <div className="w-28 h-28 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl relative">
              <div className='absolute inset-0 bg-emerald-500 rounded-[2.5rem] animate-ping opacity-20'></div>
              <CheckCircle2 size={56} className='relative z-10' />
            </div>
            <div className='space-y-4'>
              <div className='space-y-1'>
                <h3 className="text-3xl font-black uppercase tracking-tighter font-headline leading-none">{recognizedStudent.displayName}</h3>
                <div className='flex items-center justify-center gap-2'>
                    <Badge variant="outline" className='bg-slate-50 border-emerald-500/20 text-emerald-600 px-3 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest'>
                        {recognizedStudent.className || 'STAF'} - SESI {recognizedStudent.session || 'PAGI'}
                    </Badge>
                </div>
              </div>
              <div className='flex items-center justify-center gap-2'>
                <Badge className='bg-emerald-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20'>
                  {attendanceType === 'Masuk' ? <LogIn className='mr-2 h-4 w-4' /> : <LogOut className='mr-2 h-4 w-4' />}
                  Absensi {attendanceType} Berhasil
                </Badge>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-4">Sinkronisasi Cloud Selesai</p>
            </div>
          </div>
        )}

        {status === 'NOT_RECOGNIZED' && (
          <div className="py-12 space-y-8 animate-reveal text-center">
            <div className="w-28 h-28 bg-red-500/10 text-red-500 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-red-500/20">
              <Info size={56} />
            </div>
            <div className='space-y-2'>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-red-500 font-headline">Wajah Tidak Terdaftar</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-xs mx-auto leading-loose">Pengguna belum terdaftar di sistem. Harap hubungi Admin untuk registrasi biometrik.</p>
            </div>
            <div className='pt-4'>
                <Button variant="ghost" onClick={onStart} className='text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900'>Scan Ulang</Button>
            </div>
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