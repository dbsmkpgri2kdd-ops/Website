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

const SectionLoader = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
  </div>
);

const ProfileSection = dynamic(() => import('@/components/sections/profile'), { loading: () => <SectionLoader /> });
const NewsSection = dynamic(() => import('@/components/sections/news'), { loading: () => <SectionLoader /> });
const PpdbSection = dynamic(() => import('@/components/sections/ppdb'), { loading: () => <SectionLoader /> });
const ContactSection = dynamic(() => import('@/components/sections/contact'), { loading: () => <SectionLoader /> });
const MajorsSection = dynamic(() => import('@/components/sections/majors'), { loading: () => <SectionLoader /> });
const FacilitiesSection = dynamic(() => import('@/components/sections/facilities'), { loading: () => <SectionLoader /> });
const GallerySection = dynamic(() => import('@/components/sections/gallery'), { loading: () => <SectionLoader /> });
const AchievementsSection = dynamic(() => import('@/components/sections/achievements'), { loading: () => <SectionLoader /> });
const NewsDetailSection = dynamic(() => import('@/components/sections/news-detail'), { loading: () => <SectionLoader /> });
const TestimonialsSection = dynamic(() => import('@/components/sections/testimonials'), { loading: () => <SectionLoader /> });
const ExtracurricularsSection = dynamic(() => import('@/components/sections/extracurriculars'), { loading: () => <SectionLoader /> });
const AgendaSection = dynamic(() => import('@/components/sections/agenda'), { loading: () => <SectionLoader /> });
const DownloadsSection = dynamic(() => import('@/components/sections/downloads'), { loading: () => <SectionLoader /> });
const ScheduleSection = dynamic(() => import('@/components/shared/schedule-section'), { loading: () => <SectionLoader /> });
const LibrarySection = dynamic(() => import('@/components/sections/library'), { loading: () => <SectionLoader /> });
const LiteracySection = dynamic(() => import('@/components/sections/literacy-section'), { loading: () => <SectionLoader /> });
const LiteracyDetailSection = dynamic(() => import('@/components/sections/literacy-detail-section'), { loading: () => <SectionLoader /> });
const OsisCornerSection = dynamic(() => import('@/components/sections/osis-corner'), { loading: () => <SectionLoader /> });
const OsisCornerDetailSection = dynamic(() => import('@/components/sections/osis-corner-detail'), { loading: () => <SectionLoader /> });
const IndustryPartnersSection = dynamic(() => import('@/components/sections/industry-partners'), { loading: () => <SectionLoader /> });
const BkkSection = dynamic(() => import('@/components/sections/bkk'), { loading: () => <SectionLoader /> });
const TeachingFactorySection = dynamic(() => import('@/components/sections/teaching-factory'), { loading: () => <SectionLoader /> });
const LspSection = dynamic(() => import('@/components/sections/lsp'), { loading: () => <SectionLoader /> });
const TracerStudySection = dynamic(() => import('@/components/sections/tracer-study'), { loading: () => <SectionLoader /> });
const CheckGraduationSection = dynamic(() => import('@/components/sections/check-graduation'), { loading: () => <SectionLoader /> });
const TeachersSection = dynamic(() => import('@/components/sections/teachers'), { loading: () => <SectionLoader /> });
const PlaceholderSection = dynamic(() => import('@/components/sections/placeholder-section'), { loading: () => <SectionLoader /> });
const AlumniSection = dynamic(() => import('@/components/sections/alumni'), { loading: () => <SectionLoader /> });
const GuestbookSection = dynamic(() => import('@/components/sections/guestbook'), { loading: () => <SectionLoader /> });
const PrakerinSection = dynamic(() => import('@/components/sections/prakerin'), { loading: () => <SectionLoader /> });


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
    // Logic for Maintenance Mode
    if (schoolData?.isMaintenanceMode && !isAdmin) {
        return (
            <PlaceholderSection 
                title="Situs Sedang Dalam Pemeliharaan" 
                description="Kami sedang melakukan pembaruan sistem untuk memberikan pengalaman yang lebih baik. Silakan kembali lagi nanti." 
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
      default:
        return <PlaceholderSection title="Segera Hadir" description={`Halaman yang Anda tuju (${activeTab}) sedang dalam pengembangan.`} />;
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
      <main className="flex-grow pt-20">
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
    </div>
  );
}