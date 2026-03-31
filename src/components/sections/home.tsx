'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { type NewsArticle, type Major, type School, type NavLink, type IndustryPartner, SCHOOL_DATA_ID } from '@/lib/data';
import { ArrowRight, BookOpen, Computer, BarChart4, Film, Wrench, Bike, GraduationCap, ChevronRight, Sparkles } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { convertGoogleDriveLink } from '@/lib/utils';
import PartnersSlider from '@/components/sections/home/partners-slider';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import ShowcaseSection from './showcase';
import StatisticsSection from './statistics';
import { QuickLinksGrid } from '../shared/quick-links-grid';

type HomeSectionProps = {
  setActiveTab: (tab: NavLink) => void;
  onSelectArticle: (articleId: string) => void;
};

const iconMap: { [key: string]: React.ElementType } = {
  Computer, BarChart4, Film, Wrench, Bike, BookOpen, GraduationCap
};

const HomeSection = ({ setActiveTab, onSelectArticle }: HomeSectionProps) => {
  const firestore = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const schoolDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'schools', SCHOOL_DATA_ID);
  }, [firestore]);
  const { data: schoolData, isLoading: isSchoolLoading } = useDoc<School>(schoolDocRef);

  const newsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/newsArticles`);
    return query(ref, orderBy('datePublished', 'desc'), limit(3));
  }, [firestore]);
  const { data: newsArticles, isLoading: areNewsLoading } = useCollection<NewsArticle>(newsQuery);

  const majorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/majors`);
    return query(ref, orderBy('name'));
  }, [firestore]);
  const { data: majors, isLoading: areMajorsLoading } = useCollection<Major>(majorsQuery);

  const partnersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/industryPartners`);
    return query(ref, orderBy('name'));
  }, [firestore]);
  const { data: partners } = useCollection<IndustryPartner>(partnersQuery);
  
  const formatDateLabel = (date: any) => {
    if (!date) return '';
    try {
      const jsDate = date.toDate ? date.toDate() : new Date(date);
      return format(jsDate, "d MMM yyyy", { locale: idLocale });
    } catch (e) {
      return '';
    }
  }

  const sectionOrder = useMemo(() => {
    return schoolData?.layoutSettings?.sectionOrder || ['hero', 'partners', 'apps', 'stats', 'majors', 'showcase', 'news', 'cta'];
  }, [schoolData]);

  if (!mounted) return null;

  const renderSection = (id: string) => {
    const settings = schoolData?.layoutSettings;
    
    switch (id) {
      case 'hero':
        if (settings?.showHero === false) return null;
        return (
          <section key="hero" className="relative min-h-[85dvh] flex items-center overflow-hidden bg-white">
            <div className="absolute inset-0 z-0">
               <Image
                src="https://images.unsplash.com/photo-1523050853063-bd8012fbb230?q=80&w=2070"
                alt="Kampus"
                fill
                className="object-cover opacity-[0.03]"
                priority
                sizes="100vw"
                data-ai-hint="bright university"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-white via-white/95 to-slate-100/50"></div>
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-20">
                <div className="max-w-3xl space-y-8 animate-reveal">
                  <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-900 text-[11px] font-bold tracking-wider border border-slate-200'>
                    <Sparkles size={14} className="text-blue-600 animate-pulse" />
                    <span>Pusat Keunggulan Vokasi 2025</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                    {schoolData?.heroTitle || "Membangun Masa Depan"} <br/><span className="text-blue-600">Generasi Ahli & Kompeten.</span>
                  </h1>
                  <p className="text-base md:text-xl text-slate-600 max-w-xl font-medium leading-relaxed">
                    {schoolData?.heroSubtitle || "Persiapkan diri Anda untuk karier profesional melalui pendidikan berkualitas berbasis industri di SMKS PGRI 2 Kedondong."}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button onClick={() => setActiveTab('ppdb-online')} size="lg" className="h-14 px-10 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:scale-[1.02] transition-all">
                        Daftar Calon Siswa <ArrowRight className='ml-2 h-5 w-5' />
                    </Button>
                    <Button onClick={() => setActiveTab('profil-sejarah')} variant="outline" size="lg" className="h-14 px-10 rounded-2xl font-bold border-slate-200 text-slate-900 bg-white hover:bg-slate-50">
                        Kenali Kami
                    </Button>
                  </div>
                </div>
            </div>
          </section>
        );

      case 'partners':
        if (settings?.showPartners === false) return null;
        return (
          <section key="partners" className="bg-slate-50/50 py-14 border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-6 items-center grid lg:grid-cols-4 gap-10">
                <div className="lg:col-span-1 text-center md:text-left">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Bekerja Sama Dengan</p>
                    <h3 className="text-xl font-bold text-slate-900">Mitra Industri Strategis</h3>
                </div>
                <div className="lg:col-span-3">
                    <PartnersSlider partners={partners || []} />
                </div>
            </div>
          </section>
        );

      case 'apps':
        return (
          <section key="apps" className="max-w-7xl mx-auto px-6 py-24">
            <QuickLinksGrid 
              audience="public" 
              title="Portal Layanan Terintegrasi" 
              description="Akses satu pintu untuk seluruh kebutuhan administratif, akademik, dan layanan civitas." 
            />
          </section>
        );

      case 'stats':
        if (settings?.showStats === false) return null;
        return (
          <section key="stats" className="max-w-7xl mx-auto px-6 py-20 bg-white">
            <StatisticsSection 
              studentCount={schoolData?.studentCount || 0}
              teacherCount={schoolData?.teacherCount || 0}
              majorCount={majors?.length || 0}
              partnerCount={partners?.length || 0}
              isLoading={isSchoolLoading}
            />
          </section>
        );

      case 'majors':
        if (settings?.showMajors === false) return null;
        return (
          <section key="majors" className="max-w-7xl mx-auto px-6 py-24">
              <div className="mb-16 text-center md:text-left space-y-3">
                  <div className='flex items-center gap-2 text-blue-600 justify-center md:justify-start'>
                    <div className='h-px w-8 bg-blue-600/30'></div>
                    <span className="text-xs font-bold uppercase tracking-widest">Akademik</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Program Unggulan</h2>
                  <p className="text-slate-500 text-sm max-w-2xl font-medium leading-relaxed">Kurikulum yang disinkronkan langsung dengan standar kebutuhan dunia kerja internasional.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                  {(areMajorsLoading ? Array(3).fill({}) : (majors || [])).slice(0, 3).map((major: any, i: number) => {
                    const Icon = iconMap[major.icon] || BookOpen;
                    return (
                         <Card key={major.id || i} className="p-10 rounded-[2.5rem] border-slate-100 bg-white hover:border-blue-100 transition-all duration-500 flex flex-col h-full shadow-sm hover:shadow-xl group">
                              <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 border border-slate-100">
                                  <Icon size={28} className="text-blue-600" />
                              </div>
                              <h3 className="text-xl font-bold mb-4 text-slate-900">{major.name || 'Bidang Studi'}</h3>
                              <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow font-medium">
                                {major.description || 'Deskripsi mendalam mengenai kompetensi keahlian akan segera tersedia untuk publik.'}
                              </p>
                              <Button variant="ghost" onClick={() => setActiveTab('jurusan-kompetensi')} className="p-0 h-auto text-blue-600 font-bold text-sm hover:bg-transparent flex justify-start items-center group/btn">
                                Pelajari Detail <ChevronRight size={16} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                              </Button>
                         </Card>
                    )
                  })}
              </div>
          </section>
        );

      case 'showcase':
        if (settings?.showShowcase === false) return null;
        return (
          <div key="showcase" className="bg-slate-50/30 py-24 border-y border-slate-100">
            <ShowcaseSection />
          </div>
        );

      case 'news':
        if (settings?.showNews === false) return null;
        return (
          <section key="news" className="max-w-7xl mx-auto px-6 py-24">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                  <div className="space-y-3 text-center md:text-left">
                      <div className='flex items-center gap-2 text-blue-600 justify-center md:justify-start'>
                        <div className='h-px w-8 bg-blue-600/30'></div>
                        <span className="text-xs font-bold uppercase tracking-widest">Informasi</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Warta Kampus</h2>
                      <p className="text-slate-500 text-sm font-medium">Informasi resmi, prestasi, dan agenda terbaru dari lingkungan sekolah.</p>
                  </div>
                  <Button onClick={() => setActiveTab('berita-pengumuman')} variant="outline" className="rounded-xl h-12 px-8 font-bold text-xs border-slate-200 text-slate-900 bg-white">
                      Lihat Arsip Berita
                  </Button>
              </div>
              <div className="grid md:grid-cols-3 gap-10">
                {(areNewsLoading ? Array(3).fill({}) : (newsArticles || [])).slice(0, 3).map((news: any, i: number) => (
                    <div key={news.id || i} className="group cursor-pointer space-y-5" onClick={() => news.id && onSelectArticle(news.id)}>
                      <div className="aspect-[16/10] relative rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-sm transition-all duration-500 group-hover:shadow-xl">
                        {areNewsLoading ? <Skeleton className="w-full h-full" /> : (
                          <Image 
                            src={convertGoogleDriveLink(news.imageUrl || "https://picsum.photos/seed/news/800/500")} 
                            alt={news.title} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-all duration-700" 
                          />
                        )}
                      </div>
                      <div className="space-y-3 px-2">
                        <div className="flex items-center gap-3 text-[11px] font-bold text-blue-600">
                            <span className='bg-blue-50 px-3 py-1 rounded-full border border-blue-100'>{news.category || 'Berita'}</span>
                            <span className="text-slate-400 font-medium">{formatDateLabel(news.datePublished)}</span>
                        </div>
                        <h3 className="text-xl font-bold leading-tight group-hover:text-blue-600 transition-colors text-slate-900 line-clamp-2">{news.title || 'Informasi Akademik Penting'}</h3>
                        <p className='text-slate-500 text-sm line-clamp-2 leading-relaxed font-medium'>{news.content}</p>
                      </div>
                    </div>
                ))}
            </div>
          </section>
        );

      case 'cta':
        if (settings?.showCta === false) return null;
        return (
          <section key="cta" className="max-w-7xl mx-auto px-6 py-24">
            <div className="rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden bg-slate-900 shadow-2xl">
              <div className="absolute inset-0 bg-blue-500/5 opacity-20 pointer-events-none"></div>
              <div className="relative z-10 space-y-10">
                <h2 className="text-3xl md:text-5xl font-black text-white max-w-3xl mx-auto leading-[1.1] tracking-tight italic">
                  {schoolData?.ctaTitle || "SIAP MENJADI AHLI PROFESIONAL DI BIDANGNYA?"}
                </h2>
                <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
                  Gabunglah dengan ribuan siswa sukses lainnya. Pendaftaran tahun ajaran baru 2025/2026 telah dibuka secara resmi.
                </p>
                <div className="flex flex-wrap gap-5 justify-center">
                  <Button onClick={() => setActiveTab('ppdb-online')} size="lg" className="h-16 px-12 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl bg-white text-slate-900 hover:bg-slate-100 transition-all">
                      Daftar Sekarang
                  </Button>
                  <Button variant="secondary" onClick={() => setActiveTab('kontak')} className="h-16 px-12 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl bg-slate-800 text-white hover:bg-slate-700">
                      Hubungi Bantuan
                  </Button>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
      <div className="pb-24 animate-reveal tech-mesh bg-white">
        {sectionOrder.map(sectionId => renderSection(sectionId))}
      </div>
  );
};

export default HomeSection;