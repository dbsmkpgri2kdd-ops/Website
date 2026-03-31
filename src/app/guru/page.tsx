'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { LogOut, User as UserIcon, ShieldCheck, Sparkles, LayoutGrid, GraduationCap, Building2, Bell } from 'lucide-react';
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
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-10 md:mb-14">
        <div className="flex items-center gap-4">
            <div className="bg-primary text-white p-2.5 rounded-2xl shadow-2xl glow-primary">
                <Sparkles size={24} />
            </div>
            <div className='flex flex-col'>
                <h1 className="text-xl sm:text-3xl font-black font-headline text-slate-900 tracking-tighter uppercase leading-none">Guru <span className='text-primary'>Portal.</span></h1>
                <span className='text-[9px] font-black uppercase tracking-[0.4em] text-primary opacity-40 mt-1'>Academic Management Hub</span>
            </div>
        </div>
        <Button onClick={handleLogout} variant="outline" className="rounded-2xl h-12 px-8 font-black text-[10px] uppercase tracking-widest border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
          <LogOut className="mr-2 h-4 w-4 opacity-40" />
          <span className="hidden sm:inline">Logout Sistem</span>
          <span className="sm:hidden">Keluar</span>
        </Button>
      </header>
      
      <main className="max-w-7xl mx-auto space-y-10 md:space-y-16 animate-reveal">
          <Card className="border-slate-100 bg-white rounded-[3rem] overflow-hidden relative shadow-2xl border-2 hover:border-primary/10 transition-all duration-700">
          <div className="absolute top-0 right-0 p-12 opacity-5 hidden lg:block rotate-12">
              <UserIcon size={180} />
          </div>
          <CardHeader className='p-8 md:p-14'>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10 relative z-10 text-center md:text-left">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary/10 shadow-2xl scale-100 hover:scale-105 transition-transform duration-500">
                  <AvatarFallback className="bg-primary/5 text-primary text-4xl md:text-5xl font-black">
                  {user?.profile?.displayName?.charAt(0) || 'G'}
                  </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                  <div className='flex items-center justify-center md:justify-start gap-3 text-primary mb-3'>
                    <ShieldCheck size={18} className='animate-pulse' />
                    <span className='text-[11px] font-black uppercase tracking-[0.4em]'>Akses Terverifikasi v7.5</span>
                  </div>
                  <CardTitle className="text-3xl md:text-5xl font-black font-headline tracking-tighter uppercase text-slate-900 leading-none">Bapak/Ibu {user?.profile?.displayName || 'Guru'}</CardTitle>
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-4 opacity-80">{user?.email}</p>
                  
                  <div className='flex flex-wrap justify-center md:justify-start gap-3 mt-8'>
                    <div className='px-5 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3'>
                        <div className='w-2 h-2 rounded-full bg-primary'></div>
                        <span className='text-[10px] font-black uppercase tracking-widest text-slate-600'>Role: {user?.profile?.role || 'Guru'}</span>
                    </div>
                    <div className='px-5 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3'>
                        <div className='w-2 h-2 rounded-full bg-accent'></div>
                        <span className='text-[10px] font-black uppercase tracking-widest text-slate-600'>Sesi: {user?.profile?.session || 'Pagi'}</span>
                    </div>
                  </div>
              </div>
              </div>
          </CardHeader>
          <CardContent className="relative z-10 p-8 md:p-14 pt-0 md:pt-0 border-t border-slate-50 mt-4 bg-slate-50/30">
              <div className='py-8'>
                <p className="text-slate-600 text-xs md:text-sm font-bold leading-relaxed uppercase tracking-widest opacity-80 max-w-3xl">
                    Selamat datang di Pusat Manajemen Akademik Digital. Gunakan panel di bawah untuk mengelola nilai e-rapor, monitoring kehadiran siswa, dan konfigurasi ujian ExamBro secara real-time.
                </p>
              </div>
          </CardContent>
          </Card>

          <Tabs defaultValue="akademik" className="w-full">
            <div className="overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 mb-10">
                <TabsList className="flex w-fit sm:grid sm:w-full grid-cols-4 bg-slate-50 p-1.5 h-16 rounded-[2rem] border border-slate-100 gap-2 shadow-inner">
                    <TabsTrigger value="akademik" className="rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all px-8 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary border border-transparent data-[state=active]:border-slate-100">
                        <GraduationCap className='mr-2 h-4 w-4' /> Akademik
                    </TabsTrigger>
                    <TabsTrigger value="ujian" className="rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all px-8 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary border border-transparent data-[state=active]:border-slate-100">
                        <ShieldCheck className='mr-2 h-4 w-4' /> ExamBro
                    </TabsTrigger>
                    <TabsTrigger value="kesiswaan" className="rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all px-8 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary border border-transparent data-[state=active]:border-slate-100">
                        <Bell className='mr-2 h-4 w-4' /> Kesiswaan
                    </TabsTrigger>
                    <TabsTrigger value="hubin" className="rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all px-8 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary border border-transparent data-[state=active]:border-slate-100">
                        <Building2 className='mr-2 h-4 w-4' /> Hubin
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="akademik" className="space-y-12 md:space-y-20 animate-fade-in pt-4">
                <QuickLinksGrid audience="guru" title="Dashboard Akademik" description="Akses cepat layanan pendukung pembelajaran dan administrasi harian bapak/ibu guru." />
                <ERaporManager />
                <ManajemenAbsensi />
                <JadwalPelajaran />
                <DownloadManager />
            </TabsContent>

            <TabsContent value="ujian" className="animate-fade-in pt-4">
                <ExamManager />
            </TabsContent>

            <TabsContent value="kesiswaan" className="space-y-12 md:space-y-20 animate-fade-in pt-4">
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