'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { type NewsArticle, type Major, type School, type NavLink, type IndustryPartner, SCHOOL_DATA_ID } from '@/lib/data';
import { ArrowRight, BookOpen, Computer, BarChart4, Film, Wrench, Bike, GraduationCap, ChevronRight, Sparkles, Clock, Calendar } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, convertGoogleDriveLink } from '@/lib/utils';
import PartnersSlider from '@/components/sections/home/partners-slider';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
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

  const schoolDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'schools', SCHOOL_DATA_ID) : null, [firestore]);
  const { data: schoolData, isLoading: isSchoolLoading } = useDoc<School>(schoolDocRef);

  const newsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, `schools/${SCHOOL_DATA_ID}/newsArticles`), orderBy('datePublished', 'desc'), limit(3));
  }, [firestore]);
  const { data: newsArticles, isLoading: areNewsLoading } = useCollection<NewsArticle>(newsQuery);

  const majorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, `schools/${SCHOOL_DATA_ID}/majors`), orderBy('name'));
  }, [firestore]);
  const { data: majors, isLoading: areMajorsLoading } = useCollection<Major>(majorsQuery);

  const partnersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, `schools/${SCHOOL_DATA_ID}/industryPartners`), orderBy('name'));
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
    return schoolData?.layoutSettings?.sectionOrder || ['hero', 'partners', 'apps', 'stats', 'majors', 'news', 'cta'];
  }, [schoolData]);

  if (!mounted) return null;

  const renderSection = (id: string) => {
    const settings = schoolData?.layoutSettings;
    
    switch (id) {
      case 'hero':
        if (settings?.showHero === false) return null;
        return (
          <section key="hero" className="relative pt-16 pb-12 md:pt-24 md:pb-20 overflow-hidden bg-white border-b border-slate-50 tech-mesh">
            <div className="max-w-7xl mx-auto px-6">
                <div className="max-w-xl space-y-5 animate-reveal">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-slate-900 leading-[1.1] uppercase">
                    {schoolData?.heroTitle || "Membangun Masa Depan"} <br/>
                    <span className="text-primary">Ahli & Kompeten.</span>
                  </h1>
                  <p className="text-[11px] md:text-xs text-slate-500 max-w-md font-bold uppercase tracking-widest leading-relaxed opacity-60">
                    {schoolData?.heroSubtitle || "Pendidikan vokasi berstandar industri dengan kurikulum terintegrasi untuk mencetak lulusan siap kerja."}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button onClick={() => setActiveTab('ppdb-online')} className="h-10 px-6 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-sm bg-accent text-accent-foreground border-none">
                        Daftar PPDB <ArrowRight className='ml-2 h-3.5 w-3.5' />
                    </Button>
                    <Button onClick={() => setActiveTab('profil-sejarah')} variant="outline" className="h-10 px-6 rounded-lg font-bold text-[10px] uppercase tracking-widest border-slate-200 text-slate-600 hover:bg-slate-50">
                        Tentang Kami
                    </Button>
                  </div>
                </div>
            </div>
          </section>
        );

      case 'partners':
        if (settings?.showPartners === false) return null;
        return (
          <section key="partners" className="py-6 border-b border-slate-100 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <PartnersSlider partners={partners || []} />
            </div>
          </section>
        );

      case 'apps':
        return (
          <section key="apps" className="max-w-7xl mx-auto px-6 py-12 md:py-16 border-b border-slate-50">
            <QuickLinksGrid 
              audience="public" 
              title="Layanan Digital" 
              description="Akses terintegrasi untuk seluruh civitas." 
            />
          </section>
        );

      case 'stats':
        if (settings?.showStats === false) return null;
        return (
          <section key="stats" className="max-w-7xl mx-auto px-6 py-12 md:py-16 border-b border-slate-50">
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
          <section key="majors" className="max-w-7xl mx-auto px-6 py-12 md:py-16 border-b border-slate-50">
              <div className="mb-8 space-y-1">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 opacity-40">Program Keahlian</h2>
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Kompetensi Berstandar Industri.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(areMajorsLoading ? Array(3).fill({}) : (majors || [])).slice(0, 3).map((major: any, i: number) => {
                    const Icon = iconMap[major.icon] || BookOpen;
                    return (
                         <Card key={major.id || i} className="p-6 rounded-2xl border-slate-100 bg-white hover:border-primary/20 transition-all duration-300 flex flex-col h-full shadow-sm group">
                              <div className="w-8 h-8 bg-primary/5 text-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                  <Icon size={16} />
                              </div>
                              <h3 className="text-sm font-bold mb-1.5 text-slate-900 uppercase tracking-tight">{major.name || 'Bidang Studi'}</h3>
                              <p className="text-slate-500 text-[10px] leading-relaxed mb-4 flex-grow font-bold uppercase tracking-widest opacity-50">
                                {major.description || 'Deskripsi program studi tersedia segera.'}
                              </p>
                              <Button variant="ghost" onClick={() => setActiveTab('jurusan-kompetensi')} className="p-0 h-auto text-primary font-bold text-[9px] uppercase tracking-widest hover:bg-transparent flex justify-start items-center">
                                Detail <ChevronRight size={12} className="ml-1" />
                              </Button>
                         </Card>
                    )
                  })}
              </div>
          </section>
        );

      case 'news':
        if (settings?.showNews === false) return null;
        return (
          <section key="news" className="max-w-7xl mx-auto px-6 py-12 md:py-16 border-b border-slate-50">
              <div className="flex justify-between items-end mb-8">
                  <div className="space-y-1">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 opacity-40">Update Sekolah</h2>
                      <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Warta & Informasi Terkini.</p>
                  </div>
                  <Button onClick={() => setActiveTab('berita-pengumuman')} variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-primary p-0">
                      Lihat Semua
                  </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(areNewsLoading ? Array(3).fill({}) : (newsArticles || [])).slice(0, 3).map((news: any, i: number) => (
                    <div key={news.id || i} className="group cursor-pointer space-y-3" onClick={() => news.id && onSelectArticle(news.id)}>
                      <div className="aspect-[16/9] relative rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
                        {areNewsLoading ? <Skeleton className="w-full h-full" /> : (
                          <Image 
                            src={convertGoogleDriveLink(news.imageUrl || "https://picsum.photos/seed/news/800/500")} 
                            alt={news.title} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="space-y-1.5 px-1">
                        <div className="flex items-center gap-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            <span className="text-primary">{news.category || 'News'}</span>
                            <span>{formatDateLabel(news.datePublished)}</span>
                        </div>
                        <h3 className="text-xs font-bold leading-tight text-slate-900 line-clamp-2 uppercase tracking-tight group-hover:text-primary transition-colors">{news.title || 'Informasi Akademik'}</h3>
                      </div>
                    </div>
                ))}
            </div>
          </section>
        );

      case 'cta':
        if (settings?.showCta === false) return null;
        return (
          <section key="cta" className="max-w-7xl mx-auto px-6 py-12 md:py-16">
            <div className="rounded-3xl p-8 md:p-12 text-center bg-slate-900 shadow-xl relative overflow-hidden border border-slate-800">
              <div className="relative z-10 space-y-5">
                <h2 className="text-xl md:text-2xl font-bold text-white max-w-xl mx-auto leading-tight tracking-tighter uppercase">
                  {schoolData?.ctaTitle || "Siap Menjadi Ahli Berkompetensi?"}
                </h2>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
                  Pendaftaran Tahun Ajaran 2025/2026 Dibuka.
                </p>
                <div className="flex justify-center pt-2">
                  <Button onClick={() => setActiveTab('ppdb-online')} size="lg" className="h-10 px-8 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-sm bg-accent text-accent-foreground border-none">
                      Daftar Sekarang
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
      <div className="pb-16 animate-reveal bg-white">
        {sectionOrder.map(sectionId => renderSection(sectionId))}
      </div>
  );
};

export default HomeSection;