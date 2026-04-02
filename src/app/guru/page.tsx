'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { 
  LogOut, ShieldCheck, Sparkles, 
  GraduationCap, Bell, Home,
  User as UserIcon, MonitorCheck, ClipboardList, BookMarked,
  ChevronRight, Users, Settings2, ShieldAlert, MonitorPlay, UserCheck, Briefcase
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth } from '@/firebase';
import { PembinaanEskul } from '@/components/guru/pembinaan-ekskul';
import { JadwalPelajaran } from '@/components/shared/jadwal-pelajaran';
import { DownloadManager } from '@/components/shared/download-manager';
import { ManajemenPrakerin } from '@/components/shared/manajemen-prakerin';
import { AchievementsManager } from '@/components/admin/achievements-manager';
import { ERaporManager } from '@/components/shared/e-rapor-manager';
import { ManajemenAbsensi } from '@/components/guru/manajemen-absensi';
import { ExamManager } from '@/components/guru/exam-manager';
import { cn } from '@/lib/utils';

type TabType = 'home' | 'absensi' | 'ujian' | 'profil';

function GuruDashboard() {
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
      toast({ title: 'Logout berhasil', description: 'Sesi pengajar telah diakhiri.' });
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
                <div className='p-3 bg-primary text-white rounded-2xl shadow-xl glow-primary'>
                  <Sparkles size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Portal pengajar,</p>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight font-headline">Halo, Bapak/Ibu</h3>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full bg-white border border-slate-100 h-11 w-11 shadow-sm">
                <Bell size={20} className="text-slate-600" />
              </Button>
            </header>

            <Card className="android-card p-6 flex items-center gap-5">
              <Avatar className="h-14 w-14 border-2 border-primary/10">
                <AvatarFallback className="bg-primary/5 text-primary text-lg font-extrabold font-headline">{profile?.displayName?.charAt(0) || 'G'}</AvatarFallback>
              </Avatar>
              <div className='flex-1 overflow-hidden'>
                <h4 className="text-md font-extrabold text-slate-900 leading-tight font-headline truncate">{profile?.displayName}</h4>
                <div className='flex items-center gap-2 mt-1 text-primary'>
                  <ShieldCheck size={12} />
                  <span className='text-[9px] font-black tracking-widest uppercase'>Status: Pengajar aktif</span>
                </div>
              </div>
            </Card>

            {/* Guru Quick Actions Grid */}
            <div className="grid grid-cols-4 gap-4 px-2">
              <button onClick={() => setActiveTab('absensi')} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 hover:brightness-110">
                  <UserCheck size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Absen</span>
              </button>
              
              <button onClick={() => setActiveTab('ujian')} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg transition-all active:scale-90 hover:brightness-110">
                  <MonitorPlay size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Monitor</span>
              </button>

              <button onClick={() => setActiveTab('profil')} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 hover:brightness-110">
                  <BookMarked size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Rapor</span>
              </button>

              <button onClick={() => setActiveTab('profil')} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 hover:brightness-110">
                  <Briefcase size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Prakerin</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-slate-400 font-headline">Administrasi & jadwal</h4>
              </div>
              <JadwalPelajaran />
              <DownloadManager />
            </div>
          </div>
        );
      case 'absensi':
        return (
          <div className='space-y-6 animate-reveal pb-24'>
            <div className="mb-8 px-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter font-headline uppercase italic">Input <span className='text-primary not-italic'>absensi.</span></h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Pemantauan kehadiran siswa real-time</p>
            </div>
            <ManajemenAbsensi />
          </div>
        );
      case 'ujian':
        return (
          <div className='space-y-6 animate-reveal pb-24'>
            <div className="mb-8 px-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter font-headline uppercase italic">ExamBro <span className='text-primary not-italic'>portal.</span></h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Kontrol keamanan & proctoring ujian</p>
            </div>
            <ExamManager />
          </div>
        );
      case 'profil':
        return (
          <div className='space-y-6 animate-reveal pb-24'>
            <div className="mb-8 px-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter font-headline uppercase italic">Akademik <span className='text-primary not-italic'>center.</span></h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Panel kontrol administrasi pengajar</p>
            </div>
            
            <div className="space-y-8">
              {[
                { icon: BookMarked, label: 'E-Rapor digital', component: ERaporManager },
                { icon: Users, label: 'Manajemen prakerin', component: ManajemenPrakerin },
                { icon: Sparkles, label: 'Prestasi siswa', component: AchievementsManager },
                { icon: Settings2, label: 'Pembinaan ekskul', component: PembinaanEskul }
              ].map((mod, idx) => (
                <div key={idx} className="space-y-4">
                  <div className='flex items-center gap-3 px-2 mb-2'>
                    <mod.icon size={16} className='text-primary opacity-40' />
                    <h4 className='text-[11px] font-black uppercase tracking-widest text-slate-400'>{mod.label}</h4>
                  </div>
                  <mod.component />
                </div>
              ))}
              
              <Button onClick={handleLogout} variant="outline" className="w-full h-16 rounded-2xl border-red-100 text-red-500 hover:bg-red-50 font-black text-xs uppercase tracking-widest mt-10">
                <LogOut className="mr-2 h-4 w-4" /> Keluar sesi guru
              </Button>
            </div>
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
          <NavItem id="absensi" icon={ClipboardList} label="Absensi" />
          <NavItem id="ujian" icon={MonitorCheck} label="Ujian" />
          <NavItem id="profil" icon={BookMarked} label="Akademik" />
        </div>
      </nav>
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
