"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import HomeSection from '@/components/sections/home';
import { SCHOOL_DATA_ID, type School, type NavLink } from '@/lib/data';
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

const ProfileSection = dynamic(() => import('@/components/sections/profile'), { loading: () => <SectionSkeleton /> });
const NewsSection = dynamic(() => import('@/components/sections/news'), { loading: () => <SectionSkeleton /> });
const PpdbSection = dynamic(() => import('@/components/sections/ppdb'), { loading: () => <SectionSkeleton /> });
const ContactSection = dynamic(() => import('@/components/sections/contact'), { loading: () => <SectionSkeleton /> });
const MajorsSection = dynamic(() => import('@/components/sections/majors'), { loading: () => <SectionSkeleton /> });
const FacilitiesSection = dynamic(() => import('@/components/sections/facilities'), { loading: () => <SectionSkeleton /> });
const GallerySection = dynamic(() => import('@/components/sections/gallery'), { loading: () => <SectionSkeleton /> });
const AchievementsSection = dynamic(() => import('@/components/sections/achievements'), { loading: () => <SectionSkeleton /> });
const TestimonialsSection = dynamic(() => import('@/components/sections/testimonials'), { loading: () => <SectionSkeleton /> });
const ExtracurricularsSection = dynamic(() => import('@/components/sections/extracurriculars'), { loading: () => <SectionSkeleton /> });
const AgendaSection = dynamic(() => import('@/components/sections/agenda'), { loading: () => <SectionSkeleton /> });
const DownloadsSection = dynamic(() => import('@/components/sections/downloads'), { loading: () => <SectionSkeleton /> });
const ScheduleSection = dynamic(() => import('@/components/shared/schedule-section'), { loading: () => <SectionSkeleton /> });
const LibrarySection = dynamic(() => import('@/components/sections/library'), { loading: () => <SectionSkeleton /> });
const LiteracySection = dynamic(() => import('@/components/sections/literacy-section'), { loading: () => <SectionSkeleton /> });
const IndustryPartnersSection = dynamic(() => import('@/components/sections/industry-partners'), { loading: () => <SectionSkeleton /> });
const BkkSection = dynamic(() => import('@/components/sections/bkk'), { loading: () => <SectionSkeleton /> });
const TeachingFactorySection = dynamic(() => import('@/components/sections/teaching-factory'), { loading: () => <SectionSkeleton /> });
const LspSection = dynamic(() => import('@/components/sections/lsp'), { loading: () => <SectionSkeleton /> });
const TracerStudySection = dynamic(() => import('@/components/sections/tracer-study'), { loading: () => <SectionSkeleton /> });
const CheckGraduationSection = dynamic(() => import('@/components/sections/check-graduation'), { loading: () => <SectionSkeleton /> });
const PpdbStatusCheckSection = dynamic(() => import('@/components/sections/ppdb-status-check'), { loading: () => <SectionSkeleton /> });
const TeachersSection = dynamic(() => import('@/components/sections/teachers'), { loading: () => <SectionSkeleton /> });
const AlumniSection = dynamic(() => import('@/components/sections/alumni'), { loading: () => <SectionSkeleton /> });
const GuestbookSection = dynamic(() => import('@/components/sections/guestbook'), { loading: () => <SectionSkeleton /> });
const PrakerinSection = dynamic(() => import('@/components/sections/prakerin'), { loading: () => <SectionSkeleton /> });
const ShowcaseSection = dynamic(() => import('@/components/sections/showcase'), { loading: () => <SectionSkeleton /> });
const PlaceholderSection = dynamic(() => import('@/components/sections/placeholder-section'), { loading: () => <SectionSkeleton /> });

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavLink>('home');
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
  
  const handleSetTab = (tab: NavLink) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const renderSection = () => {
    if (!mounted) return <SectionSkeleton />;

    if (schoolData?.isMaintenanceMode && !isAdmin) {
        return (
            <PlaceholderSection 
                title="Sistem Pemeliharaan" 
                description="Kami sedang meningkatkan performa sistem untuk pengalaman digital yang lebih baik." 
            />
        );
    }

    switch (activeTab) {
      case 'home':
        return <HomeSection setActiveTab={handleSetTab} onSelectArticle={() => handleSetTab('berita-pengumuman')} />;
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
         return <NewsSection onSelectArticle={() => {}} />;
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
        return <LiteracySection onSelectArticle={() => {}} />;
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
        return <PlaceholderSection title="Fitur Belum Tersedia" description={`Halaman (${activeTab}) sedang dalam tahap integrasi.`} />;
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
      <main className="flex-grow pb-24 md:pb-0" role="main">
        {renderSection()}
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