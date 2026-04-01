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
    <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all group">
        <div className={cn("p-2 rounded-xl bg-white text-primary border border-slate-100 shadow-sm group-hover:bg-primary group-hover:text-white transition-all", color)}>
            <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-400">{label}</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{value || '-'}</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8 pb-32 sm:pb-8 tech-mesh">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-xl shadow-xl glow-primary">
                <Sparkles size={20} />
            </div>
            <div className='flex flex-col'>
                <h1 className="text-lg sm:text-xl font-extrabold font-headline text-slate-900 tracking-tight leading-none">Siswa Portal</h1>
                <span className='text-[10px] font-bold text-primary opacity-60 mt-1'>Digital Identity Hub</span>
            </div>
        </div>
        <Button onClick={handleLogout} variant="outline" className="rounded-xl h-10 px-4 font-bold text-xs border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
          <LogOut className="mr-2 h-4 w-4 opacity-40" />
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </header>
      
      <main className="max-w-7xl mx-auto space-y-6 animate-reveal">
          {profile?.role === 'siswa' && !profile.lastSyncedAt && (
            <Alert className="bg-primary/5 border-primary/10 p-5 rounded-3xl shadow-sm">
              <div className='flex items-center gap-4'>
                <div className='p-2.5 bg-primary text-white rounded-xl shrink-0'>
                  <RefreshCcw className="h-5 w-5 animate-spin" />
                </div>
                <div>
                  <AlertTitle className="text-sm font-bold text-slate-900">Sinkronisasi Identitas Digital</AlertTitle>
                  <AlertDescription className="text-[11px] font-medium text-slate-500 leading-relaxed">
                    Sistem sedang memverifikasi data Anda di server pusat. Harap tunggu sebentar.
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <div className="grid lg:grid-cols-12 gap-6">
            {/* KOLOM KIRI: IDENTITAS & BIOMETRIK */}
            <div className="lg:col-span-4 space-y-6">
                <Card className="border-slate-100 bg-white rounded-[2rem] overflow-hidden relative shadow-xl border-2">
                    <div className='absolute top-0 left-0 w-full h-1.5 bg-primary'></div>
                    <CardHeader className="p-6 text-center sm:text-left space-y-4">
                        <div className="flex flex-col sm:flex-row items-center gap-5">
                            <Avatar className="h-20 w-20 border-4 border-primary/10 shadow-md">
                                <AvatarFallback className="bg-primary/5 text-primary text-3xl font-extrabold">
                                    {profile?.displayName?.charAt(0) || 'S'}
                                </AvatarFallback>
                            </Avatar>
                            <div className='flex-1 min-w-0'>
                                <h3 className="text-lg font-extrabold font-headline tracking-tight text-slate-900 leading-tight truncate">{profile?.displayName || 'Siswa'}</h3>
                                <p className="text-primary font-bold text-[11px] mt-1">{profile?.className || 'Belum Sinkron'}</p>
                                <div className='flex flex-wrap gap-2 mt-3 justify-center sm:justify-start'>
                                    <Badge variant="secondary" className='bg-emerald-500/10 text-emerald-700 border-none px-2.5 py-0.5 rounded-lg text-[10px] font-bold'>Status Aktif</Badge>
                                    <Badge variant="outline" className='border-primary/20 text-primary px-2.5 py-0.5 rounded-lg text-[10px] font-bold'>Shift {profile?.session || 'Pagi'}</Badge>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 space-y-5">
                        <div className='space-y-2.5'>
                            <p className='text-[10px] font-bold text-slate-400 px-1'>Identitas Utama</p>
                            <InfoRow icon={Fingerprint} label="Nomor Induk Siswa" value={profile?.nis} />
                            <InfoRow icon={MapPin} label="Alamat Terdaftar" value={profile?.address} />
                            <InfoRow icon={Phone} label="Nomor Handphone" value={profile?.phone} />
                        </div>
                        
                        <div className="pt-5 border-t border-slate-100">
                            <p className='text-[10px] font-bold text-slate-400 px-1 mb-3'>Personalia Akademik</p>
                            <div className="grid grid-cols-1 gap-2.5">
                                <InfoRow icon={UserCog} label="Wali Kelas" value={profile?.homeroomTeacher} />
                                <InfoRow icon={HeartPulse} label="Guru BK" value={profile?.bkTeacher} />
                                <InfoRow icon={UserCheck} label="Guru Wali" value={profile?.guardianTeacher} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <BiometricAttendance />
            </div>

            {/* KOLOM KANAN: TABS & KONTEN UTAMA */}
            <div className="lg:col-span-8 space-y-6">
                <Tabs defaultValue="overview" className="w-full">
                    <div className="overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                        <TabsList className="flex w-fit sm:grid sm:w-full grid-cols-4 h-12 bg-slate-50 p-1 rounded-2xl border border-slate-100 gap-1 shadow-inner">
                            <TabsTrigger value="overview" className="rounded-xl font-bold text-[11px] transition-all px-6 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary">
                                <LayoutGrid className='mr-2 h-3.5 w-3.5' /> Dashboard
                            </TabsTrigger>
                            <TabsTrigger value="exams" className="rounded-xl font-bold text-[11px] transition-all px-6 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary">
                                <Smartphone className='mr-2 h-3.5 w-3.5' /> ExamBro
                            </TabsTrigger>
                            <TabsTrigger value="academic" className="rounded-xl font-bold text-[11px] transition-all px-6 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary">
                                <GraduationCap className='mr-2 h-3.5 w-3.5' /> Akademik
                            </TabsTrigger>
                            <TabsTrigger value="portfolio" className="rounded-xl font-bold text-[11px] transition-all px-6 sm:px-0 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary">
                                <BookOpen className='mr-2 h-3.5 w-3.5' /> Karya
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="space-y-6 pt-2">
                        <QuickLinksGrid audience="siswa" title="Akses Cepat" description="Layanan penunjang belajar harian Anda." />
                        <div className='grid sm:grid-cols-2 gap-6'>
                            <AbsensiSiswa />
                            <JadwalPelajaran />
                        </div>
                    </TabsContent>

                    <TabsContent value="exams" className="pt-2">
                        <ExamBroPortal />
                    </TabsContent>

                    <TabsContent value="academic" className="pt-2">
                        <ERaporSiswa />
                    </TabsContent>

                    <TabsContent value="portfolio" className="pt-2">
                        <PortofolioDigital />
                    </TabsContent>
                </Tabs>
            </div>
          </div>
      </main>
      
      <footer className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-100 text-center opacity-40">
          <p className='text-[10px] font-bold text-slate-400'>
              &copy; 2025 SMKS PGRI 2 Kedondong • Portal Siswa Resmi
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
