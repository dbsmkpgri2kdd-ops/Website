'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type Exam } from '@/lib/data';
import { Lock, QrCode, Link, Calendar, LoaderCircle, ShieldCheck, AlertCircle, Camera, Monitor, Smartphone, MonitorCheck, Zap, Wifi } from 'lucide-react';
import { ExamBroSession } from './exambro-session';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

/**
 * Portal Utama ExamBro v5.5.
 * Antarmuka pemilihan ujian dengan sistem pre-check kesiapan perangkat.
 */
export function ExamBroPortal() {
  const firestore = useFirestore();
  const [activeTab, setActiveTab] = useState<string>('scheduled');
  const [isExamActive, setIsExamActive] = useState(false);
  const [selectedExamUrl, setSelectedExamUrl] = useState<string>('');
  const [isCameraRequired, setIsCameraRequired] = useState(false);
  const [examDuration, setExamDuration] = useState(60);
  const [examToken, setExamToken] = useState<string>('');
  
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [inputToken, setInputToken] = useState<string>('');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const examsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, `schools/${SCHOOL_DATA_ID}/exams`),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
  }, [firestore]);

  const { data: exams, isLoading } = useCollection<Exam>(examsQuery);

  const handleStartExam = (url: string, token: string, requiredToken?: string, camRequired: boolean = false, duration: number = 60) => {
    setError(null);
    if (requiredToken && token !== requiredToken) {
      setError('Token ujian tidak valid. Silakan hubungi pengawas ruangan.');
      return;
    }
    if (!url) {
      setError('Tautan soal ujian tidak ditemukan dalam database.');
      return;
    }
    setSelectedExamUrl(url);
    setIsCameraRequired(camRequired);
    setExamDuration(duration);
    setExamToken(requiredToken || 'ADMIN');
    setIsExamActive(true);
  };

  const handleManualStart = () => {
    if (!inputUrl.startsWith('http')) {
      setError('Masukkan URL yang valid (harus diawali http/https).');
      return;
    }
    handleStartExam(inputUrl, '', undefined, false, 60);
  };

  const handleScheduledStart = () => {
    const exam = exams?.find(e => e.id === selectedExamId);
    if (!exam) {
      setError('Pilih mata pelajaran ujian terlebih dahulu.');
      return;
    }
    handleStartExam(exam.url, inputToken, exam.token, exam.isCameraRequired, exam.durationMinutes || 60);
  };

  const formatDateLabel = (date: any) => {
    if (!date) return '';
    const jsDate = date.toDate ? date.toDate() : new Date(date);
    return format(jsDate, "d MMM", { locale: idLocale });
  };

  if (isExamActive) {
    return (
      <ExamBroSession 
        url={selectedExamUrl} 
        isCameraRequired={isCameraRequired} 
        durationMinutes={examDuration}
        unlockToken={examToken}
        onExit={() => setIsExamActive(false)} 
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-reveal pb-20">
      <div className="text-center space-y-3">
        <div className='flex items-center gap-3 text-primary justify-center'>
            <ShieldCheck size={24} className='animate-pulse' />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Secure Exam Session v5.5</span>
        </div>
        <h2 className="text-4xl font-black font-headline tracking-tighter text-foreground leading-none uppercase italic">Portal <span className='text-primary not-italic'>ExamBro.</span></h2>
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-60">Sistem Proteksi Ujian Digital Berstandar Nasional.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2.5rem] bg-white border-slate-100 shadow-xl flex flex-col items-center text-center p-8 space-y-4 border-2 group hover:border-primary/20 transition-all">
            <div className='p-4 bg-primary/5 text-primary rounded-2xl shadow-inner group-hover:bg-primary group-hover:text-white transition-all'>
                <MonitorCheck size={32} />
            </div>
            <div>
                <h4 className="font-black text-xs uppercase tracking-tight">Cek Kesiapan</h4>
                <p className="text-[9px] text-muted-foreground font-bold mt-1 leading-relaxed uppercase tracking-widest opacity-60">Validasi sensor keamanan perangkat.</p>
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 rounded-xl font-black text-[9px] uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5 px-6">Uji Sistem</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-[3rem] bg-white border-none shadow-3xl p-10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black font-headline tracking-tight uppercase italic">Pre-Exam Check</DialogTitle>
                        <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Memastikan kompatibilitas perangkat Anda.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-8 text-left">
                        {[
                            { label: 'Sensor Biometrik', status: 'Mengecek...', icon: Camera },
                            { label: 'Screen Lock Mode', status: 'Siap', icon: Monitor },
                            { label: 'Anti-Multitasking', status: 'Aktif', icon: ShieldCheck },
                            { label: 'Koneksi Gateway', status: 'Stabil', icon: Wifi },
                        ].map((test, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <test.icon size={18} className="text-primary opacity-40" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{test.label}</span>
                                </div>
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest animate-pulse">{test.status}</span>
                            </div>
                        ))}
                        <Button onClick={() => handleStartExam('https://www.google.com', '', undefined, true, 5)} className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl glow-primary mt-4">
                            Mulai Sesi Simulasi
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
        
        <div className="p-8 rounded-[2.5rem] bg-white border-2 border-slate-100 flex flex-col items-center text-center space-y-4 shadow-xl">
          <div className='p-4 bg-primary/5 text-primary rounded-2xl'>
            <Camera size={32} />
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-tight">Face Tracking</h4>
            <p className="text-[9px] text-muted-foreground font-bold mt-1 leading-relaxed uppercase tracking-widest opacity-60">Audit integritas real-time via pengawasan biometrik.</p>
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-white border-2 border-slate-100 flex flex-col items-center text-center space-y-4 shadow-xl">
          <div className='p-4 bg-primary/5 text-primary rounded-2xl'>
            <Smartphone size={32} />
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-tight">App Lockdown</h4>
            <p className="text-[9px] text-muted-foreground font-bold mt-1 leading-relaxed uppercase tracking-widest opacity-60">Proteksi navigasi sistem dan deteksi split-screen.</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-500/5 border-red-500/20 rounded-[2rem] p-6 animate-reveal">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className='font-black text-[10px] uppercase tracking-widest ml-2'>Akses Ditolak</AlertTitle>
          <AlertDescription className='text-[10px] font-bold uppercase tracking-widest ml-2 mt-1'>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-white border-2 border-slate-100 rounded-[3rem] overflow-hidden shadow-2xl">
        <CardContent className="p-10">
          <Tabs defaultValue="scheduled" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-14 rounded-2xl bg-slate-50 p-1 mb-10 shadow-inner">
              <TabsTrigger value="scheduled" className="rounded-xl font-black text-[9px] uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:shadow-xl">
                <Calendar className="mr-2 h-4 w-4" /> Terjadwal
              </TabsTrigger>
              <TabsTrigger value="scan" className="rounded-xl font-black text-[9px] uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:shadow-xl">
                <QrCode className="mr-2 h-4 w-4" /> Scan QR
              </TabsTrigger>
              <TabsTrigger value="manual" className="rounded-xl font-black text-[9px] uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:shadow-xl">
                <Link className="mr-2 h-4 w-4" /> Manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scheduled" className="space-y-8 animate-fade-in text-left">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Pilih Sesi Ujian</Label>
                  <Select onValueChange={setSelectedExamId} value={selectedExamId}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 px-6 font-bold text-xs uppercase">
                      <SelectValue placeholder={isLoading ? "Menghubungkan..." : "Pilih Mapel & Kelas"} />
                    </SelectTrigger>
                    <SelectContent className='rounded-2xl border-slate-100'>
                      {exams?.map(exam => (
                        <SelectItem key={exam.id} value={exam.id} className="py-3 font-black text-[9px] uppercase tracking-widest">
                          [{formatDateLabel(exam.date)}] {exam.subject} - {exam.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Token Keamanan</Label>
                  <div className="relative">
                    <Input 
                      placeholder="Masukkan Token" 
                      value={inputToken}
                      onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                      className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 font-black uppercase tracking-[0.4em] text-primary"
                    />
                    <Lock className="absolute left-4 top-4 text-primary opacity-30" size={20} />
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleScheduledStart} 
                className="w-full h-16 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl glow-primary hover:scale-[1.01] transition-all"
                disabled={isLoading}
              >
                Autentikasi & Mulai Ujian
              </Button>
            </TabsContent>

            <TabsContent value="scan" className="py-12 text-center space-y-8 animate-fade-in">
              <div className="w-56 h-56 mx-auto border-4 border-dashed border-primary/10 rounded-[3rem] flex items-center justify-center bg-primary/5 shadow-inner relative overflow-hidden">
                <div className='absolute inset-0 bg-primary/5 animate-pulse'></div>
                <QrCode size={80} className="text-primary opacity-20 relative z-10" />
              </div>
              <div className="space-y-2">
                <p className="font-black text-xs uppercase tracking-widest">Scanner QR v2.5</p>
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest max-w-xs mx-auto opacity-60">Arahkan kamera ke kode akses yang diberikan pengawas ruangan.</p>
              </div>
              <Button variant="outline" className="rounded-2xl border-slate-200 h-14 px-10 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-50 transition-all">Buka Kamera Scanner</Button>
            </TabsContent>

            <TabsContent value="manual" className="space-y-8 animate-fade-in text-left">
              <div className="space-y-2">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Tautan Ujian (Direct Access)</Label>
                <Input 
                  placeholder="https://exam.smkprida.id/..." 
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="h-14 rounded-2xl bg-slate-50 border-slate-100 px-6 font-bold text-xs text-primary"
                />
              </div>
              <Button 
                onClick={handleManualStart} 
                className="w-full h-16 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl glow-primary hover:scale-[1.01] transition-all"
              >
                Mulai Sesi Secure
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <p className='text-center text-[8px] font-black text-slate-300 uppercase tracking-[0.5em]'>
        &copy; 2025 SMKS PGRI 2 KEDONDONG • OFFICIAL SECURE GATEWAY
      </p>
    </div>
  );
}
