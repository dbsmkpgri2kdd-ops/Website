'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { 
  LogOut, ShieldCheck, Sparkles, 
  GraduationCap, Bell, Home,
  User as UserIcon, MonitorCheck, ClipboardList, BookMarked
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
      toast({ title: 'Logout Berhasil', description: 'Sesi pengajar telah diakhiri.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Logout Gagal' });
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
                <div className='p-3 bg-primary text-white rounded-2xl shadow-xl glow-primary'>
                  <Sparkles size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Portal pengajar,</p>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight font-headline">Halo, Bapak/Ibu</h3>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full bg-slate-50">
                <Bell size={20} className="text-slate-600" />
              </Button>
            </div>

            <Card className="rounded-[2.5rem] bg-white border-2 border-slate-100 shadow-xl overflow-hidden">
              <CardContent className="p-8 flex items-center gap-6">
                <Avatar className="h-16 w-16 border-2 border-primary/10">
                  <AvatarFallback className="bg-primary/5 text-primary text-xl font-extrabold font-headline">{profile?.displayName?.charAt(0) || 'G'}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900 leading-tight font-headline">{profile?.displayName}</h4>
                  <div className='flex items-center gap-2 mt-1 text-primary'>
                    <ShieldCheck size={14} />
                    <span className='text-[10px] font-bold uppercase tracking-widest'>Status: pengajar aktif</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="rounded-[2rem] bg-primary text-white p-6 flex flex-col justify-between h-40 shadow-xl group hover:scale-[1.02] transition-all cursor-pointer" onClick={() => setActiveTab('absensi')}>
                <div className='p-3 bg-white/20 rounded-2xl w-fit'><ClipboardList size={24} /></div>
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-tight font-headline">Presensi</h4>
                  <p className="text-[10px] opacity-60 font-bold">Monitor siswa</p>
                </div>
              </Card>
              <Card className="rounded-[2rem] bg-accent text-accent-foreground p-6 flex flex-col justify-between h-40 shadow-xl group hover:scale-[1.02] transition-all cursor-pointer" onClick={() => setActiveTab('ujian')}>
                <div className='p-3 bg-black/5 rounded-2xl w-fit'><MonitorCheck size={24} /></div>
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-tight font-headline">ExamBro</h4>
                  <p className="text-[10px] opacity-60 font-bold">Pengawasan ujian</p>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="mb-4">
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
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-headline">Manajemen presensi</h2>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Kehadiran siswa real-time</p>
            </div>
            <ManajemenAbsensi />
          </div>
        );
      case 'ujian':
        return (
          <div className='space-y-6 animate-reveal pb-24'>
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-headline">ExamBro portal</h2>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Kontrol & proctoring ujian</p>
            </div>
            <ExamManager />
          </div>
        );
      case 'profil':
        return (
          <div className='space-y-6 animate-reveal pb-24'>
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-headline">Akademik & sistem</h2>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Panel kontrol pengajar</p>
            </div>
            
            <div className="space-y-6">
              <ERaporManager />
              <ManajemenPrakerin />
              <AchievementsManager />
              <PembinaanEskul />
              
              <Button onClick={handleLogout} variant="outline" className="w-full h-14 rounded-2xl border-red-100 text-red-500 hover:bg-red-50 font-bold text-xs uppercase tracking-widest mt-10 shadow-sm">
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

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 pb-safe z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-md mx-auto h-20 flex items-center justify-between">
          <NavItem id="home" icon={Home} label="Beranda" />
          <NavItem id="absensi" icon={ClipboardList} label="Presensi" />
          <NavItem id="ujian" icon={MonitorCheck} label="ExamBro" />
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
