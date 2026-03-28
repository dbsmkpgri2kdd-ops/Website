
"use client";

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import HomeSection from '@/components/sections/home';
import { type NewsArticle, SCHOOL_DATA_ID, type School, type LiteracyArticle, type OsisPost, type NavLink } from '@/lib/data';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import BottomNav from '@/components/layout/bottom-nav';
import { LoaderCircle } from 'lucide-react';
import { AIAssistant } from '@/components/ai/ai-assistant';

const SectionLoader = () => (
  <div className="flex items-center justify-center h-[80vh] bg-background">
    <div className='flex flex-col items-center gap-4'>
        <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
        <p className='text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground'>Syncing School Data...</p>
    </div>
  </div>
);

// Performance Optimization: Dynamic imports
const ProfileSection = dynamic(() => import('@/components/sections/profile'), { loading: () => <SectionLoader />, ssr: true });
const NewsSection = dynamic(() => import('@/components/sections/news'), { loading: () => <SectionLoader />, ssr: false });
const PpdbSection = dynamic(() => import('@/components/sections/ppdb'), { loading: () => <SectionLoader />, ssr: false });
const ContactSection = dynamic(() => import('@/components/sections/contact'), { loading: () => <SectionLoader />, ssr: false });
const MajorsSection = dynamic(() => import('@/components/sections/majors'), { loading: () => <SectionLoader />, ssr: false });
const FacilitiesSection = dynamic(() => import('@/components/sections/facilities'), { loading: () => <SectionLoader />, ssr: false });
const GallerySection = dynamic(() => import('@/components/sections/gallery'), { loading: () => <SectionLoader />, ssr: false });
const AchievementsSection = dynamic(() => import('@/components/sections/achievements'), { loading: () => <SectionLoader />, ssr: false });
const NewsDetailSection = dynamic(() => import('@/components/sections/news-detail'), { loading: () => <SectionLoader />, ssr: false });
const TestimonialsSection = dynamic(() => import('@/components/sections/testimonials'), { loading: () => <SectionLoader />, ssr: false });
const ExtracurricularsSection = dynamic(() => import('@/components/sections/extracurriculars'), { loading: () => <SectionLoader />, ssr: false });
const AgendaSection = dynamic(() => import('@/components/sections/agenda'), { loading: () => <SectionLoader />, ssr: false });
const DownloadsSection = dynamic(() => import('@/components/sections/downloads'), { loading: () => <SectionLoader />, ssr: false });
const ScheduleSection = dynamic(() => import('@/components/shared/schedule-section'), { loading: () => <SectionLoader />, ssr: false });
const LibrarySection = dynamic(() => import('@/components/sections/library'), { loading: () => <SectionLoader />, ssr: false });
const LiteracySection = dynamic(() => import('@/components/sections/literacy-section'), { loading: () => <SectionLoader />, ssr: false });
const LiteracyDetailSection = dynamic(() => import('@/components/sections/literacy-detail-section'), { loading: () => <SectionLoader />, ssr: false });
const OsisCornerSection = dynamic(() => import('@/components/sections/osis-corner'), { loading: () => <SectionLoader />, ssr: false });
const OsisCornerDetailSection = dynamic(() => import('@/components/sections/osis-corner-detail'), { loading: () => <SectionLoader />, ssr: false });
const IndustryPartnersSection = dynamic(() => import('@/components/sections/industry-partners'), { loading: () => <SectionLoader />, ssr: false });
const BkkSection = dynamic(() => import('@/components/sections/bkk'), { loading: () => <SectionLoader />, ssr: false });
const TeachingFactorySection = dynamic(() => import('@/components/sections/teaching-factory'), { loading: () => <SectionLoader />, ssr: false });
const LspSection = dynamic(() => import('@/components/sections/lsp'), { loading: () => <SectionLoader />, ssr: false });
const TracerStudySection = dynamic(() => import('@/components/sections/tracer-study'), { loading: () => <SectionLoader />, ssr: false });
const CheckGraduationSection = dynamic(() => import('@/components/sections/check-graduation'), { loading: () => <SectionLoader />, ssr: false });
const TeachersSection = dynamic(() => import('@/components/sections/teachers'), { loading: () => <SectionLoader />, ssr: false });
const PlaceholderSection = dynamic(() => import('@/components/sections/placeholder-section'), { loading: () => <SectionLoader />, ssr: false });
const AlumniSection = dynamic(() => import('@/components/sections/alumni'), { loading: () => <SectionLoader />, ssr: false });
const GuestbookSection = dynamic(() => import('@/components/sections/guestbook'), { loading: () => <SectionLoader />, ssr: false });
const PrakerinSection = dynamic(() => import('@/components/sections/prakerin'), { loading: () => <SectionLoader />, ssr: false });
const ShowcaseSection = dynamic(() => import('@/components/sections/showcase'), { loading: () => <SectionLoader />, ssr: false });

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NavLink>('home');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedLiteracyArticleId, setSelectedLiteracyArticleId] = useState<string | null>(null);
  const [selectedOsisPostId, setSelectedOsisPostId] = useState<string | null>(null);

  const firestore = useFirestore();
  const { user } = useUser();
  const isAdmin = user?.profile?.role === 'admin';
  
  const schoolDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'schools', SCHOOL_DATA_ID);
  }, [firestore]);
  const { data: schoolData, isLoading: isSchoolDataLoading } = useDoc<School>(schoolDocRef);
  
  const selectedArticleRef = useMemoFirebase(() => {
    if (!firestore || !selectedArticleId) return null;
    return doc(firestore, `schools/${SCHOOL_DATA_ID}/newsArticles`, selectedArticleId);
  }, [firestore, selectedArticleId]);
  const { data: selectedArticle } = useDoc<NewsArticle>(selectedArticleRef);

  const selectedLiteracyRef = useMemoFirebase(() => {
    if (!firestore || !selectedLiteracyArticleId) return null;
    return doc(firestore, `schools/${SCHOOL_DATA_ID}/literacyArticles`, selectedLiteracyArticleId);
  }, [firestore, selectedLiteracyArticleId]);
  const { data: selectedLiteracyArticle } = useDoc<LiteracyArticle>(selectedLiteracyRef);
  
  const selectedOsisRef = useMemoFirebase(() => {
    if (!firestore || !selectedOsisPostId) return null;
    return doc(firestore, `schools/${SCHOOL_DATA_ID}/osisPosts`, selectedOsisPostId);
  }, [firestore, selectedOsisPostId]);
  const { data: selectedOsisPost } = useDoc<OsisPost>(selectedOsisRef);

  const handleSetTab = (tab: NavLink) => {
    setActiveTab(tab);
    setSelectedArticleId(null);
    setSelectedLiteracyArticleId(null);
    setSelectedOsisPostId(null);
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }

  const handleSelectArticle = (articleId: string) => {
    setSelectedArticleId(articleId);
    setActiveTab('berita-pengumuman');
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }

  const handleBackToNews = () => {
    setSelectedArticleId(null);
  }

  const handleSelectLiteracyArticle = (articleId: string) => {
    setSelectedLiteracyArticleId(articleId);
    setActiveTab('pojok-literasi');
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }

  const handleBackToLiteracy = () => {
    setSelectedLiteracyArticleId(null);
  }
  
  const handleSelectOsisPost = (postId: string) => {
    setSelectedOsisPostId(postId);
    setActiveTab('osis-corner');
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }

  const handleBackToOsisCorner = () => {
    setSelectedOsisPostId(null);
  }

  const renderSection = () => {
    if (schoolData?.isMaintenanceMode && !isAdmin) {
        return (
            <PlaceholderSection 
                title="Sistem Dalam Pemeliharaan" 
                description="Kami sedang meningkatkan performa sistem untuk memberikan pengalaman digital yang lebih baik bagi seluruh civitas akademika." 
            />
        );
    }

    if (selectedArticleId && selectedArticle) {
      return <NewsDetailSection article={selectedArticle} onBack={handleBackToNews} />;
    }
    if (selectedLiteracyArticleId && selectedLiteracyArticle) {
      return <LiteracyDetailSection article={selectedLiteracyArticle} onBack={handleBackToLiteracy} />;
    }
    if (selectedOsisPostId && selectedOsisPost) {
      return <OsisCornerDetailSection post={selectedOsisPost} onBack={handleBackToOsisCorner} />;
    }

    switch (activeTab) {
      case 'home':
        return <HomeSection setActiveTab={handleSetTab} onSelectArticle={handleSelectArticle} />;
      case 'profil-sejarah':
        return <ProfileSection schoolData={schoolData} isSchoolDataLoading={isSchoolDataLoading}/>;
      case 'fasilitas':
        return <FacilitiesSection />;
      case 'staf-guru':
        return <TeachersSection />;
      case 'jurusan-kompetensi':
        return <MajorsSection />;
      case 'prestasi-siswa':
        return <AchievementsSection />;
      case 'ekstrakurikuler':
        return <ExtracurricularsSection />;
      case 'perpustakaan':
        return <LibrarySection />;
      case 'berita-pengumuman':
         return <NewsSection onSelectArticle={handleSelectArticle} />;
      case 'agenda-akademik':
        return <AgendaSection />;
      case 'galeri-foto-video':
        return <GallerySection />;
      case 'mitra-industri':
        return <IndustryPartnersSection />;
      case 'bkk':
        return <BkkSection />;
      case 'teaching-factory':
        return <TeachingFactorySection />;
      case 'lsp-sertifikasi':
        return <LspSection />;
      case 'tracer-study':
        return <TracerStudySection />;
      case 'ppdb-online':
        return <PpdbSection />;
      case 'kontak':
        return <ContactSection schoolData={schoolData} isSchoolDataLoading={isSchoolDataLoading} />;
      case 'pojok-literasi':
        return <LiteracySection onSelectArticle={handleSelectLiteracyArticle} />;
      case 'osis-corner':
        return <OsisCornerSection onSelectPost={handleSelectOsisPost} />;
      case 'database-alumni':
        return <AlumniSection />;
      case 'jadwal-pelajaran':
        return <ScheduleSection />;
      case 'testimoni-alumni':
        return <TestimonialsSection />;
      case 'dokumen-download':
        return <DownloadsSection />;
      case 'prakerin-pkl':
        return <PrakerinSection />;
      case 'buku-tamu':
        return <GuestbookSection />;
      case 'cek-status-kelulusan':
        return <CheckGraduationSection />;
      case 'showcase-karya':
        return <ShowcaseSection />;
      default:
        return <PlaceholderSection title="Feature Not Ready" description={`Halaman (${activeTab}) sedang dalam tahap integrasi database.`} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        setActiveTab={handleSetTab}
        schoolData={schoolData}
        isSchoolDataLoading={isSchoolDataLoading}
      />
      <main className="flex-grow pb-32 md:pb-0">
        <Suspense fallback={<SectionLoader />}>
            {renderSection()}
        </Suspense>
      </main>
      <Footer setActiveTab={handleSetTab} schoolData={schoolData} isSchoolDataLoading={isSchoolDataLoading} />
      <BottomNav
        activeTab={activeTab}
        setActiveTab={handleSetTab}
        setIsMenuOpen={setIsMenuOpen}
      />
      <AIAssistant />
    </div>
  );
}
