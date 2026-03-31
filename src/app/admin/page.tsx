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
  UserPlus, ShieldCheck
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

type AdminTab = 
  | 'overview' | 'school-profile' | 'majors' | 'teachers' | 'facilities' | 'gallery'
  | 'news' | 'agenda' | 'osis' | 'literacy' | 'schedule' | 'rapor' | 'attendance'
  | 'partners' | 'jobs' | 'prakerin' | 'ppdb' | 'users' | 'settings' | 'quick-links' | 'contact-messages'
  | 'achievements' | 'extracurriculars' | 'library' | 'tefa' | 'lsp' | 'graduation' | 'testimonials' | 'alumni' | 'guestbook' | 'downloads' | 'tracer' | 'appearance'
  | 'navigation' | 'layout-builder' | 'exams';

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
    { label: 'Builder beranda', value: 'layout-builder', icon: Layout, group: 'Editor visual' },
    { label: 'Manajer menu', value: 'navigation', icon: MousePointer2, group: 'Editor visual' },
    { label: 'Tampilan website', value: 'appearance', icon: Palette, group: 'Editor visual' },
    
    { label: 'Ujian online', value: 'exams', icon: ShieldCheck, group: 'Akademik' },
    { label: 'Pesan masuk', value: 'contact-messages', icon: Mail, group: 'Konten' },
    { label: 'Berita sekolah', value: 'news', icon: Newspaper, group: 'Konten' },
    { label: 'Agenda & acara', value: 'agenda', icon: Calendar, group: 'Konten' },
    { label: 'Osis corner', value: 'osis', icon: Bell, group: 'Konten' },
    { label: 'Pojok literasi', value: 'literacy', icon: PenSquare, group: 'Konten' },
    { label: 'Galeri media', value: 'gallery', icon: FileBox, group: 'Konten' },
    { label: 'Testimoni alumni', value: 'testimonials', icon: Quote, group: 'Konten' },
    { label: 'Buku tamu', value: 'guestbook', icon: MessageSquare, group: 'Konten' },

    { label: 'Staf & guru', value: 'teachers', icon: Users2, group: 'Akademik' },
    { label: 'Daftar jurusan', value: 'majors', icon: GraduationCap, group: 'Akademik' },
    { label: 'Prestasi siswa', value: 'achievements', icon: Award, group: 'Akademik' },
    { label: 'Perpustakaan', value: 'library', icon: Library, group: 'Akademik' },
    
    { label: 'PPDB online', value: 'ppdb', icon: UserPlus, group: 'Administrasi' },
    { label: 'Kerja sama mitra', value: 'partners', icon: BriefcaseIcon, group: 'Administrasi' },
    { label: 'Bursa kerja', value: 'jobs', icon: Briefcase, group: 'Administrasi' },
    { label: 'Teaching factory', value: 'tefa', icon: Factory, group: 'Administrasi' },
    { label: 'Tracer study', value: 'tracer', icon: SearchCode, group: 'Administrasi' },

    { label: 'Manajemen pengguna', value: 'users', icon: ShieldAlert, group: 'Sistem' },
    { label: 'Identitas sekolah', value: 'school-profile', icon: Building2, group: 'Sistem' },
    { label: 'Tautan cepat', value: 'quick-links', icon: LinkIcon, group: 'Sistem' },
    { label: 'Konfigurasi sistem', value: 'settings', icon: Settings, group: 'Sistem' },
  ];

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className='flex flex-col items-center gap-4'>
            <LoaderCircle className="animate-spin text-primary h-10 w-10" />
            <p className='text-xs font-semibold text-muted-foreground'>Menyiapkan dasbor...</p>
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
        "w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 group",
        activeTab === item.value 
          ? "bg-primary text-white shadow-md shadow-primary/20" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <item.icon size={16} className={cn("transition-all shrink-0", activeTab === item.value ? "opacity-100" : "opacity-60 group-hover:opacity-100")} />
      <span className="truncate">{item.label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-screen w-60 bg-card border-r border-border z-[70] transition-all duration-300 flex flex-col shadow-sm",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-1.5 rounded-lg">
              <DatabaseZap size={18} />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">hPanel v7.5</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden rounded-lg h-8 w-8" onClick={() => setIsSidebarOpen(false)}>
            <X size={16} />
          </Button>
        </div>

        <ScrollArea className="flex-grow px-3 py-4">
          <div className="space-y-5 pb-10">
            {Object.entries(groupedNav).map(([group, items]) => (
              <div key={group} className="space-y-1">
                <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-1.5">{group}</h3>
                {items.map(item => <NavButton key={item.value} item={item} />)}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-card border border-border mb-3 shadow-sm">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{user?.profile?.displayName?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-[11px] font-bold text-foreground truncate">{user?.profile?.displayName || user?.email?.split('@')[0]}</p>
              <p className="text-[9px] font-semibold text-muted-foreground capitalize">{user?.profile?.role || 'User'}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start h-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-bold text-[11px]">
            <LogOut size={14} className="mr-2.5 opacity-60" /> Keluar sistem
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden rounded-lg h-9 w-9 bg-muted" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </Button>
            <h1 className="font-semibold text-sm text-muted-foreground tracking-tight hidden sm:block">
              Sistem / {navItems.find(i => i.value === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>
          
          <div className='flex items-center gap-3'>
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-lg h-10 w-10 relative border border-border bg-card">
                <Bell size={18} className="text-muted-foreground" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-card" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
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