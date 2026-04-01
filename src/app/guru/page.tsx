'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { 
  LogOut, User as UserIcon, ShieldCheck, Sparkles, 
  GraduationCap, Building2, Bell, LayoutGrid, CalendarCheck 
} from 'lucide-react';
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
      toast({ title: 'Logout Berhasil', description: 'Kembali ke beranda...' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Logout Gagal' });
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8 pb-32 sm:pb-8 tech-mesh">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
            <div className="bg-primary text-white p-2.5 rounded-2xl shadow-xl glow-primary">
                <Sparkles size={24} />
            </div>
            <div className='flex flex-col'>
                <h1 className="text-xl sm:text-2xl font-extrabold font-headline text-slate-900 tracking-tight leading-none">Guru Portal</h1>
                <span className='text-[9px] font-bold uppercase tracking-[0.2em] text-primary opacity-60 mt-1'>Academic Management Hub</span>
            </div>
        </div>
        <Button onClick={handleLogout} variant="outline" className="rounded-xl h-11 px-6 font-bold text-xs border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
          <LogOut className="mr-2 h-4 w-4 opacity-40" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </header>
      
      <main className="max-w-7xl mx-auto space-y-10 animate-reveal">
          <Card className="border-slate-100 bg-white rounded-[2.5rem] overflow-hidden relative shadow-xl border-2">
            <CardHeader className='p-8 md:p-12'>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10 text-center md:text-left">
                <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-primary/10 shadow-lg">
                    <AvatarFallback className="bg-primary/5 text-primary text-4xl font-extrabold">
                    {user?.profile?.displayName?.charAt(0) || 'G'}
                    </AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                    <div className='flex items-center justify-center md:justify-start gap-2 text-primary mb-3'>
                      <ShieldCheck size={16} className='animate-pulse' />
                      <span className='text-[10px] font-bold uppercase tracking-widest'>Akses Terverifikasi v7.5</span>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl font-extrabold font-headline tracking-tight text-slate-900 leading-none">Bapak/Ibu {user?.profile?.displayName || 'Guru'}</CardTitle>
                    <p className="text-slate-500 font-medium text-xs mt-3 opacity-80">{user?.email}</p>
                    
                    <div className='flex flex-wrap justify-center md:justify-start gap-3 mt-6'>
                        <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-100 px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase">Sesi: {user?.profile?.session || 'Pagi'}</Badge>
                        <Badge variant="outline" className="border-primary/20 text-primary px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase">Role: Guru Pengajar</Badge>
                    </div>
                </div>
                </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="akademik" className="w-full">
            <div className="overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 mb-8">
                <TabsList className="flex w-fit sm:grid sm:w-full grid-cols-4 bg-slate-50 p-1 h-14 rounded-2xl border border-slate-100 gap-1 shadow-inner">
                    <TabsTrigger value="akademik" className="rounded-xl font-bold text-[10px] uppercase transition-all px-8 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary">
                        <GraduationCap className='mr-2 h-4 w-4' /> Akademik
                    </TabsTrigger>
                    <TabsTrigger value="ujian" className="rounded-xl font-bold text-[10px] uppercase transition-all px-8 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary">
                        <ShieldCheck className='mr-2 h-4 w-4' /> ExamBro
                    </TabsTrigger>
                    <TabsTrigger value="kesiswaan" className="rounded-xl font-bold text-[10px] uppercase transition-all px-8 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary">
                        <Bell className='mr-2 h-4 w-4' /> Kesiswaan
                    </TabsTrigger>
                    <TabsTrigger value="hubin" className="rounded-xl font-bold text-[10px] uppercase transition-all px-8 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary">
                        <Building2 className='mr-2 h-4 w-4' /> Hubin
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="akademik" className="space-y-10 pt-4">
                <QuickLinksGrid audience="guru" title="Dashboard Akademik" description="Layanan pendukung administrasi harian bapak/ibu guru." />
                <ERaporManager />
                <ManajemenAbsensi />
                <JadwalPelajaran />
                <DownloadManager />
            </TabsContent>

            <TabsContent value="ujian" className="pt-4">
                <ExamManager />
            </TabsContent>

            <TabsContent value="kesiswaan" className="space-y-10 pt-4">
                <AchievementsManager />
                <PembinaanEskul />
            </TabsContent>

             <TabsContent value="hubin" className="pt-4">
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