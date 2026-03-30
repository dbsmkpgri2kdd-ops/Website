
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type NewsArticle, type StudentApplication } from '@/lib/data';
import { Newspaper, UserPlus, ShieldCheck, Activity, Database, HardDrive, BarChart3, Clock, ArrowUpRight, Rocket, Globe, Zap, Palette, BrainCircuit, Sparkles, LoaderCircle } from 'lucide-react';
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
    { title: 'PUBLIKASI', count: recentNews?.length || 0, icon: Newspaper, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'PENDAFTAR', count: recentPpdb?.length || 0, icon: UserPlus, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { title: 'KEAMANAN', count: 'AKTIF', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'JARINGAN', count: '99.9%', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-10 animate-reveal pb-20">
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
            <h2 className='text-3xl font-black italic uppercase tracking-tighter font-headline'>Pusat Kendali <span className='text-primary'>Utama</span></h2>
            <p className='text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mt-1'>Sistem Operasional Digital Terpadu v7.5</p>
        </div>
        <div className='flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 shadow-2xl'>
            <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                <Clock size={20} />
            </div>
            <div>
                <p className='text-[8px] font-black uppercase text-muted-foreground tracking-widest'>Sesi Aktif</p>
                <p className='text-[10px] font-bold uppercase'>{currentTime || '--:--'} WIB</p>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card className="border-emerald-500/20 bg-emerald-500/[0.02] rounded-[2rem] overflow-hidden relative border shadow-3xl">
                <CardHeader className="p-6 md:p-8 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg">
                            <Rocket size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-black uppercase italic font-headline">Kesiapan Portal</CardTitle>
                            <CardDescription className="text-[9px] font-bold uppercase tracking-widest opacity-60">Status Konfigurasi Website</CardDescription>
                        </div>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-500 border-none px-4 py-1 rounded-full font-black text-[9px] tracking-widest animate-pulse">OPTIMAL</Badge>
                </CardHeader>
                <CardContent className="px-6 md:px-8 pb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Web Frameworks', 'Secure Access', 'Brand Engine', 'Fast Refresh'].map((item) => (
                            <div key={item} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                <span className="text-[9px] font-bold uppercase tracking-wider">{item}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
                {stats.map((s, i) => (
                <Card key={i} className="border-white/5 bg-white/5 rounded-3xl overflow-hidden group hover:border-primary/20 transition-all duration-500 shadow-2xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{s.title}</CardTitle>
                    <div className={cn("p-2 rounded-xl transition-all group-hover:scale-110", s.bg)}>
                        <s.icon size={14} className={s.color} />
                    </div>
                    </CardHeader>
                    <CardContent>
                    <div className="text-3xl font-black tracking-tighter italic uppercase flex items-center gap-2">
                        {s.count}
                        <ArrowUpRight size={16} className='text-primary opacity-0 group-hover:opacity-100 transition-opacity' />
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>
        </div>

        <div className="space-y-8">
            <Card className="border-primary/20 bg-primary/5 rounded-[2rem] shadow-3xl overflow-hidden relative group">
                <div className='absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity'>
                    <BrainCircuit size={80} className='text-primary' />
                </div>
                <CardHeader>
                    <CardTitle className='text-sm font-black uppercase tracking-widest flex items-center gap-2'>
                        <Sparkles size={16} className='text-primary' /> AI Analysis
                    </CardTitle>
                    <CardDescription className='text-[10px] font-medium uppercase'>Intelligence Hub v1.0</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {aiReport ? (
                        <div className='space-y-4 animate-reveal'>
                            <p className='text-xs font-medium leading-relaxed italic text-foreground/80'>"{aiReport.summary}"</p>
                            <div className='space-y-2'>
                                {aiReport.insights.map((insight, idx) => (
                                    <div key={idx} className='flex gap-2 items-start'>
                                        <div className='w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0'></div>
                                        <p className='text-[10px] font-bold text-muted-foreground uppercase leading-tight'>{insight}</p>
                                    </div>
                                ))}
                            </div>
                            <Button onClick={() => setAiReport(null)} variant="ghost" className="w-full text-[9px] font-black uppercase tracking-widest text-muted-foreground">Reset Analisis</Button>
                        </div>
                    ) : (
                        <div className='text-center space-y-6 py-4'>
                            <p className='text-[10px] font-medium text-muted-foreground uppercase leading-loose'>Dapatkan ringkasan status pendaftaran dan interaksi pengunjung menggunakan AI.</p>
                            <Button 
                                onClick={handleGenerateAiReport} 
                                disabled={isGeneratingAi}
                                className='w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl glow-primary'
                            >
                                {isGeneratingAi ? <LoaderCircle className='animate-spin mr-2' size={14}/> : <BrainCircuit className='mr-2' size={14}/>}
                                {isGeneratingAi ? 'Menganalisis...' : 'Generate Insight'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-white/5 bg-white/5 rounded-[2.5rem] shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-sm font-black uppercase tracking-[0.4em] flex items-center gap-3">
                <UserPlus size={18} className="text-primary" /> Pendaftaran Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {isPpdbLoading ? <Skeleton className="h-60 w-full rounded-[2rem]" /> : 
                recentPpdb && recentPpdb.length > 0 ? recentPpdb.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-transparent hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase">
                        {app.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight italic font-headline">{app.studentName}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">{app.chosenMajor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{format(app.submissionDate?.toDate ? app.submissionDate.toDate() : new Date(app.submissionDate), 'd MMM', { locale: idLocale })}</p>
                      <Badge variant="secondary" className="text-[8px] font-black mt-2 px-3 py-0.5 rounded-full bg-primary/10 text-primary border-none">{app.status || 'PENDING'}</Badge>
                    </div>
                  </div>
                )) : <div className="text-center py-20 opacity-20"><UserPlus size={48} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-widest">Belum ada pendaftar baru</p></div>
              }
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/5 rounded-[2.5rem] shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-sm font-black uppercase tracking-[0.4em]">Infrastruktur Sistem</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {[
                { icon: Database, label: 'Basis Data', status: 'Sinkronisasi Cloud', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { icon: ShieldCheck, label: 'Keamanan', status: 'SSL Terenkripsi', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                { icon: HardDrive, label: 'Penyimpanan', status: 'Optimal (98%)', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { icon: BarChart3, label: 'Jaringan', status: 'Latency Rendah', color: 'text-amber-500', bg: 'bg-amber-500/10' },
            ].map((infra, idx) => (
                <div key={idx} className="flex items-center gap-5 group">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform", infra.bg, infra.color)}>
                        <infra.icon size={24} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{infra.label}</p>
                        <p className="text-sm font-black tracking-tight uppercase italic">{infra.status}</p>
                    </div>
                </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
