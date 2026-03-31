'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { LogOut, User as UserIcon, ShieldAlert, ArrowRight, Sparkles, Fingerprint, MapPin, Venus, Mars, Calendar, CreditCard, RefreshCcw } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExamBroPortal } from '@/components/siswa/exambro-portal';
import { cn } from '@/lib/utils';

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
        title: 'Sesi berakhir',
        description: 'Kembali ke halaman utama.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout gagal',
      });
    }
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: any, label: string, value?: string }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/20 transition-all group">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
            <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-60">{label}</p>
            <p className="text-xs font-bold text-foreground mt-0.5 truncate">{value || '-'}</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 pb-32 sm:pb-8 tech-mesh">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8 sm:mb-12">
        <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-xl">
                <Sparkles size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-headline tracking-tight">Siswa <span className='text-primary'>Portal</span></h1>
        </div>
        <Button onClick={handleLogout} variant="outline" className="rounded-xl h-10 px-4 font-bold text-xs border-border bg-card">
          <LogOut className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Keluar sistem</span>
          <span className="sm:hidden">Keluar</span>
        </Button>
      </header>
      
      <main className="max-w-7xl mx-auto space-y-8 animate-reveal">
          {profile?.role === 'siswa' && !profile.nisn && (
            <Alert className="bg-amber-500/10 border-amber-500/20 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full relative z-10">
                <div className='flex items-start gap-4'>
                  <div className='p-3 bg-amber-500 text-white rounded-2xl animate-pulse shrink-0'>
                    <RefreshCcw className="h-6 w-6" />
                  </div>
                  <div>
                    <AlertTitle className="text-lg font-bold text-amber-600 tracking-tight mb-1">Menunggu sinkronisasi data</AlertTitle>
                    <AlertDescription className="text-xs font-medium text-muted-foreground leading-relaxed">
                      Sistem sedang menunggu validasi database pusat untuk memuat biodata lengkap Anda berdasarkan NIS {profile.nis}.
                    </AlertDescription>
                  </div>
                </div>
              </div>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* KARTU IDENTITAS DIGITAL */}
            <Card className="lg:col-span-1 border-border/60 bg-card rounded-[2.5rem] overflow-hidden relative shadow-sm group">
                <div className='absolute top-0 left-0 w-full h-2 bg-primary'></div>
                <CardHeader className="p-8 text-center sm:text-left space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-sm group-hover:scale-105 transition-transform duration-500">
                            <AvatarFallback className="bg-primary/5 text-primary text-4xl font-bold italic">
                                {profile?.displayName?.charAt(0) || 'S'}
                            </AvatarFallback>
                        </Avatar>
                        <div className='flex-1 min-w-0'>
                            <h3 className="text-2xl font-bold font-headline tracking-tight text-foreground truncate">{profile?.displayName || 'Siswa'}</h3>
                            <p className="text-primary font-bold text-xs uppercase tracking-widest mt-1">{profile?.className || 'Belum sinkron'}</p>
                            <div className='flex gap-2 mt-4'>
                                <Badge variant="secondary" className='bg-emerald-500/10 text-emerald-600 border-none px-3 py-1 rounded-lg text-[10px] font-bold'>Aktif</Badge>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-3">
                    <InfoRow icon={Fingerprint} label="Nomor Induk Siswa (NIS)" value={profile?.nis} />
                    <InfoRow icon={CreditCard} label="Nomor Induk Nasional (NISN)" value={profile?.nisn} />
                    <div className="grid grid-cols-2 gap-3">
                        <InfoRow icon={profile?.gender === 'Perempuan' ? Venus : Mars} label="Gender" value={profile?.gender} />
                        <InfoRow icon={Calendar} label="Kelahiran" value={profile?.birthPlace ? `${profile.birthPlace}, ${profile.birthDate}` : '-'} />
                    </div>
                    <InfoRow icon={MapPin} label="Alamat terdaftar" value={profile?.address} />
                </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-8">
                <Tabs defaultValue="overview" className="w-full">
                    <div className="overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                        <TabsList className="flex w-fit sm:grid sm:w-full grid-cols-4 h-14 bg-muted/50 p-1 rounded-2xl border border-border/50 gap-1">
                            <TabsTrigger value="overview" className="rounded-xl font-bold text-xs transition-all px-8 sm:px-0 data-[state=active]:bg-card data-[state=active]:shadow-sm">Dashboard</TabsTrigger>
                            <TabsTrigger value="exams" className="rounded-xl font-bold text-xs transition-all px-8 sm:px-0 data-[state=active]:bg-card data-[state=active]:shadow-sm">Ujian online</TabsTrigger>
                            <TabsTrigger value="academic" className="rounded-xl font-bold text-xs transition-all px-8 sm:px-0 data-[state=active]:bg-card data-[state=active]:shadow-sm">Akademik</TabsTrigger>
                            <TabsTrigger value="portfolio" className="rounded-xl font-bold text-xs transition-all px-8 sm:px-0 data-[state=active]:bg-card data-[state=active]:shadow-sm">Karya digital</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="space-y-8 animate-fade-in pt-4">
                        <QuickLinksGrid audience="siswa" title="Akses cepat" description="Portal layanan mandiri dan aplikasi penunjang belajar siswa." />
                        <div className='grid sm:grid-cols-2 gap-8'>
                            <AbsensiSiswa />
                            <JadwalPelajaran />
                        </div>
                    </TabsContent>

                    <TabsContent value="exams" className="animate-fade-in pt-4">
                        <ExamBroPortal />
                    </TabsContent>

                    <TabsContent value="academic" className="animate-fade-in pt-4">
                        <ERaporSiswa />
                    </TabsContent>

                    <TabsContent value="portfolio" className="animate-fade-in pt-4">
                        <PortofolioDigital />
                    </TabsContent>
                </Tabs>
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