
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type NewsArticle, type StudentApplication } from '@/lib/data';
import { Newspaper, UserPlus, ShieldCheck, Activity, Database, HardDrive, BarChart3, Clock, ArrowUpRight, Rocket, Globe, Zap, Palette } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function OverviewManager() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [currentTime, setCurrentTime] = useState<string>('');

  // Fix hydration mismatch for clock
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

  const stats = [
    { title: 'PUBLIKASI', count: recentNews?.length || 0, icon: Newspaper, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'PENDAFTAR', count: recentPpdb?.length || 0, icon: UserPlus, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { title: 'KEAMANAN', count: 'AKTIF', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'JARINGAN', count: '99.9%', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-10 animate-reveal pb-20">
      {/* HEADER SECTION */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
            <h2 className='text-3xl font-black italic uppercase tracking-tighter'>Pusat Kendali <span className='text-primary'>Utama</span></h2>
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

      {/* DEPLOYMENT READINESS CHECKLIST */}
      <Card className="border-emerald-500/20 bg-emerald-500/[0.02] rounded-[2rem] overflow-hidden relative border shadow-3xl">
          <CardHeader className="p-6 md:p-8 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg">
                      <Rocket size={20} />
                  </div>
                  <div>
                      <CardTitle className="text-lg font-black uppercase italic">Kesiapan Portal Digital</CardTitle>
                      <CardDescription className="text-[9px] font-bold uppercase tracking-widest opacity-60">Status Konfigurasi Produksi Website</CardDescription>
                  </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-500 border-none px-4 py-1 rounded-full font-black text-[9px] tracking-widest animate-pulse">SISTEM OPTIMAL</Badge>
          </CardHeader>
          <CardContent className="px-6 md:px-8 pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                      <Globe size={16} className="text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Web Frameworks</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                      <ShieldCheck size={16} className="text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Secure Access</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                      <Palette size={16} className="text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Brand Engine</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                      <Zap size={16} className="text-emerald-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Fast Refresh</span>
                  </div>
              </div>
          </CardContent>
      </Card>

      {/* QUICK STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* RECENT APPLICATIONS MONITOR */}
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
                  <div key={app.id} className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-transparent hover:border-primary/20 hover:bg-white/[0.05] transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-lg uppercase">
                        {app.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight italic">{app.studentName}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">{app.chosenMajor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{format(app.submissionDate?.toDate ? app.submissionDate.toDate() : new Date(app.submissionDate), 'd MMM, HH:mm', { locale: idLocale })}</p>
                      <Badge variant="secondary" className="text-[8px] font-black mt-2 px-3 py-0.5 rounded-full bg-primary/10 text-primary border-none">{app.status || 'PENDING'}</Badge>
                    </div>
                  </div>
                )) : <div className="text-center py-20 opacity-20"><UserPlus size={48} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-widest">Belum ada pendaftar baru</p></div>
              }
            </div>
          </CardContent>
        </Card>

        {/* INFRASTRUCTURE STATUS */}
        <Card className="border-white/5 bg-white/5 rounded-[2.5rem] shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-sm font-black uppercase tracking-[0.4em]">Infrastruktur Sistem</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center gap-5 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-xl group-hover:scale-110 transition-transform"><Database size={24} /></div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Basis Data</p>
                <p className="text-sm font-black tracking-tight uppercase italic">Sinkronisasi Cloud</p>
              </div>
            </div>
            <div className="flex items-center gap-5 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-xl group-hover:scale-110 transition-transform"><ShieldCheck size={24} /></div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Keamanan</p>
                <p className="text-sm font-black tracking-tight uppercase italic">SSL Terenkripsi</p>
              </div>
            </div>
            <div className="flex items-center gap-5 group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-xl group-hover:scale-110 transition-transform"><HardDrive size={24} /></div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Storage</p>
                <p className="text-sm font-black tracking-tight uppercase italic">Optimal (98%)</p>
              </div>
            </div>
            <div className="flex items-center gap-5 group">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-xl group-hover:scale-110 transition-transform"><BarChart3 size={24} /></div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Jaringan</p>
                <p className="text-sm font-black tracking-tight uppercase italic">Latency Rendah</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
