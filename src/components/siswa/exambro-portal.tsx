
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
  const [examId, setExamId] = useState<string>('');
  const [examTitle, setExamTitle] = useState<string>('');
  
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

  const handleStartExam = (id: string, title: string, url: string, token: string, requiredToken?: string, camRequired: boolean = false, duration: number = 60) => {
    setError(null);
    if (requiredToken && token.toUpperCase() !== requiredToken.toUpperCase()) {
      setError('Token ujian tidak valid. Silakan hubungi pengawas ruangan.');
      return;
    }
    if (!url) {
      setError('Tautan soal ujian tidak ditemukan dalam database.');
      return;
    }
    setExamId(id);
    setExamTitle(title);
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
    handleStartExam('MANUAL', 'Ujian Manual', inputUrl, '', undefined, false, 60);
  };

  const handleScheduledStart = () => {
    const exam = exams?.find(e => e.id === selectedExamId);
    if (!exam) {
      setError('Pilih mata pelajaran ujian terlebih dahulu.');
      return;
    }
    handleStartExam(exam.id, exam.subject, exam.url, inputToken, exam.token, exam.isCameraRequired, exam.durationMinutes || 60);
  };

  const formatDateLabel = (date: any) => {
    if (!date) return '';
    const jsDate = date.toDate ? date.toDate() : new Date(date);
    return format(jsDate, "d MMM", { locale: idLocale });
  };

  if (isExamActive) {
    return (
      <ExamBroSession 
        examId={examId}
        examTitle={examTitle}
        url={selectedExamUrl} 
        isCameraRequired={isCameraRequired} 
        durationMinutes={examDuration}
        unlockToken={examToken}
        onExit={() => setIsExamActive(false)} 
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-reveal pb-24 font-sans">
      <div className="text-center space-y-3">
        <div className='flex items-center gap-3 text-primary justify-center'>
            <ShieldCheck size={24} className='animate-pulse' />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Secure Admission Portal v5.5</span>
        </div>
        <h2 className="text-4xl font-black font-headline tracking-tighter text-slate-900 leading-none uppercase italic">Portal <span className='text-primary not-italic'>ExamBro.</span></h2>
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-60">Sistem Proteksi Ujian Digital Berstandar Nasional.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2.5rem] bg-white border-slate-100 shadow-xl flex flex-col items-center text-center p-8 space-y-4 border-2 group hover:border-primary/20 transition-all">
            <div className='p-4 bg-primary/5 text-primary rounded-2xl shadow-inner group-hover:bg-primary group-hover:text-white transition-all'>
                <MonitorCheck size={32} />
            </div>
            <div>
                <h4 className="font-black text-xs uppercase tracking-tight text-slate-900">Cek Kesiapan</h4>
                <p className="text-[9px] text-slate-400 font-bold mt-1 leading-relaxed uppercase tracking-widest opacity-60">Validasi sensor keamanan perangkat.</p>
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 rounded-xl font-black text-[9px] uppercase tracking-widest border-slate-100 text-slate-500 hover:bg-slate-50 px-6">Uji Sistem</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-[3rem] bg-white border-none shadow-3xl p-10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black font-headline tracking-tight uppercase italic text-slate-900">Pre-Exam Check</DialogTitle>
                        <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Memastikan kompatibilitas perangkat Anda.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-8 text-left">
                        {[
                            { label: 'Sensor Biometrik', status: 'Ready', icon: Camera },
                            { label: 'Screen Lock Mode', status: 'Siap', icon: Monitor },
                            { label: 'Anti-Multitasking', status: 'Aktif', icon: ShieldCheck },
                            { label: 'Koneksi Gateway', status: 'Stabil', icon: Wifi },
                        ].map((test, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <test.icon size={18} className="text-primary opacity-40" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{test.label}</span>
                                </div>
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{test.status}</span>
                            </div>
                        ))}
                        <div className='p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mt-4'>
                            <p className='text-[10px] font-bold text-emerald-700 uppercase tracking-widest leading-relaxed text-center'>Semua sistem keamanan aktif. Perangkat Anda layak untuk mengikuti ujian.</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
        
        <div className="p-8 rounded-[2.5rem] bg-white border-2 border-slate-100 flex flex-col items-center text-center space-y-4 shadow-xl">
          <div className='p-4 bg-primary/5 text-primary rounded-2xl'>
            <Camera size={32} />
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-tight text-slate-900">Face Tracking</h4>
            <p className="text-[9px] text-slate-400 font-bold mt-1 leading-relaxed uppercase tracking-widest opacity-60">Audit integritas real-time via pengawasan biometrik.</p>
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-white border-2 border-slate-100 flex flex-col items-center text-center space-y-4 shadow-xl">
          <div className='p-4 bg-primary/5 text-primary rounded-2xl'>
            <Smartphone size={32} />
          </div>
          <div>
            <h4 className="font-black text-xs uppercase tracking-tight text-slate-900">App Lockdown</h4>
            <p className="text-[9px] text-slate-400 font-bold mt-1 leading-relaxed uppercase tracking-widest opacity-60">Proteksi navigasi sistem dan deteksi split-screen.</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-500/5 border-red-500/20 rounded-[2.5rem] p-8 animate-reveal">
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-red-500 text-white rounded-2xl shadow-xl'><AlertCircle size={24} /></div>
            <div>
                <AlertTitle className='font-black text-xs uppercase tracking-widest text-red-600'>Akses Dibatasi</AlertTitle>
                <AlertDescription className='text-[11px] font-bold uppercase tracking-widest text-red-500 mt-1'>{error}</AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      <Card className="bg-white border-2 border-slate-100 rounded-[3rem] overflow-hidden shadow-2xl">
        <CardContent className="p-10">
          <Tabs defaultValue="scheduled" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-16 rounded-2xl bg-slate-50 p-1.5 mb-10 shadow-inner">
              <TabsTrigger value="scheduled" className="rounded-xl font-black text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:shadow-xl text-slate-400 data-[state=active]:text-primary">
                <Calendar className="mr-2 h-4 w-4" /> Terjadwal
              </TabsTrigger>
              <TabsTrigger value="scan" className="rounded-xl font-black text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:shadow-xl text-slate-400 data-[state=active]:text-primary">
                <QrCode className="mr-2 h-4 w-4" /> Scan QR
              </TabsTrigger>
              <TabsTrigger value="manual" className="rounded-xl font-black text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:shadow-xl text-slate-400 data-[state=active]:text-primary">
                <Link className="mr-2 h-4 w-4" /> Manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scheduled" className="space-y-10 animate-fade-in text-left">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Pilih Sesi Ujian</Label>
                  <Select onValueChange={setSelectedExamId} value={selectedExamId}>
                    <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-slate-100 px-6 font-bold text-xs uppercase text-slate-900">
                      <SelectValue placeholder={isLoading ? "Menghubungkan..." : "Klik untuk memilih"} />
                    </SelectTrigger>
                    <SelectContent className='rounded-2xl border-slate-100'>
                      {exams?.map(exam => (
                        <SelectItem key={exam.id} value={exam.id} className="py-4 font-black text-[10px] uppercase tracking-widest border-b border-slate-50 last:border-0">
                          [{formatDateLabel(exam.date)}] {exam.subject} - {exam.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Token Keamanan</Label>
                  <div className="relative">
                    <Input 
                      placeholder="Input Token" 
                      value={inputToken}
                      onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                      className="h-16 rounded-2xl bg-slate-50 border-slate-100 pl-14 font-black uppercase tracking-[0.5em] text-primary text-xl"
                    />
                    <Lock className="absolute left-5 top-5 text-primary opacity-30" size={24} />
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleScheduledStart} 
                className="w-full h-20 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl glow-primary hover:scale-[1.01] transition-all"
                disabled={isLoading}
              >
                Autentikasi & Validasi Sesi
              </Button>
            </TabsContent>

            <TabsContent value="scan" className="py-12 text-center space-y-10 animate-fade-in">
              <div className="w-64 h-64 mx-auto border-4 border-dashed border-primary/10 rounded-[4rem] flex items-center justify-center bg-primary/5 shadow-inner relative overflow-hidden group">
                <div className='absolute inset-0 bg-primary/5 animate-pulse'></div>
                <QrCode size={100} className="text-primary opacity-20 relative z-10 group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-3">
                <p className="font-black text-sm uppercase tracking-tight text-slate-900">Scanner QR Access v3.0</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">Arahkan kamera ke kode akses yang diberikan oleh pengawas ruangan untuk login otomatis.</p>
              </div>
              <Button variant="outline" className="rounded-2xl border-slate-200 h-16 px-12 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-50 transition-all">Aktifkan Kamera Scanner</Button>
            </TabsContent>

            <TabsContent value="manual" className="space-y-10 animate-fade-in text-left">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Tautan Ujian Khusus (Direct Access)</Label>
                <div className='relative'>
                    <Input 
                    placeholder="https://exam.smkprida.id/..." 
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="h-16 rounded-2xl bg-slate-50 border-slate-100 px-6 font-bold text-xs text-primary pr-14"
                    />
                    <Link className='absolute right-5 top-5 text-primary opacity-30' size={24} />
                </div>
              </div>
              <Button 
                onClick={handleManualStart} 
                className="w-full h-20 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl glow-primary hover:scale-[1.01] transition-all"
              >
                Mulai Sesi Manual
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <p className='text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]'>
        &copy; 2025 SMKS PGRI 2 KEDONDONG • OFFICIAL SECURE GATEWAY
      </p>
    </div>
  );
}
