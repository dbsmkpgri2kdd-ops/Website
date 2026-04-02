'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, limit, orderBy, where } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type NewsArticle, type StudentApplication, type AttendanceRecord } from '@/lib/data';
import { 
  Newspaper, UserPlus, ShieldCheck, Activity, Clock, 
  BrainCircuit, Sparkles, LoaderCircle, Database, 
  UserCheck, LogIn, LogOut, BookOpen, Settings2, MonitorPlay, Layout
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfDay } from 'date-fns';
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

  const { data: recentNews } = useCollection<NewsArticle>(newsQuery);
  const { data: recentPpdb } = useCollection<StudentApplication>(ppdbQuery);
  const { data: todayAttendance } = useCollection<AttendanceRecord>(todayAttendanceQuery);

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
    { title: 'Publikasi', count: recentNews?.length || 0, icon: Newspaper, color: 'text-primary', bg: 'bg-primary/5' },
    { title: 'PPDB Baru', count: recentPpdb?.length || 0, icon: UserPlus, color: 'text-primary', bg: 'bg-primary/5' },
    { title: 'Keamanan', count: 'Aktif', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { title: 'Sistem', count: 'Online', icon: Activity, color: 'text-accent', bg: 'bg-accent/10' },
  ];

  return (
    <div className="space-y-8 animate-reveal pb-20">
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
            <h2 className='text-3xl font-black tracking-tighter text-slate-900 font-headline uppercase'>Ringkasan Sistem</h2>
            <p className='text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest opacity-80'>Pusat kendali operasional digital sekolah.</p>
        </div>
        <div className='flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-md'>
            <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                <Clock size={20} />
            </div>
            <div>
                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Waktu Sistem</p>
                <p className='text-xs font-bold text-slate-900'>{mounted ? (currentTime || '--:--') : '--:--'} WIB</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-4 px-2">
        {[
          { label: 'User', icon: UserPlus, bg: 'bg-primary' },
          { label: 'Exam', icon: MonitorPlay, bg: 'bg-emerald-500' },
          { label: 'Sync', icon: Database, bg: 'bg-amber-500' },
          { label: 'Layout', icon: Layout, bg: 'bg-indigo-600' },
          { label: 'News', icon: Newspaper, bg: 'bg-slate-800' },
          { label: 'Settings', icon: Settings2, bg: 'bg-slate-500' },
          { label: 'Reports', icon: BookOpen, bg: 'bg-rose-500' },
          { label: 'AI Scan', icon: BrainCircuit, bg: 'bg-primary' },
        ].map((item, idx) => (
          <button key={idx} className="flex flex-col items-center gap-2 group">
            <div className={cn("quick-action-icon !w-12 !h-12", item.bg)}>
              <item.icon size={20} />
            </div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <Card className="border-primary/10 bg-primary/5 rounded-[2.5rem] overflow-hidden relative shadow-md border-2">
                <CardHeader className="p-8 flex flex-row items-center justify-between border-b border-primary/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary text-white rounded-2xl shadow-md">
                            <UserCheck size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-900 uppercase font-headline">Absensi Hari Ini</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-500">Monitoring kehadiran biometrik real-time.</CardDescription>
                        </div>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 border-none px-4 py-1 rounded-full font-black text-[10px]">LIVE</Badge>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="p-3 bg-primary/5 text-primary rounded-xl"><LogIn size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Masuk</p>
                                <p className="text-2xl font-black text-slate-900">{attendanceStats.masuk}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl"><LogOut size={20} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pulang</p>
                                <p className="text-2xl font-black text-slate-900">{attendanceStats.pulang}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                <Card key={i} className="border-slate-100 bg-white rounded-2xl group hover:border-primary/30 transition-all duration-300 shadow-sm border-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
                    <CardTitle className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.title}</CardTitle>
                    <div className={cn("p-1.5 rounded-lg transition-all", s.bg)}>
                        <s.icon size={12} className={s.color} />
                    </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                    <div className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        {mounted ? s.count : '0'}
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>
        </div>

        <div className="space-y-6">
            <Card className="border-primary/10 bg-white rounded-[2.5rem] shadow-md overflow-hidden relative group h-full border-2">
                <CardHeader className='p-8'>
                    <CardTitle className='text-sm font-black flex items-center gap-2 text-slate-900 uppercase tracking-widest font-headline'>
                        <Sparkles size={16} className='text-accent' /> Analysis AI
                    </CardTitle>
                    <CardDescription className='text-xs font-bold text-slate-500'>Sistem intelijen v1.0</CardDescription>
                </CardHeader>
                <CardContent className='px-8 space-y-4'>
                    {aiReport ? (
                        <div className='space-y-4 animate-reveal'>
                            <p className='text-xs font-bold leading-relaxed text-slate-700'>"{aiReport.summary}"</p>
                            <div className='space-y-2'>
                                {aiReport.insights.slice(0, 2).map((insight, idx) => (
                                    <div key={idx} className='flex gap-2 items-start'>
                                        <div className='w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0'></div>
                                        <p className='text-[10px] font-bold text-slate-600 leading-tight'>{insight}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setAiReport(null)} className="w-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary py-2">Reset</button>
                        </div>
                    ) : (
                        <div className='text-center space-y-6 py-4'>
                            <p className='text-[10px] font-bold text-slate-500 leading-relaxed uppercase'>Gunakan AI untuk menganalisis aktivitas terbaru secara otomatis.</p>
                            <Button 
                                onClick={handleGenerateAiReport} 
                                disabled={isGeneratingAi}
                                variant="accent"
                                className='w-full h-12 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg glow-accent'
                            >
                                {isGeneratingAi ? <LoaderCircle className='animate-spin mr-2' size={14}/> : <BrainCircuit className='mr-2' size={14}/>}
                                {isGeneratingAi ? 'Menganalisis...' : 'Analisis AI'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}