'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type NewsArticle, type StudentApplication } from '@/lib/data';
import { Newspaper, UserPlus, ShieldCheck, Activity, Database, HardDrive, BarChart3, Clock, ArrowUpRight, Rocket, BrainCircuit, Sparkles, LoaderCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { generateAdminAnalysis, type AdminAnalysisOutput } from '@/ai/flows/admin-analysis-flow';

export function OverviewManager() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [aiReport, setAiReport] = useState<AdminAnalysisOutput | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  const newsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, `schools/${SCHOOL_DATA_ID}/newsArticles`), limit(5), orderBy('datePublished', 'desc')) : null, [firestore]);
  const ppdbQuery = useMemoFirebase(() => firestore ? query(collection(firestore, `schools/${SCHOOL_DATA_ID}/studentApplications`), limit(5), orderBy('submissionDate', 'desc')) : null, [firestore]);

  const { data: recentNews, isLoading: isNewsLoading } = useCollection<NewsArticle>(newsQuery);
  const { data: recentPpdb, isLoading: isPpdbLoading } = useCollection<StudentApplication>(ppdbQuery);

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
    { title: 'Publikasi aktif', count: recentNews?.length || 0, icon: Newspaper, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Pendaftar baru', count: recentPpdb?.length || 0, icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Status keamanan', count: 'Aktif', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Koneksi jaringan', count: 'Stabil', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 animate-reveal pb-20">
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
            <h2 className='text-3xl font-bold tracking-tight text-slate-900'>Ringkasan sistem</h2>
            <p className='text-sm font-medium text-slate-500 mt-1'>Pusat kendali operasional digital sekolah.</p>
        </div>
        <div className='flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm'>
            <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                <Clock size={20} />
            </div>
            <div>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Waktu sistem</p>
                <p className='text-xs font-bold text-slate-900'>{currentTime || '--:--'} WIB</p>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <Card className="border-emerald-100 bg-emerald-50/30 rounded-[2rem] overflow-hidden relative shadow-sm">
                <CardHeader className="p-8 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-md">
                            <Rocket size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-900">Portal siap digunakan</CardTitle>
                            <CardDescription className="text-xs font-medium text-emerald-700/70">Semua layanan berjalan dengan optimal.</CardDescription>
                        </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-4 py-1 rounded-full font-bold text-[10px]">Optimal</Badge>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Framework', 'Security', 'Database', 'Assets'].map((item) => (
                            <div key={item} className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-100 shadow-sm">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                <span className="text-[11px] font-bold text-slate-700">{item}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
                {stats.map((s, i) => (
                <Card key={i} className="border-slate-200 bg-white rounded-[2rem] group hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-6">
                    <CardTitle className="text-[11px] font-bold text-slate-400">{s.title}</CardTitle>
                    <div className={cn("p-2.5 rounded-xl transition-all group-hover:scale-110", s.bg)}>
                        <s.icon size={14} className={s.color} />
                    </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                    <div className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        {s.count}
                        <ArrowUpRight size={16} className='text-primary opacity-0 group-hover:opacity-100 transition-opacity' />
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>
        </div>

        <div className="space-y-6">
            <Card className="border-primary/10 bg-white rounded-[2.5rem] shadow-sm overflow-hidden relative group h-full">
                <CardHeader className='p-8'>
                    <CardTitle className='text-sm font-bold flex items-center gap-2 text-slate-900'>
                        <Sparkles size={16} className='text-primary' /> Analisis AI
                    </CardTitle>
                    <CardDescription className='text-xs font-medium text-slate-500'>Wawasan cerdas v1.0</CardDescription>
                </CardHeader>
                <CardContent className='px-8 space-y-4'>
                    {aiReport ? (
                        <div className='space-y-4 animate-reveal'>
                            <p className='text-xs font-medium leading-relaxed italic text-slate-700'>"{aiReport.summary}"</p>
                            <div className='space-y-2'>
                                {aiReport.insights.map((insight, idx) => (
                                    <div key={idx} className='flex gap-2 items-start'>
                                        <div className='w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0'></div>
                                        <p className='text-xs font-semibold text-slate-600 leading-tight'>{insight}</p>
                                    </div>
                                ))}
                            </div>
                            <Button onClick={() => setAiReport(null)} variant="ghost" className="w-full text-[10px] font-bold text-slate-400 hover:text-primary">Reset analisis</Button>
                        </div>
                    ) : (
                        <div className='text-center space-y-6 py-4'>
                            <p className='text-xs font-medium text-slate-500 leading-relaxed'>Gunakan kecerdasan buatan untuk menganalisis tren pendaftaran dan aktivitas terbaru.</p>
                            <Button 
                                onClick={handleGenerateAiReport} 
                                disabled={isGeneratingAi}
                                className='w-full h-12 rounded-xl font-bold text-xs shadow-sm'
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
        <Card className="lg:col-span-2 border-slate-200 bg-white rounded-[2.5rem] shadow-sm">
          <CardHeader className="p-8 border-b border-slate-100">
            <CardTitle className="text-sm font-bold flex items-center gap-3 text-slate-900">
                <UserPlus size={18} className="text-primary" /> Pendaftaran terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-1">
              {isPpdbLoading ? (
                Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl mb-2" />)
              ) : (
                recentPpdb && recentPpdb.length > 0 ? recentPpdb.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-5 rounded-2xl hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {app.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{app.studentName}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{app.chosenMajor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400">
                        {app.submissionDate?.toDate ? format(app.submissionDate.toDate(), 'd MMM', { locale: idLocale }) : 'Baru'}
                      </p>
                      <Badge variant="secondary" className="text-[9px] font-bold mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border-none">{app.status || 'Pending'}</Badge>
                    </div>
                  </div>
                )) : <div className="text-center py-16 opacity-40"><UserPlus size={40} className="mx-auto mb-3" /><p className="text-xs font-bold text-slate-400">Belum ada pendaftar baru</p></div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white rounded-[2.5rem] shadow-sm">
          <CardHeader className="p-8 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">Infrastruktur sistem</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {[
                { icon: Database, label: 'Basis data', status: 'Sinkronisasi', color: 'text-blue-600', bg: 'bg-blue-50' },
                { icon: ShieldCheck, label: 'Keamanan', status: 'Terenkripsi', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { icon: HardDrive, label: 'Penyimpanan', status: 'Optimal', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { icon: BarChart3, label: 'Lalu lintas', status: 'Normal', color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((infra, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform", infra.bg, infra.color)}>
                        <infra.icon size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{infra.label}</p>
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