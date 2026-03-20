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
import { JadwalPelajaran } from '@/components/shared/jadwal-pelajaran';
import { ERaporSiswa } from '@/components/siswa/e-rapor-siswa';
import { AbsensiSiswa } from '@/components/siswa/absensi-siswa';
import { PortofolioDigital } from '@/components/siswa/portofolio-digital';


function SiswaDashboard() {
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
        <h1 className="text-3xl font-bold font-headline text-primary">Dasbor Siswa</h1>
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>
      <main className="max-w-7xl mx-auto space-y-8">
          <Card className="shadow-lg rounded-2xl">
          <CardHeader>
              <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarFallback className="bg-primary/20 text-primary">
                  <UserIcon size={32} />
                  </AvatarFallback>
              </Avatar>
              <div>
                  <h3 className="text-2xl font-bold">Selamat Datang, {user?.profile?.displayName || 'Siswa'}!</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
              </div>
              </div>
          </CardHeader>
          <CardContent>
              <p>Ini adalah halaman dasbor Anda. Akses semua fitur akademik dan informasi penting di sini.</p>
          </CardContent>
          </Card>

          <JadwalPelajaran />
          <ERaporSiswa />
          <AbsensiSiswa />
          <PortofolioDigital />
      </main>
    </div>
  );
}

export default function SiswaPage() {
    return (
        <ProtectedRoute allowedRoles={['siswa', 'admin']}>
            <SiswaDashboard />
        </ProtectedRoute>
    )
}
