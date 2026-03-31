
"use client";

import React, { useState, Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import HomeSection from '@/components/sections/home';
import { type NewsArticle, SCHOOL_DATA_ID, type School, type LiteracyArticle, type OsisPost, type NavLink } from '@/lib/data';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import BottomNav from '@/components/layout/bottom-nav';
import { Skeleton } from '@/components/ui/skeleton';

const SectionSkeleton = () => (
  <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
    <Skeleton className="h-10 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  </div>
);

// Performance Optimization: Strategic Dynamic imports
const ProfileSection = dynamic(() => import('@/components/sections/profile'), { loading: () => <SectionSkeleton />, ssr: true });
const NewsSection = dynamic(() => import('@/components/sections/news'), { loading: () => <SectionSkeleton />, ssr: false });
const PpdbSection = dynamic(() => import('@/components/sections/ppdb'), { loading: () => <SectionSkeleton />, ssr: false });
const ContactSection = dynamic(() => import('@/components/sections/contact'), { loading: () => <SectionSkeleton />, ssr: false });
const MajorsSection = dynamic(() => import('@/components/sections/majors'), { loading: () => <SectionSkeleton />, ssr: false });
const FacilitiesSection = dynamic(() => import('@/components/sections/facilities'), { loading: () => <SectionSkeleton />, ssr: false });
const GallerySection = dynamic(() => import('@/components/sections/gallery'), { loading: () => <SectionSkeleton />, ssr: false });
const AchievementsSection = dynamic(() => import('@/components/sections/achievements'), { loading: () => <SectionSkeleton />, ssr: false });
const NewsDetailSection = dynamic(() => import('@/components/sections/news-detail'), { loading: () => <SectionSkeleton />, ssr: false });
const TestimonialsSection = dynamic(() => import('@/components/sections/testimonials'), { loading: () => <SectionSkeleton />, ssr: false });
const ExtracurricularsSection = dynamic(() => import('@/components/sections/extracurriculars'), { loading: () => <SectionSkeleton />, ssr: false });
const AgendaSection = dynamic(() => import('@/components/sections/agenda'), { loading: () => <SectionSkeleton />, ssr: false });
const DownloadsSection = dynamic(() => import('@/components/sections/downloads'), { loading: () => <SectionSkeleton />, ssr: false });
const ScheduleSection = dynamic(() => import('@/components/shared/schedule-section'), { loading: () => <SectionSkeleton />, ssr: false });
const LibrarySection = dynamic(() => import('@/components/sections/library'), { loading: () => <SectionSkeleton />, ssr: false });
const LiteracySection = dynamic(() => import('@/components/sections/literacy-section'), { loading: () => <SectionSkeleton />, ssr: false });
const LiteracyDetailSection = dynamic(() => import('@/components/sections/literacy-detail-section'), { loading: () => <SectionSkeleton />, ssr: false });
const OsisCornerSection = dynamic(() => import('@/components/sections/osis-corner'), { loading: () => <SectionSkeleton />, ssr: false });
const OsisCornerDetailSection = dynamic(() => import('@/components/sections/osis-corner-detail'), { loading: () => <SectionSkeleton />, ssr: false });
const IndustryPartnersSection = dynamic(() => import('@/components/sections/industry-partners'), { loading: () => <SectionSkeleton />, ssr: false });
const BkkSection = dynamic(() => import('@/components/sections/bkk'), { loading: () => <SectionSkeleton />, ssr: false });
const TeachingFactorySection = dynamic(() => import('@/components/sections/teaching-factory'), { loading: () => <SectionSkeleton />, ssr: false });
const LspSection = dynamic(() => import('@/components/sections/lsp'), { loading: () => <SectionSkeleton />, ssr: false });
const TracerStudySection = dynamic(() => import('@/components/sections/tracer-study'), { loading: () => <SectionSkeleton />, ssr: false });
const CheckGraduationSection = dynamic(() => import('@/components/sections/check-graduation'), { loading: () => <SectionSkeleton />, ssr: false });
const PpdbStatusCheckSection = dynamic(() => import('@/components/sections/ppdb-status-check'), { loading: () => <SectionSkeleton />, ssr: false });
const TeachersSection = dynamic(() => import('@/components/sections/teachers'), { loading: () => <SectionSkeleton />, ssr: false });
const PlaceholderSection = dynamic(() => import('@/components/sections/placeholder-section'), { loading: () => <SectionSkeleton />, ssr: false });
const AlumniSection = dynamic(() => import('@/components/sections/alumni'), { loading: () => <SectionSkeleton />, ssr: false });
const GuestbookSection = dynamic(() => import('@/components/sections/guestbook'), { loading: () => <SectionSkeleton />, ssr: false });
const PrakerinSection = dynamic(() => import('@/components/sections/prakerin'), { loading: () => <SectionSkeleton />, ssr: false });
const ShowcaseSection = dynamic(() => import('@/components/sections/showcase'), { loading: () => <SectionSkeleton />, ssr: false });

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavLink>('home');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedLiteracyArticleId, setSelectedLiteracyArticleId] = useState<string | null>(null);
  const [selectedOsisPostId, setSelectedOsisPostId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (!mounted) return <SectionSkeleton />;

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
        return <PpdbSection setActiveTab={handleSetTab} />;
      case 'cek-pendaftaran-ppdb':
        return <PpdbStatusCheckSection />;
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
        isMenuOpen={false}
        setIsMenuOpen={() => {}}
        setActiveTab={handleSetTab}
        schoolData={schoolData}
        isSchoolDataLoading={isSchoolDataLoading}
      />
      <main className="flex-grow pb-24 md:pb-0">
        <Suspense fallback={<SectionSkeleton />}>
            {renderSection()}
        </Suspense>
      </main>
      <Footer setActiveTab={handleSetTab} schoolData={schoolData} isSchoolDataLoading={isSchoolDataLoading} />
      <BottomNav
        activeTab={activeTab}
        setActiveTab={handleSetTab}
        setIsMenuOpen={() => {}}
      />
    </div>
  );
}
