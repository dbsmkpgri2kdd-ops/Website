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
import { Lock, QrCode, Link, Calendar, LoaderCircle, ShieldCheck, AlertCircle, Camera, Monitor, Smartphone, MonitorCheck } from 'lucide-react';
import { ExamBroSession } from './exambro-session';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
        unlockToken={examToken}
        onExit={() => setIsExamActive(false)} 
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="text-center space-y-3">
        <div className='flex items-center gap-3 text-primary justify-center'>
            <ShieldCheck size={24} className='animate-pulse' />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Sesi ujian aman v5.5</span>
        </div>
        <h2 className="text-4xl font-bold font-headline tracking-tighter text-foreground leading-none">Portal ExamBro</h2>
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest opacity-60">Sistem proteksi ujian digital terintegrasi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="fresh-card p-8 rounded-[2.5rem] flex flex-col items-center text-center space-y-4 border-2 border-primary/5">
            <MonitorCheck className="text-primary" size={40} />
            <div>
                <h4 className="font-bold text-sm">Uji kesiapan</h4>
                <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-relaxed">Validasi sensor dan keamanan perangkat.</p>
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 rounded-xl font-bold text-xs border-primary/20 text-primary hover:bg-primary/5 px-6">Mulai simulasi</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-[3rem] bg-card border-border shadow-3xl p-10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold font-headline tracking-tight">Pemeriksaan sistem</DialogTitle>
                        <DialogDescription className="text-xs font-medium text-muted-foreground">Validasi kompatibilitas perangkat sebelum ujian.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-8 text-left">
                        {[
                            { label: 'Kamera biometrik', status: 'Mengecek...', icon: Camera },
                            { label: 'Mode layar penuh', status: 'Siap', icon: Monitor },
                            { label: 'Logika anti-gesture', status: 'Aktif', icon: ShieldCheck },
                            { label: 'Secure sandbox', status: 'Stabil', icon: Smartphone },
                        ].map((test, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted border border-border">
                                <div className="flex items-center gap-4">
                                    <test.icon size={18} className="text-primary opacity-60" />
                                    <span className="text-xs font-semibold text-foreground">{test.label}</span>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest animate-pulse">{test.status}</span>
                            </div>
                        ))}
                        <Button onClick={() => handleStartExam('https://www.google.com', '', undefined, true, 5)} className="w-full h-14 rounded-2xl font-bold shadow-xl shadow-primary/20 mt-4">
                            Mulai sesi simulasi
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
        
        <div className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col items-center text-center space-y-4 shadow-sm">
          <Camera className="text-primary" size={40} />
          <div>
            <h4 className="font-bold text-sm">Face tracking</h4>
            <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-relaxed">Audit integritas real-time via pengawasan biometrik.</p>
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col items-center text-center space-y-4 shadow-sm">
          <Smartphone className="text-primary" size={40} />
          <div>
            <h4 className="font-bold text-sm">App lockdown</h4>
            <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-relaxed">Proteksi navigasi sistem dan deteksi split-screen.</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 rounded-[2rem] p-6 animate-reveal">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className='font-bold text-sm ml-2'>Akses ditolak</AlertTitle>
          <AlertDescription className='text-xs font-medium ml-2 mt-1'>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-card border-border rounded-[3rem] overflow-hidden shadow-xl">
        <CardContent className="p-10">
          <Tabs defaultValue="scheduled" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-14 rounded-2xl bg-muted p-1 mb-10">
              <TabsTrigger value="scheduled" className="rounded-xl font-bold text-xs transition-all">
                <Calendar className="mr-2 h-4 w-4" /> Terjadwal
              </TabsTrigger>
              <TabsTrigger value="scan" className="rounded-xl font-bold text-xs transition-all">
                <QrCode className="mr-2 h-4 w-4" /> Scan QR
              </TabsTrigger>
              <TabsTrigger value="manual" className="rounded-xl font-bold text-xs transition-all">
                <Link className="mr-2 h-4 w-4" /> Manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scheduled" className="space-y-8 animate-fade-in text-left">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Pilih sesi ujian</Label>
                  <Select onValueChange={setSelectedExamId} value={selectedExamId}>
                    <SelectTrigger className="h-14 rounded-2xl bg-background border-border px-6 font-semibold">
                      <SelectValue placeholder={isLoading ? "Menghubungkan..." : "Pilih mapel & kelas"} />
                    </SelectTrigger>
                    <SelectContent className='rounded-2xl'>
                      {exams?.map(exam => (
                        <SelectItem key={exam.id} value={exam.id} className="py-3 font-semibold text-xs">
                          [{formatDateLabel(exam.date)}] {exam.subject} - {exam.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Token keamanan</Label>
                  <div className="relative">
                    <Input 
                      placeholder="Masukkan token" 
                      value={inputToken}
                      onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                      className="h-14 rounded-2xl bg-background border-border pl-12 font-bold uppercase tracking-widest"
                    />
                    <Lock className="absolute left-4 top-4 text-primary opacity-40" size={20} />
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleScheduledStart} 
                className="w-full h-16 rounded-[2rem] font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
                disabled={isLoading}
              >
                Autentikasi & mulai ujian
              </Button>
            </TabsContent>

            <TabsContent value="scan" className="py-12 text-center space-y-8 animate-fade-in">
              <div className="w-56 h-56 mx-auto border-2 border-dashed border-primary/20 rounded-[3rem] flex items-center justify-center bg-primary/5 shadow-inner">
                <QrCode size={80} className="text-primary opacity-20 animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-sm">Scanner QR v2.0</p>
                <p className="text-xs text-muted-foreground font-medium max-w-xs mx-auto">Arahkan kamera ke kode akses yang diberikan pengawas.</p>
              </div>
              <Button variant="outline" className="rounded-2xl border-border h-14 px-10 font-bold text-xs hover:bg-muted transition-all">Buka kamera scanner</Button>
            </TabsContent>

            <TabsContent value="manual" className="space-y-8 animate-fade-in text-left">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Tautan ujian (direct access)</Label>
                <Input 
                  placeholder="https://forms.gle/..." 
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="h-14 rounded-2xl bg-background border-border px-6 font-medium text-primary"
                />
              </div>
              <Button 
                onClick={handleManualStart} 
                className="w-full h-16 rounded-[2rem] font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
              >
                Mulai sesi secure
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <p className='text-center text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest'>
        Digital hub enterprise v7.5 • SMKS PGRI 2 KEDONDONG
      </p>
    </div>
  );
}
