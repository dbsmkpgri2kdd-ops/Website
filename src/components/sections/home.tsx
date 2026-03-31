
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
          <section key="hero" className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-white border-b border-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="max-w-2xl space-y-6 animate-reveal">
                  <div className='inline-flex items-center gap-2 text-primary'>
                    <div className='h-px w-6 bg-primary/30'></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Official Portal</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-[1.1] uppercase italic">
                    {schoolData?.heroTitle || "Membangun Masa Depan"} <br/>
                    <span className="text-primary not-italic">Ahli & Kompeten.</span>
                  </h1>
                  <p className="text-sm md:text-base text-slate-500 max-w-lg font-bold uppercase tracking-widest leading-relaxed opacity-70">
                    {schoolData?.heroSubtitle || "Pendidikan vokasi berstandar industri dengan kurikulum terintegrasi untuk mencetak lulusan siap kerja."}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button onClick={() => setActiveTab('ppdb-online')} className="h-11 px-8 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl glow-accent bg-accent text-accent-foreground border-none">
                        Daftar PPDB <ArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                    <Button onClick={() => setActiveTab('profil-sejarah')} variant="outline" className="h-11 px-8 rounded-xl font-bold text-[10px] uppercase tracking-widest border-slate-200 text-slate-600 hover:bg-slate-50">
                        Profil Sekolah
                    </Button>
                  </div>
                </div>
            </div>
          </section>
        );

      case 'partners':
        if (settings?.showPartners === false) return null;
        return (
          <section key="partners" className="py-8 border-b border-slate-100 bg-slate-50/20">
            <div className="max-w-7xl mx-auto px-6">
                <PartnersSlider partners={partners || []} />
            </div>
          </section>
        );

      case 'apps':
        return (
          <section key="apps" className="max-w-7xl mx-auto px-6 py-16 md:py-24 border-b border-slate-50">
            <QuickLinksGrid 
              audience="public" 
              title="Layanan Digital" 
              description="Akses terintegrasi satu pintu civitas." 
            />
          </section>
        );

      case 'stats':
        if (settings?.showStats === false) return null;
        return (
          <section key="stats" className="max-w-7xl mx-auto px-6 py-16 md:py-24 border-b border-slate-50">
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
          <section key="majors" className="max-w-7xl mx-auto px-6 py-16 md:py-24 border-b border-slate-50">
              <div className="mb-12 space-y-1">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 italic">Program Unggulan</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kompetensi keahlian berstandar industri.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(areMajorsLoading ? Array(3).fill({}) : (majors || [])).slice(0, 3).map((major: any, i: number) => {
                    const Icon = iconMap[major.icon] || BookOpen;
                    return (
                         <Card key={major.id || i} className="p-8 rounded-[2rem] border-slate-100 bg-white hover:border-primary/20 transition-all duration-300 flex flex-col h-full shadow-sm hover:shadow-xl group">
                              <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                  <Icon size={20} />
                              </div>
                              <h3 className="text-base font-black mb-2 text-slate-900 uppercase italic tracking-tight">{major.name || 'Bidang Studi'}</h3>
                              <p className="text-slate-500 text-[10px] leading-relaxed mb-6 flex-grow font-bold uppercase tracking-widest opacity-60">
                                {major.description || 'Deskripsi program studi tersedia segera.'}
                              </p>
                              <Button variant="ghost" onClick={() => setActiveTab('jurusan-kompetensi')} className="p-0 h-auto text-primary font-black text-[9px] uppercase tracking-widest hover:bg-transparent flex justify-start items-center">
                                Detail <ChevronRight size={14} className="ml-1" />
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
          <section key="news" className="max-w-7xl mx-auto px-6 py-16 md:py-24 border-b border-slate-50">
              <div className="flex justify-between items-end mb-12">
                  <div className="space-y-1">
                      <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 italic">Informasi Terbaru</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warta dan agenda harian sekolah.</p>
                  </div>
                  <Button onClick={() => setActiveTab('berita-pengumuman')} variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-primary p-0">
                      Lihat Semua
                  </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {(areNewsLoading ? Array(3).fill({}) : (newsArticles || [])).slice(0, 3).map((news: any, i: number) => (
                    <div key={news.id || i} className="group cursor-pointer space-y-4" onClick={() => news.id && onSelectArticle(news.id)}>
                      <div className="aspect-[16/9] relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                        {areNewsLoading ? <Skeleton className="w-full h-full" /> : (
                          <Image 
                            src={convertGoogleDriveLink(news.imageUrl || "https://picsum.photos/seed/news/800/500")} 
                            alt={news.title} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        )}
                      </div>
                      <div className="space-y-2 px-1">
                        <div className="flex items-center gap-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            <span className="text-primary">{news.category || 'News'}</span>
                            <span>{formatDateLabel(news.datePublished)}</span>
                        </div>
                        <h3 className="text-sm font-black leading-tight text-slate-900 line-clamp-2 uppercase italic tracking-tight group-hover:text-primary transition-colors">{news.title || 'Informasi Akademik'}</h3>
                      </div>
                    </div>
                ))}
            </div>
          </section>
        );

      case 'cta':
        if (settings?.showCta === false) return null;
        return (
          <section key="cta" className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <div className="rounded-[2.5rem] p-10 md:p-16 text-center bg-slate-900 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <h2 className="text-2xl md:text-4xl font-black text-white max-w-2xl mx-auto leading-tight tracking-tighter italic uppercase">
                  {schoolData?.ctaTitle || "Siap Menjadi Ahli Berkompetensi?"}
                </h2>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
                  Pendaftaran tahun ajaran 2025/2026 telah dibuka.
                </p>
                <div className="flex justify-center pt-4">
                  <Button onClick={() => setActiveTab('ppdb-online')} size="lg" className="h-12 px-10 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl bg-accent text-accent-foreground border-none">
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
      <div className="pb-20 animate-reveal bg-white">
        {sectionOrder.map(sectionId => renderSection(sectionId))}
      </div>
  );
};

export default HomeSection;
