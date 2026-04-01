'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { 
  LogOut, Sparkles, Fingerprint, MapPin, Phone, 
  ShieldCheck, GraduationCap, BookOpen, UserCheck, 
  Smartphone, LayoutGrid, UserCog, HeartPulse, RefreshCcw
} from 'lucide-react';
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
import { BiometricAttendance } from '@/components/siswa/biometric-attendance';
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
      toast({ title: 'Sesi berakhir', description: 'Kembali ke halaman utama.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Logout gagal' });
    }
  };

  const InfoRow = ({ icon: Icon, label, value, color }: { icon: any, label: string, value?: string, color?: string }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all group">
        <div className={cn("p-2.5 rounded-xl bg-white text-primary border border-slate-100 shadow-sm group-hover:bg-primary group-hover:text-white transition-all", color)}>
            <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{value || '-'}</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8 pb-32 sm:pb-8 tech-mesh">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
            <div className="bg-primary text-white p-2.5 rounded-2xl shadow-xl glow-primary">
                <Sparkles size={24} />
            </div>
            <div className='flex flex-col'>
                <h1 className="text-xl sm:text-2xl font-extrabold font-headline text-slate-900 tracking-tight leading-none">Siswa portal</h1>
                <span className='text-[9px] font-bold uppercase tracking-[0.2em] text-primary opacity-60 mt-1'>Digital identity hub</span>
            </div>
        </div>
        <Button onClick={handleLogout} variant="outline" className="rounded-xl h-11 px-6 font-bold text-xs border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
          <LogOut className="mr-2 h-4 w-4 opacity-40" />
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </header>
      
      <main className="max-w-7xl mx-auto space-y-8 animate-reveal">
          {profile?.role === 'siswa' && !profile.lastSyncedAt && (
            <Alert className="bg-accent/10 border-accent/20 p-6 rounded-3xl shadow-lg animate-pulse">
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-accent text-accent-foreground rounded-2xl shrink-0'>
                  <RefreshCcw className="h-6 w-6" />
                </div>
                <div>
                  <AlertTitle className="text-sm font-bold text-slate-900">Sinkronisasi identitas digital</AlertTitle>
                  <AlertDescription className="text-[10px] font-medium text-slate-600 leading-relaxed">
                    Sistem sedang memverifikasi data Anda di server pusat. Harap tunggu sebentar.
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
                {/* KARTU IDENTITAS DIGITAL */}
                <Card className="border-slate-100 bg-white rounded-[2.5rem] overflow-hidden relative shadow-xl border-2">
                    <div className='absolute top-0 left-0 w-full h-2 bg-primary'></div>
                    <CardHeader className="p-8 text-center sm:text-left space-y-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-lg">
                                <AvatarFallback className="bg-primary/5 text-primary text-4xl font-extrabold">
                                    {profile?.displayName?.charAt(0) || 'S'}
                                </AvatarFallback>
                            </Avatar>
                            <div className='flex-1 min-w-0'>
                                <h3 className="text-xl font-extrabold font-headline tracking-tight text-slate-900 leading-none truncate">{profile?.displayName || 'Siswa'}</h3>
                                <p className="text-primary font-bold text-[10px] uppercase tracking-widest mt-2">{profile?.className || 'Belum sinkron'}</p>
                                <div className='flex flex-wrap gap-2 mt-4 justify-center sm:justify-start'>
                                    <Badge variant="secondary" className='bg-emerald-500/10 text-emerald-700 border-none px-3 py-1 rounded-lg text-[9px] font-bold uppercase'>Status aktif</Badge>
                                    <Badge variant="outline" className='border-accent/30 text-accent px-3 py-1 rounded-lg text-[9px] font-bold uppercase'>Shift {profile?.session || 'Pagi'}</Badge>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-6">
                        <div className='space-y-3'>
                            <p className='text-[9px] font-bold uppercase tracking-[0.3em] text-primary opacity-40'>Identitas utama</p>
                            <InfoRow icon={Fingerprint} label="Nomor induk siswa" value={profile?.nis} />
                            <InfoRow icon={MapPin} label="Alamat terdaftar" value={profile?.address} />
                            <InfoRow icon={Phone} label="Nomor handphone" value={profile?.phone} />
                        </div>
                        
                        <div className="pt-6 border-t border-slate-100">
                            <p className='text-[9px] font-bold uppercase tracking-[0.3em] text-primary opacity-40 mb-4'>Personalia akademik</p>
                            <div className="grid grid-cols-1 gap-3">
                                <InfoRow icon={UserCog} label="Wali kelas" value={profile?.homeroomTeacher} />
                                <InfoRow icon={HeartPulse} label="Guru BK" value={profile?.bkTeacher} />
                                <InfoRow icon={UserCheck} label="Guru wali" value={profile?.guardianTeacher} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ABSENSI BIOMETRIK */}
                <BiometricAttendance />
            </div>

            <div className="lg:col-span-2 space-y-8">
                <Tabs defaultValue="overview" className="w-full">
                    <div className="overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                        <TabsList className="flex w-fit sm:grid sm:w-full grid-cols-4 h-14 bg-slate-50 p-1 rounded-2xl border border-slate-100 gap-1 shadow-inner">
                            <TabsTrigger value="overview" className="rounded-xl font-bold text-[10px] uppercase transition-all px-6 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary">
                                <LayoutGrid className='mr-2 h-4 w-4' /> Dashboard
                            </TabsTrigger>
                            <TabsTrigger value="exams" className="rounded-xl font-bold text-[10px] uppercase transition-all px-6 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary">
                                <Smartphone className='mr-2 h-4 w-4' /> ExamBro
                            </TabsTrigger>
                            <TabsTrigger value="academic" className="rounded-xl font-bold text-[10px] uppercase transition-all px-6 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary">
                                <GraduationCap className='mr-2 h-4 w-4' /> Akademik
                            </TabsTrigger>
                            <TabsTrigger value="portfolio" className="rounded-xl font-bold text-[10px] uppercase transition-all px-6 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary">
                                <BookOpen className='mr-2 h-4 w-4' /> Karya
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="space-y-8 pt-4">
                        <QuickLinksGrid audience="siswa" title="Akses cepat" description="Layanan penunjang belajar harian Anda." />
                        <div className='grid sm:grid-cols-2 gap-8'>
                            <AbsensiSiswa />
                            <JadwalPelajaran />
                        </div>
                    </TabsContent>

                    <TabsContent value="exams" className="pt-4">
                        <ExamBroPortal />
                    </TabsContent>

                    <TabsContent value="academic" className="pt-4">
                        <ERaporSiswa />
                    </TabsContent>

                    <TabsContent value="portfolio" className="pt-4">
                        <PortofolioDigital />
                    </TabsContent>
                </Tabs>
            </div>
          </div>
      </main>
      
      <footer className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-100 text-center opacity-40">
          <p className='text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400'>
              &copy; 2025 SMKS PGRI 2 Kedondong • Portal siswa resmi
          </p>
      </footer>
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