'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { 
  LogOut, Sparkles, Fingerprint, MapPin, 
  ShieldCheck, GraduationCap, 
  Smartphone, Bell, Home, User as UserIcon, BookMarked,
  LayoutGrid, ChevronRight, UserCog, History, Key, Settings2,
  FolderKanban
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
import { ExamBroPortal } from '@/components/siswa/exambro-portal';
import { BiometricAttendance } from '@/components/siswa/biometric-attendance';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type TabType = 'home' | 'ujian' | 'akademik' | 'profil';

function SiswaDashboard() {
  const { user, profile } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [mounted, setMounted] = useState(false);
  const [isAbsenOpen, setIsAbsenOpen] = useState(false);

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
      onClick={() => {
        setActiveTab(id);
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className={cn(
        "flex flex-col items-center justify-center flex-1 py-2 transition-all duration-300",
        activeTab === id ? "text-primary scale-110" : "text-slate-400"
      )}
    >
      <div className={cn(
        "p-2 rounded-2xl transition-all",
        activeTab === id ? "bg-primary/10" : "bg-transparent"
      )}>
        <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} />
      </div>
      <span className={cn("text-[10px] font-bold mt-1", activeTab === id ? "opacity-100" : "opacity-60")}>{label}</span>
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-8 animate-reveal pb-24">
            <header className="flex items-center justify-between mb-2 px-2">
              <div className='flex items-center gap-4'>
                <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
                  <AvatarFallback className="bg-primary/5 text-primary text-xl font-extrabold font-headline">
                    {profile?.displayName?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[11px] font-bold text-slate-400">Selamat datang,</p>
                  <div className='flex items-center gap-2'>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight font-headline">{profile?.displayName || 'Siswa'}</h3>
                    <Badge variant="outline" className='text-[8px] font-black uppercase tracking-widest px-1.5 h-4 border-primary/20 text-primary'>Sesi {profile?.session || 'Pagi'}</Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full bg-white border border-slate-100 relative shadow-sm h-11 w-11">
                <Bell size={20} className="text-slate-600" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-white animate-pulse" />
              </Button>
            </header>

            {/* Quick Action Grid - Small Items for PWA */}
            <div className="grid grid-cols-4 gap-4 px-2">
              <button onClick={() => setIsAbsenOpen(true)} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 hover:brightness-110">
                  <Fingerprint size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Absen</span>
              </button>
              
              <button onClick={() => setActiveTab('ujian')} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg transition-all active:scale-90 hover:brightness-110">
                  <Smartphone size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Ujian</span>
              </button>

              <button onClick={() => setActiveTab('akademik')} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 hover:brightness-110">
                  <BookMarked size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Rapor</span>
              </button>

              <button onClick={() => setActiveTab('akademik')} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 hover:brightness-110">
                  <FolderKanban size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Karya</span>
              </button>
            </div>

            <Dialog open={isAbsenOpen} onOpenChange={setIsAbsenOpen}>
              <DialogContent className="sm:max-w-md rounded-[3rem] p-0 overflow-hidden border-none bg-transparent">
                <BiometricAttendance />
              </DialogContent>
            </Dialog>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 font-headline">Aktivitas & jadwal</h4>
                <Button variant="ghost" size="sm" className='text-[10px] font-bold text-primary h-auto p-0 hover:bg-transparent uppercase tracking-widest'>Lihat semua</Button>
              </div>
              <AbsensiSiswa />
              <JadwalPelajaran />
            </div>
          </div>
        );
      case 'ujian':
        return (
          <div className='space-y-6 animate-reveal pb-24'>
            <header className="mb-8 px-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter font-headline uppercase italic">Portal <span className='text-primary not-italic'>ujian.</span></h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Sistem pengawasan exambro v5.5</p>
            </header>
            <ExamBroPortal />
          </div>
        );
      case 'akademik':
        return (
          <div className='space-y-6 animate-reveal pb-24'>
            <header className="mb-8 px-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter font-headline uppercase italic">Layanan <span className='text-primary not-italic'>akademik.</span></h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Hasil belajar & portofolio digital</p>
            </header>
            <ERaporSiswa />
            <PortofolioDigital />
          </div>
        );
      case 'profil':
        return (
          <div className='space-y-6 animate-reveal pb-24'>
            <header className="mb-8 px-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter font-headline uppercase italic">Profil <span className='text-primary not-italic'>saya.</span></h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Identitas digital terdaftar</p>
            </header>
            
            <Card className="rounded-[3rem] border-slate-100 shadow-2xl overflow-hidden bg-white border-2">
              <div className="h-28 bg-primary relative">
                <div className="absolute -bottom-12 left-8">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                    <AvatarFallback className="bg-slate-50 text-primary text-3xl font-black font-headline">
                      {profile?.displayName?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <CardContent className="pt-16 pb-10 px-8 space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter font-headline uppercase">{profile?.displayName}</h3>
                  <div className='flex items-center gap-2 mt-1.5'>
                    <div className='w-2 h-2 rounded-full bg-emerald-500'></div>
                    <p className="text-[13px] font-bold text-slate-500 uppercase tracking-tight">{profile?.className || 'Kelas belum sinkron'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: Fingerprint, label: 'Nomor induk siswa', value: profile?.nis || '-' },
                    { icon: MapPin, label: 'Alamat terdaftar', value: profile?.address || '-' },
                    { icon: UserCog, label: 'Wali kelas', value: profile?.homeroomTeacher || '-' },
                    { icon: History, label: 'Sinkronisasi terakhir', value: profile?.lastSyncedAt ? 'Aktif' : 'Belum sinkron' }
                  ].map((info, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all active:scale-[0.98]">
                      <div className="flex items-center gap-4">
                        <div className='p-2 bg-white rounded-xl border border-slate-100 text-primary opacity-40 group-hover:opacity-100 transition-opacity'>
                            <info.icon size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{info.label}</p>
                          <p className="text-[13px] font-bold text-slate-700 truncate max-w-[180px] uppercase tracking-tight">{info.value}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className='text-slate-300' />
                    </div>
                  ))}
                </div>

                <Button onClick={handleLogout} variant="outline" className="w-full h-16 rounded-2xl border-red-100 text-red-500 hover:bg-red-50 font-black text-xs uppercase tracking-widest mt-4">
                  <LogOut className="mr-2 h-4 w-4" /> Keluar sesi mandiri
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

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 pb-safe z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
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
