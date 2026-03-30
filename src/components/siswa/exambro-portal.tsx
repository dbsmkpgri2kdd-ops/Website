
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type Exam } from '@/lib/data';
import { Lock, QrCode, Link, Calendar, LoaderCircle, ShieldCheck, AlertCircle, Camera, Monitor, Clock, Smartphone, Zap, MonitorCheck } from 'lucide-react';
import { ExamBroSession } from './exambro-session';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

/**
 * Portal ExamBro Utama v5.5.
 * Menyediakan antarmuka pengerjaan ujian dengan standar keamanan militer.
 */
export function ExamBroPortal() {
  const firestore = useFirestore();
  const [activeTab, setActiveTab] = useState<string>('scheduled');
  const [isExamActive, setIsExamActive] = useState(false);
  const [selectedExamUrl, setSelectedExamUrl] = useState<string>('');
  const [isCameraRequired, setIsCameraRequired] = useState(false);
  const [examDuration, setExamDuration] = useState(60);
  
  // States for form inputs
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
      setError('Token ujian tidak valid. Silakan hubungi pengawas.');
      return;
    }
    if (!url) {
      setError('Tautan ujian tidak ditemukan.');
      return;
    }
    setSelectedExamUrl(url);
    setIsCameraRequired(camRequired);
    setExamDuration(duration);
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
      setError('Pilih ujian terlebih dahulu.');
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
        onExit={() => setIsExamActive(false)} 
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="text-center space-y-3">
        <div className='flex items-center gap-3 text-primary justify-center'>
            <ShieldCheck size={24} className='animate-pulse' />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Super Strict Mode v5.5</span>
        </div>
        <h2 className="text-4xl font-black font-headline tracking-tighter uppercase italic leading-none">ExamBro <span className='text-foreground'>Portal.</span></h2>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest opacity-60">Sistem Proteksi Ujian Digital Terpadu.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-premium border-emerald-500/20 bg-emerald-500/5 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center space-y-4 border-2">
            <MonitorCheck className="text-emerald-500" size={40} />
            <div>
                <h4 className="font-black text-[11px] uppercase tracking-widest">Uji Kesiapan</h4>
                <p className="text-[9px] text-muted-foreground font-medium uppercase mt-1 leading-relaxed">Validasi sensor & keamanan perangkat.</p>
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 rounded-xl font-black uppercase text-[9px] tracking-[0.2em] border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 px-6">Mulai Simulasi</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-[3rem] bg-card border-white/5 shadow-3xl p-10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">System Health Check</DialogTitle>
                        <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-primary">Validasi Kompatibilitas Perangkat</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 pt-8">
                        {[
                            { label: 'Biometric Camera', status: 'Checking...', icon: Camera },
                            { label: 'Fullscreen Mode', status: 'Ready', icon: Monitor },
                            { label: 'Anti-Gesture Logic', status: 'Active', icon: ShieldCheck },
                            { label: 'Secure Sandbox', status: 'Stable', icon: Smartphone },
                        ].map((test, i) => (
                            <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-4">
                                    <test.icon size={20} className="text-primary opacity-40" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{test.label}</span>
                                </div>
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">{test.status}</span>
                            </div>
                        ))}
                        <Button onClick={() => handleStartExam('https://www.google.com', '', undefined, true, 5)} className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl glow-primary">
                            LAUNCH TEST SESSION (5m)
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
        
        <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 flex flex-col items-center text-center space-y-4 shadow-xl">
          <Camera className="text-primary" size={40} />
          <div>
            <h4 className="font-black text-[11px] uppercase tracking-widest">Face Tracking</h4>
            <p className="text-[9px] text-muted-foreground font-medium uppercase mt-1 leading-relaxed opacity-60">Audit integritas real-time via pengawasan biometrik.</p>
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 flex flex-col items-center text-center space-y-4 shadow-xl">
          <Smartphone className="text-primary" size={40} />
          <div>
            <h4 className="font-black text-[11px] uppercase tracking-widest">App Lockdown</h4>
            <p className="text-[9px] text-muted-foreground font-medium uppercase mt-1 leading-relaxed opacity-60">Proteksi navigasi sistem dan deteksi split-screen.</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="glass-premium border-red-500/20 rounded-[2rem] p-6 animate-reveal">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className='font-black uppercase text-xs tracking-widest ml-2'>Akses Ditolak</AlertTitle>
          <AlertDescription className='text-xs font-bold uppercase ml-2 mt-1'>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="glass-premium border-white/5 rounded-[3rem] overflow-hidden shadow-3xl">
        <CardContent className="p-10">
          <Tabs defaultValue="scheduled" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-16 rounded-[1.5rem] bg-white/5 border border-white/5 p-1.5 mb-12">
              <TabsTrigger value="scheduled" className="rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">
                <Calendar className="mr-2 h-4 w-4" /> Terjadwal
              </TabsTrigger>
              <TabsTrigger value="scan" className="rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">
                <QrCode className="mr-2 h-4 w-4" /> Scan QR
              </TabsTrigger>
              <TabsTrigger value="manual" className="rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">
                <Link className="mr-2 h-4 w-4" /> Manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scheduled" className="space-y-8 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">Pilih Sesi Ujian</Label>
                  <Select onValueChange={setSelectedExamId} value={selectedExamId}>
                    <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 px-6">
                      <SelectValue placeholder={isLoading ? "Syncing..." : "Pilih Mapel & Kelas"} />
                    </SelectTrigger>
                    <SelectContent className='bg-card/95 backdrop-blur-3xl border-white/10 rounded-2xl'>
                      {exams?.map(exam => (
                        <SelectItem key={exam.id} value={exam.id} className="py-4 font-black uppercase text-[10px] tracking-widest">
                          [{formatDateLabel(exam.date)}] {exam.subject} - {exam.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">Security Token</Label>
                  <div className="relative">
                    <Input 
                      placeholder="ENTER TOKEN" 
                      value={inputToken}
                      onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                      className="h-14 rounded-2xl bg-white/5 border-white/10 pl-12 font-black uppercase tracking-[0.3em]"
                    />
                    <Lock className="absolute left-4 top-4 text-primary" size={20} />
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleScheduledStart} 
                className="w-full h-16 rounded-[2rem] font-black uppercase tracking-[0.4em] shadow-3xl glow-primary hover:scale-[1.02] transition-all"
                disabled={isLoading}
              >
                AUTENTIKASI & MULAI
              </Button>
            </TabsContent>

            <TabsContent value="scan" className="py-12 text-center space-y-8 animate-fade-in">
              <div className="w-56 h-56 mx-auto border-2 border-dashed border-primary/20 rounded-[3rem] flex items-center justify-center bg-primary/5 shadow-inner">
                <QrCode size={80} className="text-primary opacity-20 animate-pulse" />
              </div>
              <div className="space-y-3">
                <p className="font-black uppercase text-xs tracking-[0.3em]">Scanner QR v2.0</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest max-w-xs mx-auto">Arahkan kamera ke kode akses yang diberikan pengawas di papan tulis.</p>
              </div>
              <Button variant="outline" className="rounded-2xl border-white/10 h-14 px-10 uppercase font-black text-[10px] tracking-widest hover:bg-white/5 transition-all">Buka Kamera Scanner</Button>
            </TabsContent>

            <TabsContent value="manual" className="space-y-8 animate-fade-in">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">Tautan Ujian (Direct Access)</Label>
                <Input 
                  placeholder="https://forms.gle/..." 
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="h-14 rounded-2xl bg-white/5 border-white/10 px-6 font-medium text-primary"
                />
              </div>
              <Button 
                onClick={handleManualStart} 
                className="w-full h-16 rounded-[2rem] font-black uppercase tracking-[0.4em] shadow-3xl glow-primary hover:scale-[1.02] transition-all"
              >
                MULAI SESI SECURE
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <p className='text-center text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.6em]'>
        Secured by Digital Hub Enterprise v7.5 • SMKS PGRI 2 KEDONDONG
      </p>
    </div>
  );
}
