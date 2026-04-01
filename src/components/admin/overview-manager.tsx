'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, limit, orderBy, where } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type NewsArticle, type StudentApplication, type AttendanceRecord } from '@/lib/data';
import { Newspaper, UserPlus, ShieldCheck, Activity, Clock, ArrowUpRight, BrainCircuit, Sparkles, LoaderCircle, Database, HardDrive, BarChart3, UserCheck, LogIn, LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { generateAdminAnalysis, type AdminAnalysisOutput } from '@/ai/flows/admin-analysis-flow';

export function OverviewManager() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [aiReport, setAiReport] = useState<AdminAnalysisOutput | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateClock = () => {
      setCurrentTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  const newsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, `schools/${SCHOOL_DATA_ID}/newsArticles`), limit(5), orderBy('datePublished', 'desc')) : null, [firestore]);
  const ppdbQuery = useMemoFirebase(() => firestore ? query(collection(firestore, `schools/${SCHOOL_DATA_ID}/studentApplications`), limit(5), orderBy('submissionDate', 'desc')) : null, [firestore]);
  
  const todayAttendanceQuery = useMemoFirebase(() => {
    if (!firestore || !mounted) return null;
    return query(
        collection(firestore, `schools/${SCHOOL_DATA_ID}/attendance`),
        where('date', '>=', startOfDay(new Date())),
        orderBy('date', 'desc')
    );
  }, [firestore, mounted]);

  const { data: recentNews, isLoading: isNewsLoading } = useCollection<NewsArticle>(newsQuery);
  const { data: recentPpdb, isLoading: isPpdbLoading } = useCollection<StudentApplication>(ppdbQuery);
  const { data: todayAttendance, isLoading: isAttendanceLoading } = useCollection<AttendanceRecord>(todayAttendanceQuery);

  const attendanceStats = useMemo(() => {
    if (!todayAttendance) return { masuk: 0, pulang: 0 };
    return {
        masuk: todayAttendance.filter(a => a.notes?.includes('Masuk') || a.metadata?.direction === 'Masuk').length,
        pulang: todayAttendance.filter(a => a.notes?.includes('Pulang') || a.metadata?.direction === 'Pulang').length,
    };
  }, [todayAttendance]);

  const handleGenerateAiReport = async () => {
    setIsGeneratingAi(true);
    try {
      const result = await generateAdminAnalysis({ adminName: user?.profile?.displayName || 'Administrator' });
      setAiReport(result);
    } catch (error) {
      console.error("AI Report Error:", error);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const stats = [
    { title: 'Publikasi Aktif', count: recentNews?.length || 0, icon: Newspaper, color: 'text-primary', bg: 'bg-primary/5' },
    { title: 'Pendaftar Baru', count: recentPpdb?.length || 0, icon: UserPlus, color: 'text-primary', bg: 'bg-primary/5' },
    { title: 'Status Keamanan', count: 'Aktif', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { title: 'Koneksi Jaringan', count: 'Stabil', icon: Activity, color: 'text-accent', bg: 'bg-accent/10' },
  ];

  return (
    <div className="space-y-8 animate-reveal pb-20">
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
            <h2 className='text-3xl font-bold tracking-tight text-slate-900 font-headline uppercase'>Ringkasan Sistem</h2>
            <p className='text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest opacity-80'>Pusat kendali operasional digital sekolah.</p>
        </div>
        <div className='flex items-center gap-3 bg-card p-3 rounded-2xl border border-slate-100 shadow-md'>
            <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                <Clock size={20} />
            </div>
            <div>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Waktu Sistem</p>
                <p className='text-xs font-bold text-slate-900'>{mounted ? (currentTime || '--:--') : '--:--'} WIB</p>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <Card className="border-primary/10 bg-primary/5 rounded-[2rem] overflow-hidden relative shadow-md border-2">
                <CardHeader className="p-8 flex flex-row items-center justify-between border-b border-primary/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary text-white rounded-2xl shadow-md">
                            <UserCheck size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-900 uppercase">Absensi Hari Ini</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-500">Monitoring kehadiran biometrik real-time.</CardDescription>
                        </div>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 border-none px-4 py-1 rounded-full font-black text-[10px]">REAL-TIME</Badge>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="p-3 bg-primary/5 text-primary rounded-xl"><LogIn size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Siswa Masuk</p>
                                <p className="text-2xl font-black text-slate-900">{attendanceStats.masuk} <span className="text-[10px] text-slate-400 font-bold">Siswa</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl"><LogOut size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Siswa Pulang</p>
                                <p className="text-2xl font-black text-slate-900">{attendanceStats.pulang} <span className="text-[10px] text-slate-400 font-bold">Siswa</span></p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
                {stats.map((s, i) => (
                <Card key={i} className="border-slate-100 bg-white rounded-[2rem] group hover:border-primary/30 transition-all duration-300 shadow-md border-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
                    <CardTitle className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{s.title}</CardTitle>
                    <div className={cn("p-2.5 rounded-xl transition-all group-hover:scale-110", s.bg)}>
                        <s.icon size={14} className={s.color} />
                    </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                    <div className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        {mounted ? s.count : '0'}
                        <ArrowUpRight size={16} className='text-primary opacity-0 group-hover:opacity-100 transition-opacity' />
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>
        </div>

        <div className="space-y-6">
            <Card className="border-primary/10 bg-white rounded-[2.5rem] shadow-md overflow-hidden relative group h-full border-2">
                <CardHeader className='p-8'>
                    <CardTitle className='text-sm font-black flex items-center gap-2 text-slate-900 uppercase tracking-widest'>
                        <Sparkles size={16} className='text-accent' /> Smart Analysis AI
                    </CardTitle>
                    <CardDescription className='text-xs font-bold text-slate-500'>Sistem intelijen akademik v1.0</CardDescription>
                </CardHeader>
                <CardContent className='px-8 space-y-4'>
                    {aiReport ? (
                        <div className='space-y-4 animate-reveal'>
                            <p className='text-xs font-bold leading-relaxed text-slate-700'>"{aiReport.summary}"</p>
                            <div className='space-y-2'>
                                {aiReport.insights.map((insight, idx) => (
                                    <div key={idx} className='flex gap-2 items-start'>
                                        <div className='w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0'></div>
                                        <p className='text-xs font-bold text-slate-600 leading-tight'>{insight}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setAiReport(null)} className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary py-2">Reset analisis</button>
                        </div>
                    ) : (
                        <div className='text-center space-y-6 py-4'>
                            <p className='text-xs font-bold text-slate-500 leading-relaxed'>Gunakan kecerdasan buatan untuk menganalisis tren pendaftaran dan aktivitas terbaru secara otomatis.</p>
                            <Button 
                                onClick={handleGenerateAiReport} 
                                disabled={isGeneratingAi}
                                variant="accent"
                                className='w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg glow-accent'
                            >
                                {isGeneratingAi ? <LoaderCircle className='animate-spin mr-2' size={14}/> : <BrainCircuit className='mr-2' size={14}/>}
                                {isGeneratingAi ? 'Menganalisis...' : 'Mulai analisis'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-slate-100 bg-white rounded-[2.5rem] shadow-md border-2">
          <CardHeader className="p-8 border-b border-slate-100">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 text-slate-500">
                <UserPlus size={18} className="text-primary" /> Pendaftaran Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-1">
              {!mounted || isPpdbLoading ? (
                Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl mb-2" />)
              ) : (
                recentPpdb && recentPpdb.length > 0 ? recentPpdb.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-5 rounded-2xl hover:bg-slate-50 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black shadow-inner">
                        {app.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-sm text-slate-900 uppercase tracking-tighter group-hover:text-primary transition-colors">{app.studentName}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-widest">{app.chosenMajor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase">
                        {app.submissionDate?.toDate ? format(app.submissionDate.toDate(), 'd MMM', { locale: idLocale }) : 'Baru'}
                      </p>
                      <Badge variant="secondary" className="text-[9px] font-black mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border-none uppercase tracking-widest">{app.status || 'Pending'}</Badge>
                    </div>
                  </div>
                )) : <div className="text-center py-16 opacity-20"><UserPlus size={40} className="mx-auto mb-3" /><p className="text-[10px] font-black uppercase tracking-widest">Belum ada pendaftar baru</p></div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-white rounded-[2.5rem] shadow-md border-2">
          <CardHeader className="p-8 border-b border-slate-100">
            <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Infrastruktur Sistem</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {[
                { icon: Database, label: 'Basis Data', status: 'Sinkronisasi', color: 'text-primary', bg: 'bg-primary/5' },
                { icon: ShieldCheck, label: 'Keamanan', status: 'Terenkripsi', color: 'text-primary', bg: 'bg-primary/5' },
                { icon: HardDrive, label: 'Penyimpanan', status: 'Optimal', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                { icon: BarChart3, label: 'Lalu Lintas', status: 'Normal', color: 'text-accent', bg: 'bg-accent/10' },
            ].map((infra, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform", infra.bg, infra.color)}>
                        <infra.icon size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider opacity-60">{infra.label}</p>
                        <p className="text-sm font-bold text-slate-900">{infra.status}</p>
                    </div>
                </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}