'use client';

import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { 
  LogOut, LayoutDashboard, Settings, FileBox, Users2, 
  GraduationCap, Building2, Briefcase, Bell, Menu, X, 
  Newspaper, Calendar, Link as LinkIcon,
  PenSquare, ShieldAlert, 
  LoaderCircle, Mail, Award, Library, MessageSquare, Quote, 
  DatabaseZap, Palette, Layout, MousePointer2, BriefcaseIcon, Factory, SearchCode,
  UserPlus, ShieldCheck, ScanFace, Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import ProtectedRoute from '@/components/auth/protected-route';
import { useUser, useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

// Modul Managers
import { OverviewManager } from '@/components/admin/overview-manager';
import { NewsManager } from '@/components/admin/news-manager';
import { MajorsManager } from '@/components/admin/majors-manager';
import { ProfileManager } from '@/components/admin/profile-manager';
import { GalleryManager } from '@/components/admin/gallery-manager';
import { FacilitiesManager } from '@/components/admin/facilities-manager';
import { ApplicationsManager } from '@/components/admin/applications-manager';
import { AgendaManager } from '@/components/admin/agenda-manager';
import { LiteracyManager } from '@/components/admin/literacy-manager';
import { OsisManager } from '@/components/admin/osis-manager';
import { IndustryPartnersManager } from '@/components/admin/industry-partners-manager';
import { TeachersManager } from '@/components/admin/teachers-manager';
import { JobVacanciesManager } from '@/components/admin/job-vacancies-manager';
import { ManajemenPrakerin } from '@/components/shared/manajemen-prakerin';
import { UsersManager } from '@/components/admin/users-manager';
import { SystemSettingsManager } from '@/components/admin/system-settings-manager';
import { QuickLinksManager } from '@/components/admin/quick-links-manager';
import { ContactMessagesManager } from '@/components/admin/contact-messages-manager';
import { AchievementsManager } from '@/components/admin/achievements-manager';
import { ExtracurricularsManager } from '@/components/admin/extracurriculars-manager';
import { LibraryManager } from '@/components/admin/library-manager';
import { TeachingFactoryManager } from '@/components/admin/teaching-factory-manager';
import { LspManager } from '@/components/admin/lsp-manager';
import { GraduationStatusManager } from '@/components/admin/graduation-status-manager';
import { TestimonialsManager } from '@/components/admin/testimonials-manager';
import { AlumniManager } from '@/components/admin/alumni-manager';
import { GuestbookManager } from '@/components/admin/guestbook-manager';
import { DownloadManager } from '@/components/shared/download-manager';
import { TracerStudyManager } from '@/components/admin/tracer-study-manager';
import { DesignTemplateManager } from '@/components/admin/design-template-manager';
import { NavigationManager } from '@/components/admin/navigation-manager';
import { LayoutBuilderManager } from '@/components/admin/layout-builder-manager';
import { ExamManager } from '@/components/guru/exam-manager';
import { BiometricManager } from '@/components/admin/biometric-manager';

type AdminTab = 
  | 'overview' | 'school-profile' | 'majors' | 'teachers' | 'facilities' | 'gallery'
  | 'news' | 'agenda' | 'osis' | 'literacy' | 'schedule' | 'rapor' | 'attendance'
  | 'partners' | 'jobs' | 'prakerin' | 'ppdb' | 'users' | 'settings' | 'quick-links' | 'contact-messages'
  | 'achievements' | 'extracurriculars' | 'library' | 'tefa' | 'lsp' | 'graduation' | 'testimonials' | 'alumni' | 'guestbook' | 'downloads' | 'tracer' | 'appearance'
  | 'navigation' | 'layout-builder' | 'exams' | 'biometric-admin';

function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const isAdmin = user?.profile?.role === 'admin';
  const [activeTab, setActiveTab] = useState<AdminTab>(isAdmin ? 'overview' : 'users');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const navItems = [
    { label: 'Ringkasan', value: 'overview', icon: LayoutDashboard, group: 'Utama' },
    { label: 'Builder Beranda', value: 'layout-builder', icon: Layout, group: 'Editor Visual' },
    { label: 'Manajer Menu', value: 'navigation', icon: MousePointer2, group: 'Editor Visual' },
    { label: 'Tampilan Website', value: 'appearance', icon: Palette, group: 'Editor Visual' },
    
    { label: 'Ujian Online', value: 'exams', icon: ShieldCheck, group: 'Akademik' },
    { label: 'Biometrik Siswa', value: 'biometric-admin', icon: ScanFace, group: 'Akademik' },
    { label: 'Pesan Masuk', value: 'contact-messages', icon: Mail, group: 'Konten' },
    { label: 'Berita Sekolah', value: 'news', icon: Newspaper, group: 'Konten' },
    { label: 'Agenda & Acara', value: 'agenda', icon: Calendar, group: 'Konten' },
    { label: 'Osis Corner', value: 'osis', icon: Bell, group: 'Konten' },
    { label: 'Pojok Literasi', value: 'literacy', icon: PenSquare, group: 'Konten' },
    { label: 'Galeri Media', value: 'gallery', icon: FileBox, group: 'Konten' },
    { label: 'Testimoni Alumni', value: 'testimonials', icon: Quote, group: 'Konten' },
    { label: 'Buku Tamu', value: 'guestbook', icon: MessageSquare, group: 'Konten' },

    { label: 'Staf & Guru', value: 'teachers', icon: Users2, group: 'Akademik' },
    { label: 'Daftar Jurusan', value: 'majors', icon: GraduationCap, group: 'Akademik' },
    { label: 'Prestasi Siswa', value: 'achievements', icon: Award, group: 'Akademik' },
    { label: 'Perpustakaan', value: 'library', icon: Library, group: 'Akademik' },
    
    { label: 'PPDB Online', value: 'ppdb', icon: UserPlus, group: 'Administrasi' },
    { label: 'Kerja Sama Mitra', value: 'partners', icon: BriefcaseIcon, group: 'Administrasi' },
    { label: 'Bursa Kerja', value: 'jobs', icon: Briefcase, group: 'Administrasi' },
    { label: 'Teaching Factory', value: 'tefa', icon: Factory, group: 'Administrasi' },
    { label: 'Tracer Study', value: 'tracer', icon: SearchCode, group: 'Administrasi' },

    { label: 'Manajemen Pengguna', value: 'users', icon: ShieldAlert, group: 'Sistem' },
    { label: 'Identitas Sekolah', value: 'school-profile', icon: Building2, group: 'Sistem' },
    { label: 'Tautan Cepat', value: 'quick-links', icon: LinkIcon, group: 'Sistem' },
    { label: 'Konfigurasi Sistem', value: 'settings', icon: Settings, group: 'Sistem' },
  ];

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className='flex flex-col items-center gap-4'>
            <LoaderCircle className="animate-spin text-primary h-10 w-10" />
            <p className='text-xs font-black uppercase tracking-widest text-muted-foreground'>Otorisasi hPanel...</p>
        </div>
      </div>
    );
  }

  const groupedNav = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewManager />;
      case 'layout-builder': return <LayoutBuilderManager />;
      case 'navigation': return <NavigationManager />;
      case 'appearance': return <DesignTemplateManager />;
      case 'exams': return <ExamManager />;
      case 'biometric-admin': return <BiometricManager />;
      case 'contact-messages': return <ContactMessagesManager />;
      case 'school-profile': return <ProfileManager />;
      case 'teachers': return <TeachersManager />;
      case 'majors': return <MajorsManager />;
      case 'facilities': return <FacilitiesManager />;
      case 'gallery': return <GalleryManager />;
      case 'quick-links': return <QuickLinksManager />;
      case 'news': return <NewsManager />;
      case 'agenda': return <AgendaManager />;
      case 'osis': return <OsisManager />;
      case 'literacy': return <LiteracyManager />;
      case 'partners': return <IndustryPartnersManager />;
      case 'jobs': return <JobVacanciesManager />;
      case 'prakerin': return <ManajemenPrakerin />;
      case 'ppdb': return <ApplicationsManager />;
      case 'users': return <UsersManager />;
      case 'settings': return <SystemSettingsManager />;
      case 'achievements': return <AchievementsManager />;
      case 'extracurriculars': return <ExtracurricularsManager />;
      case 'library': return <LibraryManager />;
      case 'tefa': return <TeachingFactoryManager />;
      case 'lsp': return <LspManager />;
      case 'graduation': return <GraduationStatusManager />;
      case 'testimonials': return <TestimonialsManager />;
      case 'alumni': return <AlumniManager />;
      case 'guestbook': return <GuestbookManager />;
      case 'downloads': return <DownloadManager />;
      case 'tracer': return <TracerStudyManager />;
      default: return <OverviewManager />;
    }
  };

  const NavButton = ({ item }: { item: typeof navItems[0] }) => (
    <button
      onClick={() => { setActiveTab(item.value as AdminTab); setIsSidebarOpen(false); }}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all duration-200 group",
        activeTab === item.value 
          ? "bg-primary text-white shadow-xl glow-primary" 
          : "text-muted-foreground hover:bg-muted/50 hover:text-primary"
      )}
    >
      <item.icon size={16} className={cn("transition-all shrink-0", activeTab === item.value ? "opacity-100" : "opacity-40 group-hover:opacity-100")} />
      <span className="truncate">{item.label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-white flex overflow-hidden tech-mesh">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-100 z-[70] transition-all duration-300 flex flex-col shadow-2xl",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-xl shadow-xl glow-primary">
              <DatabaseZap size={18} />
            </div>
            <div className='flex flex-col'>
                <span className="font-black text-sm tracking-tighter text-slate-900 uppercase">hPanel <span className='text-primary'>v7.5</span></span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden rounded-xl h-9 w-9 bg-slate-50" onClick={() => setIsSidebarOpen(false)}>
            <X size={18} />
          </Button>
        </div>

        <ScrollArea className="flex-grow px-3 py-6">
          <div className="space-y-8 pb-10">
            {Object.entries(groupedNav).map(([group, items]) => (
              <div key={group} className="space-y-1">
                <h3 className="px-4 text-[9px] font-black uppercase tracking-[0.4em] text-primary mb-3 opacity-40">{group}</h3>
                {items.map(item => <NavButton key={item.value} item={item} />)}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 mb-3 shadow-sm">
            <Avatar className="h-9 w-9 border-2 border-primary/10">
              <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black uppercase">{user?.profile?.displayName?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tight">{user?.profile?.displayName || user?.email?.split('@')[0]}</p>
              <div className='flex items-center gap-1.5'>
                <div className='w-1 h-1 rounded-full bg-emerald-500'></div>
                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Active Admin</p>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-black text-[10px] uppercase tracking-widest transition-all border border-transparent hover:border-destructive/10">
            <LogOut size={14} className="opacity-60" /> Keluar Sistem
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden rounded-xl h-10 w-10 bg-slate-50 border border-slate-100" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </Button>
            <div className='flex items-center gap-3'>
                <div className='h-8 w-1 bg-primary rounded-full hidden sm:block'></div>
                <h1 className="font-black text-[10px] uppercase tracking-[0.3em] text-muted-foreground hidden sm:block">
                  Sistem Hub / <span className='text-primary'>{navItems.find(i => i.value === activeTab)?.label || 'Ringkasan'}</span>
                </h1>
            </div>
          </div>
          
          <div className='flex items-center gap-3'>
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 relative border border-slate-100 bg-white shadow-sm hover:bg-slate-50 transition-all">
                <Bell size={18} className="text-slate-600" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-white shadow-lg animate-pulse" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <div className='animate-reveal'>
                {renderContent()}
            </div>
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