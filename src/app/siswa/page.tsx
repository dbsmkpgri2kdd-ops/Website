'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { LogOut, Sparkles, Fingerprint, MapPin, Calendar, RefreshCcw, UserCog, HeartPulse, User, Phone, ShieldCheck, GraduationCap, BookOpen, UserCheck, Smartphone, LayoutGrid } from 'lucide-react';
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

  const InfoRow = ({ icon: Icon, label, value, color }: { icon: any, label: string, value?: string, color?: string }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all group">
        <div className={cn("p-2.5 rounded-xl bg-white text-primary border border-slate-100 shadow-sm group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all", color)}>
            <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary transition-colors">{label}</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{value || '-'}</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8 pb-32 sm:pb-8 tech-mesh">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-10 md:mb-14">
        <div className="flex items-center gap-4">
            <div className="bg-primary text-white p-2.5 rounded-2xl shadow-2xl glow-primary">
                <Sparkles size={24} />
            </div>
            <div className='flex flex-col'>
                <h1 className="text-xl sm:text-3xl font-black font-headline text-slate-900 tracking-tighter uppercase leading-none">Siswa <span className='text-primary'>Portal.</span></h1>
                <span className='text-[9px] font-black uppercase tracking-[0.4em] text-primary opacity-60 mt-1'>Digital Identity Center</span>
            </div>
        </div>
        <Button onClick={handleLogout} variant="outline" className="rounded-2xl h-12 px-8 font-black text-[10px] uppercase tracking-widest border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
          <LogOut className="mr-2 h-4 w-4 opacity-40" />
          <span className="hidden sm:inline">Logout Sistem</span>
          <span className="sm:hidden">Keluar</span>
        </Button>
      </header>
      
      <main className="max-w-7xl mx-auto space-y-10 animate-reveal">
          {profile?.role === 'siswa' && !profile.lastSyncedAt && (
            <Alert className="bg-accent/10 border-accent/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 w-full relative z-10">
                <div className='flex items-center gap-6'>
                  <div className='p-4 bg-accent text-accent-foreground rounded-[1.5rem] animate-pulse shrink-0 shadow-xl'>
                    <RefreshCcw className="h-8 w-8" />
                  </div>
                  <div>
                    <AlertTitle className="text-xl font-black uppercase tracking-tighter text-slate-900 mb-1">Sinkronisasi Identitas Digital</AlertTitle>
                    <AlertDescription className="text-[11px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
                      Sistem sedang memverifikasi NIS <span className='text-primary'>{profile.nis}</span> di database pusat sekolah. Harap tunggu sebentar.
                    </AlertDescription>
                  </div>
                </div>
              </div>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 space-y-10">
                {/* KARTU IDENTITAS DIGITAL */}
                <Card className="border-slate-100 bg-white rounded-[3rem] overflow-hidden relative shadow-2xl group hover:border-primary/20 transition-all duration-700">
                    <div className='absolute top-0 left-0 w-full h-3 bg-primary shadow-lg'></div>
                    <CardHeader className="p-10 text-center sm:text-left space-y-8">
                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            <Avatar className="h-28 w-28 border-4 border-primary/10 shadow-2xl group-hover:scale-105 transition-transform duration-700">
                                <AvatarFallback className="bg-primary/5 text-primary text-5xl font-black">
                                    {profile?.displayName?.charAt(0) || 'S'}
                                </AvatarFallback>
                            </Avatar>
                            <div className='flex-1 min-w-0'>
                                <h3 className="text-3xl font-black font-headline tracking-tighter text-slate-900 uppercase leading-none truncate">{profile?.displayName || 'Siswa'}</h3>
                                <p className="text-primary font-black text-xs uppercase tracking-[0.3em] mt-3">{profile?.className || 'Belum Sinkron'}</p>
                                <div className='flex flex-wrap gap-2 mt-6 justify-center sm:justify-start'>
                                    <Badge variant="secondary" className='bg-emerald-500/10 text-emerald-700 border-none px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest'>STATUS AKTIF</Badge>
                                    <Badge variant="outline" className='border-accent/30 text-accent px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest'>SHIFT {profile?.session || 'PAGI'}</Badge>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-10 pb-10 space-y-8">
                        <div className='space-y-4'>
                            <p className='text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 opacity-40'>Identitas Utama</p>
                            <InfoRow icon={Fingerprint} label="Nomor Induk Siswa (NIS)" value={profile?.nis} />
                            <InfoRow icon={MapPin} label="Alamat Terdaftar" value={profile?.address} />
                            <InfoRow icon={Phone} label="Nomor Handphone" value={profile?.phone} />
                        </div>
                        
                        <div className="pt-6 border-t border-slate-100">
                            <p className='text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 opacity-40'>Personalia Akademik</p>
                            <div className="grid grid-cols-1 gap-4">
                                <InfoRow icon={UserCog} label="Wali Kelas" value={profile?.homeroomTeacher} />
                                <InfoRow icon={HeartPulse} label="Guru BK" value={profile?.bkTeacher} />
                                <InfoRow icon={UserCheck} label="Guru Wali" value={profile?.guardianTeacher} />
                                <InfoRow icon={ShieldCheck} label="Kesiswaan" value={profile?.studentAffairs} />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <p className='text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 opacity-40'>Kontak Orang Tua</p>
                            <div className="grid grid-cols-1 gap-4">
                                <InfoRow icon={User} label="Nama Orang Tua" value={profile?.parentName} />
                                <InfoRow icon={Phone} label="WA Orang Tua" value={profile?.parentPhone} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ABSENSI BIOMETRIK */}
                <BiometricAttendance />
            </div>

            <div className="lg:col-span-2 space-y-10">
                <Tabs defaultValue="overview" className="w-full">
                    <div className="overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                        <TabsList className="flex w-fit sm:grid sm:w-full grid-cols-4 h-16 bg-slate-50 p-1.5 rounded-[2rem] border border-slate-100 gap-2 shadow-inner">
                            <TabsTrigger value="overview" className="rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all px-10 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary border border-transparent data-[state=active]:border-slate-100">
                                <LayoutGrid className='mr-2 h-4 w-4' /> Dashboard
                            </TabsTrigger>
                            <TabsTrigger value="exams" className="rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all px-10 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary border border-transparent data-[state=active]:border-slate-100">
                                <Smartphone className='mr-2 h-4 w-4' /> ExamBro
                            </TabsTrigger>
                            <TabsTrigger value="academic" className="rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all px-10 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary border border-transparent data-[state=active]:border-slate-100">
                                <GraduationCap className='mr-2 h-4 w-4' /> Akademik
                            </TabsTrigger>
                            <TabsTrigger value="portfolio" className="rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all px-10 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary border border-transparent data-[state=active]:border-slate-100">
                                <BookOpen className='mr-2 h-4 w-4' /> Portofolio
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="space-y-10 md:space-y-16 animate-fade-in pt-4">
                        <QuickLinksGrid audience="siswa" title="Akses Cepat" description="Portal layanan mandiri dan aplikasi penunjang belajar harian Anda." />
                        <div className='grid sm:grid-cols-2 gap-10'>
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
      
      <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-100 text-center">
          <p className='text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 opacity-60'>
              &copy; 2025 SMKS PGRI 2 KEDONDONG • OFFICIAL PORTAL
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