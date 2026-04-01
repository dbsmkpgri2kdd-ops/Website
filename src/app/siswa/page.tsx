'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { 
  LogOut, Sparkles, Fingerprint, MapPin, 
  ShieldCheck, GraduationCap, UserCheck, 
  Smartphone, LayoutGrid, UserCog, RefreshCcw,
  Bell, Home, User as UserIcon, Settings, BookMarked
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth } from '@/firebase';
import { JadwalPelajaran } from '@/components/shared/jadwal-pelajaran';
import { ERaporSiswa } from '@/components/siswa/e-rapor-siswa';
import { AbsensiSiswa } from '@/components/siswa/absensi-siswa';
import { PortofolioDigital } from '@/components/siswa/portofolio-digital';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExamBroPortal } from '@/components/siswa/exambro-portal';
import { BiometricAttendance } from '@/components/siswa/biometric-attendance';
import { cn } from '@/lib/utils';

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
            <div className="flex items-center justify-between mb-8">
              <div className='flex items-center gap-4'>
                <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
                  <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                    {profile?.displayName?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selamat datang,</p>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight font-headline">{profile?.displayName || 'Siswa'}</h3>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full bg-slate-50 relative">
                <Bell size={20} className="text-slate-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white animate-pulse" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className='contents'>
                <BiometricAttendance />
              </div>
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-primary to-blue-700 text-white p-6 flex flex-col justify-between h-48 group hover:scale-[1.02] transition-all cursor-pointer" onClick={() => setActiveTab('ujian')}>
                <div className='p-3 bg-white/20 rounded-2xl w-fit shadow-inner'><Smartphone size={24} /></div>
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-tight font-headline">ExamBro</h4>
                  <p className="text-[10px] opacity-60 font-bold">Sesi ujian aman</p>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="mb-2">
                <h4 className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-slate-400 font-headline">Aktivitas & jadwal</h4>
              </div>
              <AbsensiSiswa />
              <JadwalPelajaran />
            </div>
          </div>
        );
      case 'ujian':
        return (
          <div className='space-y-6 animate-reveal pb-24'>
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-headline">Portal ujian</h2>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Sistem pengawasan exambro</p>
            </div>
            <ExamBroPortal />
          </div>
        );
      case 'akademik':
        return (
          <div className='space-y-6 animate-reveal pb-24'>
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-headline">Layanan akademik</h2>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Hasil belajar & portofolio</p>
            </div>
            <ERaporSiswa />
            <PortofolioDigital />
          </div>
        );
      case 'profil':
        return (
          <div className='space-y-6 animate-reveal pb-24'>
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-headline">Profil saya</h2>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Identitas digital siswa</p>
            </div>
            
            <Card className="rounded-[2.5rem] border-slate-100 shadow-xl overflow-hidden bg-white border-2">
              <div className="h-24 bg-primary relative">
                <div className="absolute -bottom-10 left-8">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                    <AvatarFallback className="bg-slate-50 text-primary text-2xl font-extrabold font-headline">
                      {profile?.displayName?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <CardContent className="pt-14 pb-8 px-8 space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-headline">{profile?.displayName}</h3>
                  <p className="text-sm font-bold text-primary">{profile?.className || 'Kelas belum sinkron'}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <Fingerprint className="text-primary opacity-40" size={20} />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nomor induk siswa</p>
                      <p className="text-sm font-bold">{profile?.nis || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <MapPin className="text-primary opacity-40" size={20} />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Alamat terdaftar</p>
                      <p className="text-sm font-bold truncate max-w-[200px]">{profile?.address || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <UserCog className="text-primary opacity-40" size={20} />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Wali kelas</p>
                      <p className="text-sm font-bold">{profile?.homeroomTeacher || '-'}</p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleLogout} variant="outline" className="w-full h-12 rounded-2xl border-red-100 text-red-500 hover:bg-red-50 font-bold text-xs uppercase tracking-widest">
                  <LogOut className="mr-2 h-4 w-4" /> Keluar sesi
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
