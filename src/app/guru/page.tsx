
'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { LogOut, User as UserIcon, ShieldCheck, BookOpen, GraduationCap, Briefcase, FileText } from 'lucide-react';
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
import { QuickLinksGrid } from '@/components/shared/quick-links-grid';
import { ExamManager } from '@/components/guru/exam-manager';


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
    <div className="min-h-screen bg-background p-4 sm:p-8 pb-32">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <h1 className="text-3xl font-black font-headline text-primary tracking-tighter uppercase italic">Panel <span className='text-foreground'>Guru</span></h1>
        <Button onClick={handleLogout} variant="outline" className="rounded-xl glass-premium border-primary/20 hover:bg-primary/10 font-black uppercase text-[9px] tracking-widest">
          <LogOut className="mr-2 h-4 w-4" />
          Logout Sistem
        </Button>
      </header>
      <main className="max-w-7xl mx-auto space-y-12 animate-fade-in">
          <Card className="glass-premium border-primary/10 rounded-[2.5rem] overflow-hidden relative shadow-3xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
              <UserIcon size={120} />
          </div>
          <CardHeader>
              <div className="flex items-center gap-6 relative z-10">
              <Avatar className="h-20 w-20 border-4 border-primary/20 shadow-[0_0_20px_hsla(var(--primary)/0.2)]">
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black">
                  {user?.profile?.displayName?.charAt(0) || 'G'}
                  </AvatarFallback>
              </Avatar>
              <div>
                  <CardTitle className="text-3xl font-black font-headline tracking-tighter uppercase italic">Bapak/Ibu {user?.profile?.displayName || 'Guru'}</CardTitle>
                  <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs opacity-60">{user?.email}</p>
              </div>
              </div>
          </CardHeader>
          <CardContent className="relative z-10">
              <p className="text-muted-foreground text-sm max-w-2xl font-medium uppercase tracking-wide">Pusat Manajemen Akademik & Evaluasi Pembelajaran Digital SMKS PGRI 2 Kedondong.</p>
          </CardContent>
          </Card>

          <Tabs defaultValue="akademik" className="w-full">
            <TabsList className="grid w-full grid-cols-4 glass-premium p-1.5 h-16 rounded-2xl border-white/5 mb-12">
                <TabsTrigger value="akademik" className="rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">E-Rapor</TabsTrigger>
                <TabsTrigger value="ujian" className="rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">Ujian Online</TabsTrigger>
                <TabsTrigger value="kesiswaan" className="rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">Kesiswaan</TabsTrigger>
                <TabsTrigger value="hubin" className="rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">Industri</TabsTrigger>
            </TabsList>

            <TabsContent value="akademik" className="space-y-12 animate-fade-in">
                <ERaporManager />
                <ManajemenAbsensi />
                <JadwalPelajaran />
                <DownloadManager />
            </TabsContent>

            <TabsContent value="ujian" className="animate-fade-in">
                <ExamManager />
            </TabsContent>

            <TabsContent value="kesiswaan" className="space-y-12 animate-fade-in">
                <AchievementsManager />
                <PembinaanEskul />
            </TabsContent>

             <TabsContent value="hubin" className="animate-fade-in">
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
