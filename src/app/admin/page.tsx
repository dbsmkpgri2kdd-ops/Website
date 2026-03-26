'use client';

import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { 
  LogOut, User as UserIcon, LayoutDashboard, Settings, FileBox, Users2, 
  GraduationCap, Building2, Briefcase, Database, Bell, Search, Menu, X, 
  ChevronRight, Laptop, Newspaper, Calendar, 
  PenSquare, CalendarClock, UserCog, UserPlus, ShieldAlert, ArrowRightLeft, DatabaseZap
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import ProtectedRoute from '@/components/auth/protected-route';
import { useUser, useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Modul Managers
import { OverviewManager } from '@/components/admin/overview-manager';
import { NewsManager } from '@/components/admin/news-manager';
import { MajorsManager } from '@/components/admin/majors-manager';
import { ProfileManager } from '@/components/admin/profile-manager';
import { GalleryManager } from '@/components/admin/gallery-manager';
import { FacilitiesManager } from '@/components/admin/facilities-manager';
import { ApplicationsManager } from '@/components/admin/applications-manager';
import { AgendaManager } from '@/components/admin/agenda-manager';
import { ScheduleManager } from '@/components/admin/schedule-manager';
import { LiteracyManager } from '@/components/admin/literacy-manager';
import { OsisManager } from '@/components/admin/osis-manager';
import { IndustryPartnersManager } from '@/components/admin/industry-partners-manager';
import { TeachersManager } from '@/components/admin/teachers-manager';
import { JobVacanciesManager } from '@/components/admin/job-vacancies-manager';
import { ManajemenPrakerin } from '@/components/shared/manajemen-prakerin';
import { UsersManager } from '@/components/admin/users-manager';
import { ERaporManager } from '@/components/shared/e-rapor-manager';
import { ManajemenAbsensi } from '@/components/guru/manajemen-absensi';
import { SystemSettingsManager } from '@/components/admin/system-settings-manager';

type AdminTab = 
  | 'overview' | 'school-profile' | 'majors' | 'teachers' | 'facilities' | 'gallery'
  | 'news' | 'agenda' | 'osis' | 'literacy' | 'schedule' | 'rapor' | 'attendance'
  | 'partners' | 'jobs' | 'prakerin' | 'ppdb' | 'users' | 'settings';

function AdminDashboard() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Logout Gagal' });
    }
  };

  const navItems = [
    { label: 'Ikhtisar', value: 'overview', icon: LayoutDashboard, group: 'Utama' },
    { label: 'Profil Sekolah', value: 'school-profile', icon: Building2, group: 'Master Data' },
    { label: 'Tenaga Pendidik', value: 'teachers', icon: Users2, group: 'Master Data' },
    { label: 'Jurusan', value: 'majors', icon: GraduationCap, group: 'Master Data' },
    { label: 'Fasilitas', value: 'facilities', icon: Database, group: 'Master Data' },
    { label: 'Galeri Media', value: 'gallery', icon: FileBox, group: 'Master Data' },
    { label: 'Berita', value: 'news', icon: Newspaper, group: 'Konten' },
    { label: 'Agenda', value: 'agenda', icon: Calendar, group: 'Konten' },
    { label: 'OSIS Corner', value: 'osis', icon: Bell, group: 'Konten' },
    { label: 'Literasi', value: 'literacy', icon: PenSquare, group: 'Konten' },
    { label: 'Jadwal', value: 'schedule', icon: CalendarClock, group: 'Akademik' },
    { label: 'E-Rapor', value: 'rapor', icon: GraduationCap, group: 'Akademik' },
    { label: 'Absensi', value: 'attendance', icon: UserCog, group: 'Akademik' },
    { label: 'Mitra Industri', value: 'partners', icon: Briefcase, group: 'Hubin' },
    { label: 'BKK Lowongan', value: 'jobs', icon: Laptop, group: 'Hubin' },
    { label: 'Prakerin/PKL', value: 'prakerin', icon: ArrowRightLeft, group: 'Hubin' },
    { label: 'Pendaftar PPDB', value: 'ppdb', icon: UserPlus, group: 'Administrasi' },
    { label: 'User Role', value: 'users', icon: ShieldAlert, group: 'Sistem' },
    { label: 'Konfigurasi Web', value: 'settings', icon: Settings, group: 'Sistem' },
  ];

  const groupedNav = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewManager />;
      case 'school-profile': return <ProfileManager />;
      case 'teachers': return <TeachersManager />;
      case 'majors': return <MajorsManager />;
      case 'facilities': return <FacilitiesManager />;
      case 'gallery': return <GalleryManager />;
      case 'news': return <NewsManager />;
      case 'agenda': return <AgendaManager />;
      case 'osis': return <OsisManager />;
      case 'literacy': return <LiteracyManager />;
      case 'schedule': return <ScheduleManager />;
      case 'rapor': return <ERaporManager />;
      case 'attendance': return <ManajemenAbsensi />;
      case 'partners': return <IndustryPartnersManager />;
      case 'jobs': return <JobVacanciesManager />;
      case 'prakerin': return <ManajemenPrakerin />;
      case 'ppdb': return <ApplicationsManager />;
      case 'users': return <UsersManager />;
      case 'settings': return <SystemSettingsManager />;
      default: return <OverviewManager />;
    }
  };

  const NavButton = ({ item }: { item: typeof navItems[0] }) => (
    <button
      onClick={() => { setActiveTab(item.value as AdminTab); setIsSidebarOpen(false); }}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group",
        activeTab === item.value 
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <item.icon size={18} className={cn(activeTab === item.value ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
      {item.label}
      {activeTab === item.value && <ChevronRight size={14} className="ml-auto" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-screen w-72 bg-card border-r z-[70] transition-transform duration-300 flex flex-col shadow-2xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-1.5 rounded-lg shadow-lg">
              <DatabaseZap size={20} />
            </div>
            <span className="font-bold text-xl font-headline tracking-tight text-primary">hPanel <span className='text-foreground font-normal'>v2.0</span></span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </Button>
        </div>

        <ScrollArea className="flex-grow p-4">
          <div className="space-y-6">
            {Object.entries(groupedNav).map(([group, items]) => (
              <div key={group} className="space-y-1">
                <h3 className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">{group}</h3>
                {items.map(item => <NavButton key={item.value} item={item} />)}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/20 shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-primary/5 mb-4">
            <Avatar className="h-10 w-10 border-2 border-primary/10">
              <AvatarFallback className="bg-primary/5 text-primary"><UserIcon size={20} /></AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">{user?.profile?.displayName || user?.email}</p>
              <Badge variant="secondary" className="text-[9px] h-4 py-0 font-bold uppercase">Administrator</Badge>
            </div>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5">
            <LogOut size={18} className="mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 border-b bg-background/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} className="text-primary" />
            </Button>
            <h1 className="font-bold text-base md:text-lg text-foreground/90 truncate">
              {navItems.find(i => i.value === activeTab)?.label || 'Dasbor'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/10">
          <div className="max-w-6xl mx-auto space-y-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
        </ProtectedRoute>
    )
}
