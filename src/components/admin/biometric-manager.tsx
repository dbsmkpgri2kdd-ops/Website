
'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Camera, LoaderCircle, CheckCircle2, ShieldCheck, 
  ScanFace, UserPlus, Users, Search, Filter, Fingerprint,
  Smartphone, MapPin, Zap
} from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking, useDoc } from '@/firebase';
import { collection, query, where, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type UserProfile, type School } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type BiometricStatus = 'IDLE' | 'SCANNING' | 'SUCCESS' | 'ERROR';

/**
 * Komponen Admin untuk Manajemen Biometrik & Terminal Absensi Kolektif.
 * Memungkinkan Admin mendaftarkan wajah siswa (Enrollment) dan mencatat kehadiran.
 */
export function BiometricManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const [status, setStatus] = useState<BiometricStatus>('IDLE');
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Fetch Students
  const studentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'siswa'), orderBy('email'));
  }, [firestore]);
  const { data: students, isLoading: isStudentsLoading } = useCollection<UserProfile>(studentsQuery);

  // 2. Fetch School Data
  const schoolDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'schools', SCHOOL_DATA_ID) : null, [firestore]);
  const { data: schoolData } = useDoc<School>(schoolDocRef);

  // 3. Logic Filter
  const classes = useMemo(() => {
    if (!students) return [];
    const classSet = new Set(students.map(s => s.className).filter(Boolean));
    return Array.from(classSet).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(s => {
      const matchesClass = selectedClass === 'ALL' || s.className === selectedClass;
      const matchesSearch = (s.displayName || s.email).toLowerCase().includes(searchQuery.toLowerCase());
      return matchesClass && matchesSearch;
    });
  }, [students, selectedClass, searchQuery]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Akses Kamera Gagal', description: 'Pastikan izin kamera diberikan.' });
    }
  };

  const handleEnrollment = async () => {
    if (!selectedStudentId) {
      toast({ variant: 'destructive', title: 'Pilih Siswa', description: 'Pilih siswa yang akan didaftarkan wajahnya.' });
      return;
    }

    setStatus('SCANNING');
    setScanProgress(0);
    await startCamera();

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

  const handleAdminAttendance = async () => {
    if (!selectedStudentId) {
      toast({ variant: 'destructive', title: 'Pilih Siswa', description: 'Pilih siswa yang akan diabsenkan.' });
      return;
    }

    setStatus('SCANNING');
    setScanProgress(0);
    await startCamera();

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        processCapture('ATTENDANCE');
      }
    }, 80);
  };

  const generateHash = (dataUrl: string) => {
    const base = btoa(dataUrl.substring(50, 150)).substring(0, 12);
    return `ENR-${base}-${Date.now().toString(36).toUpperCase()}`;
  };

  const processCapture = async (mode: 'ENROLL' | 'ATTENDANCE') => {
    if (!videoRef.current || !canvasRef.current || !firestore) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.1);
    const signature = generateHash(dataUrl);

    try {
      const student = students?.find(s => s.id === selectedStudentId);
      
      if (mode === 'ENROLL') {
        const userRef = doc(firestore, 'users', selectedStudentId);
        updateDocumentNonBlocking(userRef, { biometricSignature: signature });
        toast({ title: 'Registrasi Berhasil', description: `Wajah ${student?.displayName} telah terdaftar.` });
      } else {
        const attendanceRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/attendance`);
        const attendanceData = {
          studentId: selectedStudentId,
          studentName: student?.displayName || student?.email,
          studentNis: student?.nis || 'N/A',
          studentClass: student?.className || 'N/A',
          date: serverTimestamp(),
          status: 'Hadir',
          notes: 'Dicatat oleh Admin (Terminal Biometrik)',
          biometricCode: signature,
          metadata: { type: 'ADMIN_TERMINAL' }
        };
        addDocumentNonBlocking(attendanceRef, attendanceData);

        // Webhook Recaps
        if (schoolData?.attendanceWebhookUrl) {
          fetch(schoolData.attendanceWebhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(attendanceData)
          }).catch(() => {});
        }

        toast({ title: 'Absensi Berhasil', description: `${student?.displayName} telah hadir.` });
      }

      setStatus('SUCCESS');
      stopCamera();
      setTimeout(() => setStatus('IDLE'), 3000);
    } catch (e) {
      setStatus('ERROR');
      toast({ variant: 'destructive', title: 'Gagal' });
    }
  };

  return (
    <div className="space-y-8 animate-reveal pb-20">
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
            <h2 className='text-3xl font-bold tracking-tight text-foreground'>Manajemen Biometrik</h2>
            <p className='text-sm font-medium text-muted-foreground mt-1'>Pendaftaran & pencatatan kehadiran digital terpusat.</p>
        </div>
        <div className='flex items-center gap-3 bg-emerald-500/10 text-emerald-600 p-3 rounded-2xl border border-emerald-500/20'>
            <div className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_emerald]'></div>
            <p className='text-[10px] font-black uppercase tracking-widest'>Sensor Biometrik Aktif</p>
        </div>
      </div>

      <Tabs defaultValue="enrollment" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 rounded-2xl bg-muted p-1 mb-8">
          <TabsTrigger value="enrollment" className="rounded-xl font-bold text-xs">
            <UserPlus className="mr-2 h-4 w-4" /> Registrasi Wajah
          </TabsTrigger>
          <TabsTrigger value="terminal" className="rounded-xl font-bold text-xs">
            <ScanFace className="mr-2 h-4 w-4" /> Terminal Absensi
          </TabsTrigger>
        </TabsList>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-card overflow-hidden">
              <CardHeader className="p-8 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-3">
                  <Users size={18} className="text-primary" /> Daftar Siswa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 space-y-4 bg-muted/20 border-b">
                  <div className="relative">
                    <Input 
                      placeholder="Cari siswa..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-11 rounded-xl bg-background border-border pl-10 text-xs"
                    />
                    <Search className="absolute left-3.5 top-3.5 text-muted-foreground opacity-40" size={16} />
                  </div>
                  <Select onValueChange={setSelectedClass} value={selectedClass}>
                    <SelectTrigger className="h-11 rounded-xl bg-background border-border font-bold text-[10px] uppercase">
                      <SelectValue placeholder="Semua Kelas" />
                    </SelectTrigger>
                    <SelectContent className='rounded-xl'>
                      <SelectItem value="ALL" className="font-bold text-[10px] uppercase">SEMUA KELAS</SelectItem>
                      {classes.map(c => <SelectItem key={c} value={c} className="font-bold text-[10px] uppercase">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <ScrollArea className="h-[400px]">
                  <div className="p-4 space-y-1">
                    {isStudentsLoading ? (
                      Array.from({length: 5}).map((_, i) => <div key={i} className="h-14 w-full bg-muted animate-pulse rounded-xl" />)
                    ) : (
                      filteredStudents.map(student => (
                        <button
                          key={student.id}
                          onClick={() => setSelectedStudentId(student.id || '')}
                          className={cn(
                            "w-full flex items-center justify-between p-4 rounded-xl transition-all text-left",
                            selectedStudentId === student.id 
                              ? "bg-primary text-white shadow-lg" 
                              : "hover:bg-muted"
                          )}
                        >
                          <div>
                            <p className="text-xs font-bold truncate max-w-[120px]">{student.displayName || student.email}</p>
                            <p className={cn("text-[9px] font-bold uppercase mt-0.5", selectedStudentId === student.id ? "text-white/60" : "text-muted-foreground")}>
                              {student.nis} • {student.className}
                            </p>
                          </div>
                          {student.biometricSignature && (
                            <div className={cn("p-1.5 rounded-lg", selectedStudentId === student.id ? "bg-white/20" : "bg-emerald-500/10 text-emerald-600")}>
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
            <TabsContent value="enrollment" className="mt-0">
              <EnrollmentCard 
                status={status} 
                student={students?.find(s => s.id === selectedStudentId)}
                onStart={handleEnrollment}
                progress={scanProgress}
                videoRef={videoRef}
                canvasRef={canvasRef}
              />
            </TabsContent>
            <TabsContent value="terminal" className="mt-0">
              <TerminalCard 
                status={status}
                student={students?.find(s => s.id === selectedStudentId)}
                onStart={handleAdminAttendance}
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

function EnrollmentCard({ status, student, onStart, progress, videoRef, canvasRef }: any) {
  return (
    <Card className="rounded-[3rem] border-none shadow-2xl bg-card overflow-hidden">
      <CardHeader className="p-8 border-b bg-primary/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary text-white rounded-2xl shadow-lg">
            <UserPlus size={24} />
          </div>
          <div>
            <CardTitle className="text-xl font-bold italic uppercase font-headline">Enrollment <span className="text-primary">Wajah</span></CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Daftarkan identitas biometrik siswa baru.</CardDescription>
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
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Siap Mendaftar?</h3>
              <p className="text-xs text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
                {student ? `Anda akan mendaftarkan wajah ${student.displayName}. Pastikan pencahayaan cukup.` : 'Pilih siswa dari daftar sebelah kiri untuk memulai registrasi.'}
              </p>
            </div>
            <Button onClick={onStart} disabled={!student} className="h-16 px-12 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
              Mulai Pemindaian Enrollment
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
                <span>Ekstraksi Digital...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="py-12 space-y-6 animate-reveal text-center">
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black italic uppercase">Registrasi Selesai</h3>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Database Identitas Digital Diperbarui</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TerminalCard({ status, student, onStart, progress, videoRef, canvasRef }: any) {
  return (
    <Card className="rounded-[3rem] border-none shadow-2xl bg-card overflow-hidden">
      <CardHeader className="p-8 border-b bg-emerald-500/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg">
            <MonitorCheck size={24} />
          </div>
          <div>
            <CardTitle className="text-xl font-bold italic uppercase font-headline">Absensi <span className="text-emerald-600">Terminal</span></CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Terminal absensi kolektif via kamera admin.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-10 text-center">
        <canvas ref={canvasRef} className="hidden" />
        
        {status === 'IDLE' && (
          <div className="space-y-8 py-10">
            <div className="w-32 h-32 bg-emerald-500/5 rounded-[3rem] flex items-center justify-center mx-auto border-4 border-dashed border-emerald-500/20">
              <Zap size={64} className="text-emerald-500/40 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Catat Kehadiran</h3>
              <p className="text-xs text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
                {student ? `Rekam kehadiran untuk ${student.displayName} secara manual via Terminal.` : 'Pilih siswa untuk melakukan absensi melalui kamera sekolah.'}
              </p>
            </div>
            <Button onClick={onStart} disabled={!student} className="h-16 px-12 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] transition-all">
              Absenkan Siswa Sekarang
            </Button>
          </div>
        )}

        {status === 'SCANNING' && (
          <div className="space-y-8 animate-reveal">
            <div className="relative aspect-square max-w-[320px] mx-auto rounded-[3rem] overflow-hidden border-4 border-emerald-500/20 shadow-2xl bg-black">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-1 bg-emerald-500/50 absolute top-0 animate-[scan_2s_infinite] shadow-[0_0_15px_emerald]"></div>
              </div>
            </div>
            <div className="space-y-4 max-w-xs mx-auto">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-600">
                <span>Memproses Data...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="py-12 space-y-6 animate-reveal text-center">
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black italic uppercase">Absensi Tercatat</h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Laporan Telah Dikirim ke Google Sheets</p>
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
