'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type NewsArticle, type StudentApplication, type GuestbookEntry } from '@/lib/data';
import { Newspaper, UserPlus, MessageSquare, TrendingUp, Users, Award, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export function OverviewManager() {
  const firestore = useFirestore();

  // Fetches basic stats (limited for performance)
  const newsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, `schools/${SCHOOL_DATA_ID}/newsArticles`), limit(5), orderBy('datePublished', 'desc')) : null, [firestore]);
  const ppdbQuery = useMemoFirebase(() => firestore ? query(collection(firestore, `schools/${SCHOOL_DATA_ID}/studentApplications`), limit(5), orderBy('submissionDate', 'desc')) : null, [firestore]);
  const guestQuery = useMemoFirebase(() => firestore ? query(collection(firestore, `schools/${SCHOOL_DATA_ID}/guestbookEntries`), limit(5), orderBy('createdAt', 'desc')) : null, [firestore]);

  const { data: recentNews, isLoading: isNewsLoading } = useCollection<NewsArticle>(newsQuery);
  const { data: recentPpdb, isLoading: isPpdbLoading } = useCollection<StudentApplication>(ppdbQuery);
  const { data: recentGuest, isLoading: isGuestLoading } = useCollection<GuestbookEntry>(guestQuery);

  const stats = [
    { title: 'Berita Terbaru', icon: Newspaper, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Pendaftar PPDB', icon: UserPlus, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Pesan Guestbook', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Trend Interaksi', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-none shadow-sm bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
              <div className={`p-2 rounded-lg ${s.bg} ${s.color}`}>
                <s.icon size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Aktif</div>
              <p className="text-xs text-muted-foreground mt-1">Status sistem normal</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity: PPDB */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><UserPlus size={20} /> Antrean Pendaftaran PPDB</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isPpdbLoading ? <Skeleton className="h-40 w-full" /> : 
                recentPpdb && recentPpdb.length > 0 ? recentPpdb.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div>
                      <p className="font-bold text-sm">{app.studentName}</p>
                      <p className="text-xs text-muted-foreground">{app.chosenMajor}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{format(app.submissionDate.toDate(), 'd MMM, HH:mm', { locale: idLocale })}</p>
                      <p className="text-[10px] text-primary">BARU</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-center text-muted-foreground py-8">Belum ada pendaftar baru.</p>
              }
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats: Content Summary */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Ringkasan Konten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Users size={20} /></div>
              <div><p className="text-sm font-bold">Siswa & Guru</p><p className="text-xs text-muted-foreground">Master data terverifikasi</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500"><Award size={20} /></div>
              <div><p className="text-sm font-bold">Prestasi</p><p className="text-xs text-muted-foreground">Publikasi aktif</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500"><BookOpen size={20} /></div>
              <div><p className="text-sm font-bold">Kurikulum</p><p className="text-xs text-muted-foreground">Jadwal & Rapor Digital</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
