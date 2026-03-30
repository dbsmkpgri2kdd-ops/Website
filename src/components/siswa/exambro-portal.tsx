
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
import { Lock, QrCode, Link, Calendar, LoaderCircle, ShieldCheck, AlertCircle, Camera, Monitor } from 'lucide-react';
import { ExamBroSession } from './exambro-session';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function ExamBroPortal() {
  const firestore = useFirestore();
  const [activeTab, setActiveTab] = useState<string>('scheduled');
  const [isExamActive, setIsExamActive] = useState(false);
  const [selectedExamUrl, setSelectedExamUrl] = useState<string>('');
  const [isCameraRequired, setIsCameraRequired] = useState(false);
  
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

  const handleStartExam = (url: string, token: string, requiredToken?: string, camRequired: boolean = false) => {
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
    setIsExamActive(true);
  };

  const handleManualStart = () => {
    if (!inputUrl.startsWith('http')) {
      setError('Masukkan URL yang valid (harus diawali http/https).');
      return;
    }
    handleStartExam(inputUrl, '', undefined, false);
  };

  const handleScheduledStart = () => {
    const exam = exams?.find(e => e.id === selectedExamId);
    if (!exam) {
      setError('Pilih ujian terlebih dahulu.');
      return;
    }
    handleStartExam(exam.url, inputToken, exam.token, exam.isCameraRequired);
  };

  if (isExamActive) {
    return <ExamBroSession url={selectedExamUrl} isCameraRequired={isCameraRequired} onExit={() => setIsExamActive(false)} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className='flex items-center gap-3 text-primary justify-center'>
            <ShieldCheck size={24} className='animate-pulse' />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Secure Browser v2.0</span>
        </div>
        <h2 className="text-4xl font-black font-headline tracking-tighter uppercase italic">ExamBro Portal</h2>
        <p className="text-muted-foreground text-sm font-medium">Sistem ujian online terproteksi SMKS PGRI 2 Kedondong.</p>
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
                          {exam.subject} - {exam.class} {exam.isCameraRequired && '(Proctored)'}
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

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col items-center text-center space-y-3">
          <Camera className="text-primary" size={32} />
          <h4 className="font-black text-[10px] uppercase tracking-widest">Biometric AI</h4>
          <p className="text-[9px] text-muted-foreground font-medium uppercase leading-relaxed">Verifikasi kamera aktif wajib untuk ujian tertentu.</p>
        </div>
        <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex flex-col items-center text-center space-y-3">
          <AlertCircle className="text-amber-500" size={32} />
          <h4 className="font-black text-[10px] uppercase tracking-widest">Audit Kecurangan</h4>
          <p className="text-[9px] text-muted-foreground font-medium uppercase leading-relaxed">Setiap pelanggaran tercatat dalam log pengawas.</p>
        </div>
        <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex flex-col items-center text-center space-y-3">
          <Monitor className="text-blue-500" size={32} />
          <h4 className="font-black text-[10px] uppercase tracking-widest">Enforced UI</h4>
          <p className="text-[9px] text-muted-foreground font-medium uppercase leading-relaxed">Antarmuka layar penuh wajib digunakan selama ujian.</p>
        </div>
      </div>
    </div>
  );
}
