'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { 
  LogOut, Sparkles, Fingerprint, MapPin, Phone, 
  ShieldCheck, GraduationCap, BookOpen, UserCheck, 
  Smartphone, LayoutGrid, UserCog, HeartPulse, RefreshCcw,
  Bell, Home, User as UserIcon, Search, Settings
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ExamBroPortal } from '@/components/siswa/exambro-portal';
import { BiometricAttendance } from '@/components/siswa/biometric-attendance';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type TabType = 'home' | 'ujian' | 'akademik' | 'profil';

function SiswaDashboard() {
  const { user, profile } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const NavItem = ({ id, icon: Icon, label }: { id: TabType, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex flex-col items-center justify-center flex-1 py-2 transition-all duration-300",
        activeTab === id ? "text-primary scale-110" : "text-slate-400"
      )}
    >
      <div className={cn(
        "p-1.5 rounded-xl transition-all",
        activeTab === id ? "bg-primary/10" : "bg-transparent"
      )}>
        <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 2} />
      </div>
      <span className={cn("text-[10px] font-bold mt-1", activeTab === id ? "opacity-100" : "opacity-60")}>{label}</span>
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6 animate-reveal pb-24">
            {/* Header Profil Ringkas */}
            <div className="flex items-center justify-between mb-8">
              <div className='flex items-center gap-4'>
                <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
                  <AvatarFallback className="bg-primary/5 text-primary text-xl font-black">
                    {profile?.displayName?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selamat Datang,</p>
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter leading-tight">{profile?.displayName || 'Siswa'}</h3>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full bg-slate-50 relative">
                <Bell size={20} className="text-slate-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white animate-pulse" />
              </Button>
            </div>

            {profile?.role === 'siswa' && !profile.lastSyncedAt && (
              <Alert className="bg-primary/5 border-primary/10 rounded-3xl">
                <RefreshCcw className="h-4 w-4 animate-spin text-primary" />
                <AlertTitle className="text-xs font-bold">Sinkronisasi data...</AlertTitle>
                <AlertDescription className="text-[10px] opacity-70">Menghubungkan ke server pusat.</AlertDescription>
              </Alert>
            )}

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              <BiometricAttendance />
              <Card className="rounded-[2rem] border-none shadow-xl bg-gradient-to-br from-primary to-blue-700 text-white p-6 flex flex-col justify-between h-full group hover:scale-[1.02] transition-all cursor-pointer" onClick={() => setActiveTab('ujian')}>
                <div className='p-3 bg-white/20 rounded-2xl w-fit shadow-inner'><Smartphone size={24} /></div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-tight">ExamBro</h4>
                  <p className="text-[10px] opacity-60 font-bold">Ujian Aman</p>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <AbsensiSiswa />
              <JadwalPelajaran />
            </div>
          </div>
        );
      case 'ujian':
        return <div className='animate-reveal pb-24'><ExamBroPortal /></div>;
      case 'akademik':
        return (
          <div className='space-y-6 animate-reveal pb-24'>
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Akademik</h2>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Layanan Hasil Belajar</p>
            </div>
            <ERaporSiswa />
            <PortofolioDigital />
          </div>
        );
      case 'profil':
        return (
          <div className='space-y-6 animate-reveal pb-24'>
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Profil Saya</h2>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Detail Identitas Digital</p>
            </div>
            
            <Card className="rounded-[2.5rem] border-slate-100 shadow-xl overflow-hidden bg-white border-2">
              <div className="h-24 bg-primary relative">
                <div className="absolute -bottom-10 left-8">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                    <AvatarFallback className="bg-slate-50 text-primary text-2xl font-black">
                      {profile?.displayName?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <CardContent className="pt-14 pb-8 px-8 space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{profile?.displayName}</h3>
                  <p className="text-sm font-bold text-primary">{profile?.className || 'Kelas Belum Set'}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <Fingerprint className="text-primary opacity-40" size={20} />
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nomor Induk Siswa</p>
                      <p className="text-sm font-bold">{profile?.nis || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <MapPin className="text-primary opacity-40" size={20} />
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alamat</p>
                      <p className="text-sm font-bold truncate">{profile?.address || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <UserCog className="text-primary opacity-40" size={20} />
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Wali Kelas</p>
                      <p className="text-sm font-bold">{profile?.homeroomTeacher || '-'}</p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleLogout} variant="outline" className="w-full h-12 rounded-2xl border-red-100 text-red-500 hover:bg-red-50 font-bold text-xs uppercase tracking-widest">
                  <LogOut className="mr-2 h-4 w-4" /> Keluar Sesi
                </Button>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1 px-6 pt-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-md mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Navigasi Bawah Gaya Android Native */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 pb-safe z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-md mx-auto h-20 flex items-center justify-between">
          <NavItem id="home" icon={Home} label="Beranda" />
          <NavItem id="ujian" icon={Smartphone} label="Ujian" />
          <NavItem id="akademik" icon={GraduationCap} label="Akademik" />
          <NavItem id="profil" icon={UserIcon} label="Profil" />
        </div>
      </nav>
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
