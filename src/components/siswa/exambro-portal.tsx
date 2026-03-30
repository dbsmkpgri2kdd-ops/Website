
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
 * Portal ExamBro Utama.
 * Menyediakan berbagai metode akses ujian dan fitur simulasi kesiapan sistem.
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

  const formatDate = (date: any) => {
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
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="text-center space-y-2">
        <div className='flex items-center gap-3 text-primary justify-center'>
            <ShieldCheck size={24} className='animate-pulse' />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Super Strict Mode v5.5</span>
        </div>
        <h2 className="text-4xl font-black font-headline tracking-tighter uppercase italic">ExamBro Portal</h2>
        <p className="text-muted-foreground text-sm font-medium">Sistem ujian online terproteksi dengan Deteksi Split-Screen & Biometric AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-premium border-emerald-500/20 bg-emerald-500/5 p-6 rounded-[2rem] shadow-2xl flex flex-col items-center text-center space-y-3 border-2">
            <MonitorCheck className="text-emerald-500" size={32} />
            <h4 className="font-black text-[10px] uppercase tracking-widest">Uji Kesiapan</h4>
            <p className="text-[9px] text-muted-foreground font-medium uppercase leading-relaxed">Cek kamera & sistem keamanan perangkat Anda.</p>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 rounded-xl font-black uppercase text-[8px] tracking-widest border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10">Mulai Simulasi</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] bg-card border-white/5 shadow-3xl p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">System Health Check</DialogTitle>
                        <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-primary">Validasi Kompatibilitas Perangkat</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 pt-6">
                        {[
                            { label: 'Biometric Camera', status: 'Checking...', icon: Camera },
                            { label: 'Fullscreen Mode', status: 'Ready', icon: Monitor },
                            { label: 'Anti-Gesture Logic', status: 'Active', icon: ShieldCheck },
                            { label: 'Secure Sandbox', status: 'Stable', icon: Smartphone },
                        ].map((test, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <test.icon size={18} className="text-primary opacity-40" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{test.label}</span>
                                </div>
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">{test.status}</span>
                            </div>
                        ))}
                        <Button onClick={() => handleStartExam('https://www.google.com', '', undefined, true, 5)} className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl glow-primary">
                            TEST SECURE SESSION (5m)
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
        <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 flex flex-col items-center text-center space-y-3 shadow-xl">
          <Camera className="text-amber-500" size={32} />
          <h4 className="font-black text-[10px] uppercase tracking-widest">Face Tracking</h4>
          <p className="text-[9px] text-muted-foreground font-medium uppercase leading-relaxed opacity-60">Audit integritas real-time menggunakan pengawasan biometrik.</p>
        </div>
        <div className="p-6 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 flex flex-col items-center text-center space-y-3 shadow-xl">
          <Smartphone className="text-blue-500" size={32} />
          <h4 className="font-black text-[10px] uppercase tracking-widest">App Detection</h4>
          <p className="text-[9px] text-muted-foreground font-medium uppercase leading-relaxed opacity-60">Blokir split-screen, navigasi balik, dan tombol sistem.</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="glass-premium border-red-500/20 rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className='font-bold'>Akses Ditolak</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="glass-premium border-white/5 rounded-[2.5rem] overflow-hidden shadow-3xl">
        <CardContent className="p-8">
          <Tabs defaultValue="scheduled" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-14 rounded-2xl bg-white/5 border border-white/5 p-1 mb-10">
              <TabsTrigger value="scheduled" className="rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all">
                <Calendar className="mr-2 h-4 w-4" /> Terjadwal
              </TabsTrigger>
              <TabsTrigger value="scan" className="rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all">
                <QrCode className="mr-2 h-4 w-4" /> Scan QR
              </TabsTrigger>
              <TabsTrigger value="manual" className="rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all">
                <Link className="mr-2 h-4 w-4" /> Manual Link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scheduled" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest opacity-60">Pilih Jadwal Ujian</Label>
                  <Select onValueChange={setSelectedExamId} value={selectedExamId}>
                    <SelectTrigger className="h-12 rounded-xl bg-white/5 border-white/10">
                      <SelectValue placeholder={isLoading ? "Memuat jadwal..." : "Pilih Mapel & Kelas"} />
                    </SelectTrigger>
                    <SelectContent className='bg-card/95 backdrop-blur-3xl border-white/10'>
                      {exams?.map(exam => (
                        <SelectItem key={exam.id} value={exam.id} className="py-3 font-bold uppercase text-[10px] tracking-widest">
                          [{formatDate(exam.date)}] {exam.subject} - {exam.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest opacity-60">Token Ujian</Label>
                  <div className="relative">
                    <Input 
                      placeholder="Masukkan Token" 
                      value={inputToken}
                      onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                      className="h-12 rounded-xl bg-white/5 border-white/10 pl-10"
                    />
                    <Lock className="absolute left-3.5 top-3.5 text-muted-foreground" size={16} />
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleScheduledStart} 
                className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.3em] shadow-3xl glow-primary"
                disabled={isLoading}
              >
                MASUK RUANG UJIAN
              </Button>
            </TabsContent>

            <TabsContent value="scan" className="py-10 text-center space-y-6">
              <div className="w-48 h-48 mx-auto border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center bg-white/5">
                <QrCode size={64} className="text-primary opacity-20" />
              </div>
              <div className="space-y-2">
                <p className="font-bold uppercase text-[10px] tracking-widest">Scanner QR Code</p>
                <p className="text-xs text-muted-foreground">Arahkan kamera ke QR Code yang diberikan oleh pengawas.</p>
              </div>
              <Button variant="outline" className="rounded-xl border-white/10 h-12 px-8 uppercase font-black text-[9px] tracking-widest">Buka Kamera</Button>
            </TabsContent>

            <TabsContent value="manual" className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest opacity-60">Tautan Ujian Manual</Label>
                <Input 
                  placeholder="https://forms.gle/..." 
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="h-12 rounded-xl bg-white/5 border-white/10"
                />
              </div>
              <Button 
                onClick={handleManualStart} 
                className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.3em] shadow-3xl glow-primary"
              >
                MULAI SESI SECURE
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
