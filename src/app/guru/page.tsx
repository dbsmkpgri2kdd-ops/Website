'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { LogOut, User as UserIcon, ShieldCheck, Sparkles } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth } from '@/firebase';
import { PembinaanEskul } from '@/components/guru/pembinaan-ekskul';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JadwalPelajaran } from '@/components/shared/jadwal-pelajaran';
import { DownloadManager } from '@/components/shared/download-manager';
import { ManajemenPrakerin } from '@/components/shared/manajemen-prakerin';
import { AchievementsManager } from '@/components/admin/achievements-manager';
import { ERaporManager } from '@/components/shared/e-rapor-manager';
import { ManajemenAbsensi } from '@/components/guru/manajemen-absensi';
import { ExamManager } from '@/components/guru/exam-manager';
import { QuickLinksGrid } from '@/components/shared/quick-links-grid';


function GuruDashboard() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.replace('/');
      toast({
        title: 'Logout Berhasil',
        description: 'Kembali ke beranda...',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout Gagal',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8 pb-32 sm:pb-8 tech-mesh">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8 sm:mb-12">
        <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-xl shadow-lg">
                <Sparkles size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-headline text-slate-900 tracking-tighter uppercase italic">Guru <span className='text-primary'>Portal</span></h1>
        </div>
        <Button onClick={handleLogout} variant="outline" className="rounded-xl h-11 px-6 font-black text-[10px] uppercase tracking-widest border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
          <LogOut className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Logout Sistem</span>
          <span className="sm:hidden">Keluar</span>
        </Button>
      </header>
      
      <main className="max-w-7xl mx-auto space-y-8 sm:space-y-12 animate-reveal">
          <Card className="border-slate-100 bg-white rounded-[3rem] overflow-hidden relative shadow-2xl border-2">
          <div className="absolute top-0 right-0 p-8 opacity-5 hidden sm:block">
              <UserIcon size={120} />
          </div>
          <CardHeader className='p-8 sm:p-12'>
              <div className="flex items-center gap-6 sm:gap-8 relative z-10">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-primary/10 shadow-xl">
                  <AvatarFallback className="bg-primary/5 text-primary text-3xl sm:text-4xl font-black italic">
                  {user?.profile?.displayName?.charAt(0) || 'G'}
                  </AvatarFallback>
              </Avatar>
              <div>
                  <div className='flex items-center gap-2 text-primary mb-1'>
                    <ShieldCheck size={14} />
                    <span className='text-[10px] font-black uppercase tracking-[0.3em]'>Akses Terverifikasi</span>
                  </div>
                  <CardTitle className="text-2xl sm:text-4xl font-black font-headline tracking-tighter uppercase italic text-slate-900">Bapak/Ibu {user?.profile?.displayName || 'Guru'}</CardTitle>
                  <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest opacity-60 mt-1">{user?.email}</p>
              </div>
              </div>
          </CardHeader>
          <CardContent className="relative z-10 p-8 sm:p-12 pt-0 sm:pt-0 border-t border-slate-50 mt-4 bg-slate-50/30">
              <div className='grid sm:grid-cols-2 gap-8 py-8'>
                <p className="text-slate-500 text-sm font-medium leading-relaxed uppercase tracking-wide">
                    Selamat datang di Pusat Manajemen Akademik & Evaluasi Pembelajaran Digital SMKS PGRI 2 Kedondong.
                </p>
                <div className='flex justify-end items-center gap-4'>
                    <div className='text-right'>
                        <p className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>Status Sesi</p>
                        <p className='text-sm font-bold text-slate-900'>Sesi {user?.profile?.session || 'Pagi'}</p>
                    </div>
                    <div className='h-10 w-px bg-slate-200'></div>
                    <div className='text-right'>
                        <p className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>Role Akses</p>
                        <p className='text-sm font-bold text-primary uppercase'>{user?.profile?.role || 'Guru'}</p>
                    </div>
                </div>
              </div>
          </CardContent>
          </Card>

          <Tabs defaultValue="akademik" className="w-full">
            <div className="overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                <TabsList className="flex w-fit sm:grid sm:w-full grid-cols-4 bg-slate-100 p-1.5 h-16 rounded-2xl border border-slate-200 mb-8 sm:mb-12 gap-2 shadow-inner">
                    <TabsTrigger value="akademik" className="rounded-xl font-black text-[10px] uppercase tracking-widest transition-all px-8 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary">E-Rapor & Akademik</TabsTrigger>
                    <TabsTrigger value="ujian" className="rounded-xl font-black text-[10px] uppercase tracking-widest transition-all px-8 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary">Ujian Online</TabsTrigger>
                    <TabsTrigger value="kesiswaan" className="rounded-xl font-black text-[10px] uppercase tracking-widest transition-all px-8 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary">Kesiswaan</TabsTrigger>
                    <TabsTrigger value="hubin" className="rounded-xl font-black text-[10px] uppercase tracking-widest transition-all px-8 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary">Hubungan Industri</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="akademik" className="space-y-12 sm:space-y-20 animate-fade-in pt-4">
                <QuickLinksGrid audience="guru" title="Dashboard Akademik" description="Akses cepat layanan pendukung pembelajaran dan administrasi guru." />
                <ERaporManager />
                <ManajemenAbsensi />
                <JadwalPelajaran />
                <DownloadManager />
            </TabsContent>

            <TabsContent value="ujian" className="animate-fade-in pt-4">
                <ExamManager />
            </TabsContent>

            <TabsContent value="kesiswaan" className="space-y-12 sm:space-y-20 animate-fade-in pt-4">
                <AchievementsManager />
                <PembinaanEskul />
            </TabsContent>

             <TabsContent value="hubin" className="animate-fade-in pt-4">
                <ManajemenPrakerin />
            </TabsContent>
        </Tabs>
          
      </main>
    </div>
  );
}

export default function GuruPage() {
    return (
        <ProtectedRoute allowedRoles={['guru', 'admin']}>
            <GuruDashboard />
        </ProtectedRoute>
    )
}