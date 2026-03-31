
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
      toast({ title: 'SESI BERAKHIR', description: 'Kembali ke halaman utama...' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'LOGOUT GAGAL' });
    }
  };

  const navItems = [
    { label: 'RINGKASAN', value: 'overview', icon: LayoutDashboard, group: 'UTAMA' },
    { label: 'BUILDER BERANDA', value: 'layout-builder', icon: Layout, group: 'EDITOR VISUAL' },
    { label: 'MANAJER MENU', value: 'navigation', icon: MousePointer2, group: 'EDITOR VISUAL' },
    { label: 'TAMPILAN', value: 'appearance', icon: Palette, group: 'EDITOR VISUAL' },
    
    { label: 'UJIAN ONLINE', value: 'exams', icon: ShieldCheck, group: 'AKADEMIK' },
    { label: 'PESAN MASUK', value: 'contact-messages', icon: Mail, group: 'KONTEN' },
    { label: 'BERITA', value: 'news', icon: Newspaper, group: 'KONTEN' },
    { label: 'AGENDA', value: 'agenda', icon: Calendar, group: 'KONTEN' },
    { label: 'OSIS CORNER', value: 'osis', icon: Bell, group: 'KONTEN' },
    { label: 'LITERASI', value: 'literacy', icon: PenSquare, group: 'KONTEN' },
    { label: 'GALERI', value: 'gallery', icon: FileBox, group: 'KONTEN' },
    { label: 'TESTIMONI', value: 'testimonials', icon: Quote, group: 'KONTEN' },
    { label: 'BUKU TAMU', value: 'guestbook', icon: MessageSquare, group: 'KONTEN' },

    { label: 'STAF & GURU', value: 'teachers', icon: Users2, group: 'AKADEMIK' },
    { label: 'JURUSAN', value: 'majors', icon: GraduationCap, group: 'AKADEMIK' },
    { label: 'PRESTASI', value: 'achievements', icon: Award, group: 'AKADEMIK' },
    { label: 'PERPUSTAKAAN', value: 'library', icon: Library, group: 'AKADEMIK' },
    
    { label: 'PPDB ONLINE', value: 'ppdb', icon: UserPlus, group: 'ADMINISTRASI' },
    { label: 'KERJA SAMA', value: 'partners', icon: BriefcaseIcon, group: 'ADMINISTRASI' },
    { label: 'BURSA KERJA', value: 'jobs', icon: Briefcase, group: 'ADMINISTRASI' },
    { label: 'TEACHING FACTORY', value: 'tefa', icon: Factory, group: 'ADMINISTRASI' },
    { label: 'TRACER STUDY', value: 'tracer', icon: SearchCode, group: 'ADMINISTRASI' },

    { label: 'PENGGUNA', value: 'users', icon: ShieldAlert, group: 'SISTEM' },
    { label: 'IDENTITAS', value: 'school-profile', icon: Building2, group: 'SISTEM' },
    { label: 'TAUTAN CEPAT', value: 'quick-links', icon: LinkIcon, group: 'SISTEM' },
    { label: 'KONFIGURASI', value: 'settings', icon: Settings, group: 'SISTEM' },
  ];

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className='flex flex-col items-center gap-4'>
            <LoaderCircle className="animate-spin text-primary h-10 w-10" />
            <p className='text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground'>Sinkronisasi Dasbor...</p>
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
        "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-widest transition-all duration-300 group uppercase",
        activeTab === item.value 
          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
      )}
    >
      <item.icon size={16} className={cn("transition-all", activeTab === item.value ? "opacity-100" : "opacity-40 group-hover:opacity-100")} />
      {item.label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-screen w-64 bg-card border-r border-white/5 z-[70] transition-all duration-500 flex flex-col shadow-2xl",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-lg">
              <DatabaseZap size={20} />
            </div>
            <span className="font-bold text-lg tracking-tighter uppercase italic text-white">hPANEL</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden rounded-lg" onClick={() => setIsSidebarOpen(false)}>
            <X size={18} />
          </Button>
        </div>

        <ScrollArea className="flex-grow p-4">
          <div className="space-y-8 pb-10">
            {Object.entries(groupedNav).map(([group, items]) => (
              <div key={group} className="space-y-1">
                <h3 className="px-4 text-[8px] font-bold uppercase tracking-[0.4em] text-muted-foreground/50 mb-2">{group}</h3>
                {items.map(item => <NavButton key={item.value} item={item} />)}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 mb-4">
            <Avatar className="h-9 w-9 border border-white/10">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{user?.profile?.displayName?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-bold truncate uppercase tracking-tight">{user?.profile?.displayName || user?.email?.split('@')[0]}</p>
              <p className="text-[8px] font-medium text-muted-foreground uppercase tracking-widest">{user?.profile?.role || 'User'}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start h-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-bold text-[9px] tracking-widest uppercase">
            <LogOut size={14} className="mr-3 opacity-40" /> KELUAR SISTEM
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden rounded-lg h-9 w-9 bg-white/5" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </Button>
            <h1 className="font-bold text-[10px] text-muted-foreground uppercase tracking-[0.4em] hidden sm:block">
              SISTEM / {navItems.find(i => i.value === activeTab)?.label || 'DASBOR'}
            </h1>
          </div>
          
          <div className='flex items-center gap-2 sm:gap-4'>
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 sm:h-10 sm:w-10 relative border border-white/5 bg-white/5">
                <Bell size={18} />
                <span className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 w-1.5 h-1.5 bg-primary rounded-full" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 bg-slate-50/5 dark:bg-transparent">
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
