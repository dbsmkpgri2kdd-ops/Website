'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { LogOut, User as UserIcon, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';
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
import { QuickLinksGrid } from '@/components/shared/quick-links-grid';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

function SiswaDashboard() {
  const { user, profile } = useUser();
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
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <h1 className="text-3xl font-black font-headline text-primary tracking-tighter uppercase">Student <span className='text-foreground'>Portal</span></h1>
        <Button onClick={handleLogout} variant="outline" className="rounded-xl glass-premium border-primary/20 hover:bg-primary/10">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>
      <main className="max-w-7xl mx-auto space-y-12 animate-fade-in">
          {/* SETUP ALERT FOR OWNER */}
          {profile?.role === 'siswa' && (
            <Alert variant="destructive" className="glass-premium border-primary/20 p-8 rounded-[2rem] shadow-2xl overflow-hidden relative group">
              <div className='absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700'></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full relative z-10">
                <div className='flex items-start gap-4'>
                  <div className='p-3 bg-primary text-background rounded-2xl animate-glow'>
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <AlertTitle className="text-xl font-black text-primary uppercase tracking-tight mb-1 flex items-center gap-2">
                      <Sparkles size={18} /> Apakah Anda Pemilik Website?
                    </AlertTitle>
                    <AlertDescription className="text-sm text-muted-foreground font-medium max-w-xl">
                      Sistem mendeteksi Anda masuk sebagai Siswa. Jika Anda adalah Administrator, silakan pindah ke halaman Admin untuk mengaktifkan hak akses penuh.
                    </AlertDescription>
                  </div>
                </div>
                <Button onClick={() => router.push('/admin')} className="font-black h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                  Panel Admin <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </Alert>
          )}

          <Card className="glass-premium border-white/5 rounded-[2.5rem] overflow-hidden relative">
          <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-50'></div>
          <CardHeader>
              <div className="flex flex-col sm:flex-row items-center gap-8 py-4">
              <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-[0_0_30px_hsla(var(--primary)/0.2)]">
                  <AvatarFallback className="bg-primary/10 text-primary text-4xl font-black">
                    {user?.profile?.displayName?.charAt(0) || 'S'}
                  </AvatarFallback>
              </Avatar>
              <div className='text-center sm:text-left'>
                  <h3 className="text-3xl md:text-4xl font-black font-headline tracking-tighter mb-1">Selamat Datang, {user?.profile?.displayName || 'Siswa'}!</h3>
                  <p className="text-muted-foreground font-medium text-lg">{user?.email}</p>
                  <div className='flex flex-wrap justify-center sm:justify-start gap-2 mt-4'>
                    <Badge className='bg-primary/20 text-primary border-none px-4 py-1 rounded-lg uppercase text-[10px] font-black tracking-widest'>AKTIF</Badge>
                    <Badge className='bg-secondary/20 text-secondary border-none px-4 py-1 rounded-lg uppercase text-[10px] font-black tracking-widest'>VERIFIED</Badge>
                  </div>
              </div>
              </div>
          </CardHeader>
          </Card>

          <QuickLinksGrid audience="siswa" title="Aplikasi Siswa" description="Akses cepat ke platform belajar dan portal akademik Anda." />

          <div className='grid lg:grid-cols-2 gap-12'>
            <div className='space-y-12'>
              <AbsensiSiswa />
              <JadwalPelajaran />
            </div>
            <div className='space-y-12'>
              <ERaporSiswa />
              <PortofolioDigital />
            </div>
          </div>
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
