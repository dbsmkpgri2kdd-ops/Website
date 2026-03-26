
'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { LogOut, User as UserIcon } from 'lucide-react';
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


function GuruDashboard() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: 'Logout Berhasil',
        description: 'Anda telah keluar dari sesi Anda.',
      });
      router.push('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout Gagal',
        description: 'Terjadi kesalahan saat mencoba logout.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline text-primary">Dasbor Guru</h1>
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>
      <main className="max-w-7xl mx-auto space-y-12">
          <Card className="shadow-lg rounded-2xl">
          <CardHeader>
              <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarFallback className="bg-primary/20 text-primary">
                  <UserIcon size={32} />
                  </AvatarFallback>
              </Avatar>
              <div>
                  <CardTitle className="text-2xl font-bold">Selamat Datang, Bapak/Ibu {user?.profile?.displayName || 'Guru'}!</CardTitle>
                  <p className="text-muted-foreground">{user?.email}</p>
              </div>
              </div>
          </CardHeader>
          <CardContent>
              <p>Ini adalah halaman dasbor Anda. Dari sini, Anda dapat memantau dan mengelola aktivitas akademik dan kesiswaan.</p>
          </CardContent>
          </Card>

          {/* New Dynamic Quick Links for Guru */}
          <QuickLinksGrid audience="guru" title="Aplikasi Guru" description="Platform kerja dan pendukung operasional tenaga pendidik." />

          <Tabs defaultValue="akademik" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="akademik">Akademik</TabsTrigger>
                <TabsTrigger value="kesiswaan">Kesiswaan</TabsTrigger>
                <TabsTrigger value="hubin">Hubungan Industri</TabsTrigger>
            </TabsList>
            <TabsContent value="akademik" className="mt-6 space-y-8">
                <ERaporManager />
                <ManajemenAbsensi />
                <JadwalPelajaran />
                <DownloadManager />
            </TabsContent>
            <TabsContent value="kesiswaan" className="mt-6 space-y-8">
                <AchievementsManager />
                <PembinaanEskul />
            </TabsContent>
             <TabsContent value="hubin" className="mt-6 space-y-8">
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
