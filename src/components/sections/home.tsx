'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { type NewsArticle, type Major, type School, type NavLink, type IndustryPartner, SCHOOL_DATA_ID } from '@/lib/data';
import { ArrowRight, BookOpen, Calendar, Computer, BarChart4, Film, Wrench, Bike, GraduationCap, ChevronRight, Sparkles, Globe, ShieldCheck, Zap } from 'lucide-react';
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
          <section key="hero" className="relative h-[90dvh] -mt-20 flex items-center overflow-hidden">
            <div className="absolute inset-0 z-0">
               <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071"
                alt="Education Excellence"
                fill
                className="object-cover opacity-10 grayscale"
                priority
                sizes="100vw"
                data-ai-hint="minimalist university"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background to-background"></div>
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-10">
                <div className="max-w-3xl space-y-8 animate-reveal">
                  <div className='inline-flex items-center gap-3 px-4 py-1.5 rounded-lg bg-white/5 border border-white/5 text-primary shadow-xl backdrop-blur-xl'>
                    <Sparkles size={12} className='animate-pulse' />
                    <span className='text-[9px] font-black uppercase tracking-[0.3em]'>Pendidikan Berbasis Inovasi</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight text-foreground uppercase italic">
                    {schoolData?.heroTitle || "Membangun Masa Depan"} <br/><span className="text-primary not-italic">Vokasi Unggul.</span>
                  </h1>
                  <p className="text-base md:text-xl text-muted-foreground max-w-xl font-medium leading-relaxed opacity-80">
                    {schoolData?.heroSubtitle || "Menyiapkan lulusan yang kompeten dan siap kerja melalui ekosistem digital terintegrasi."}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button onClick={() => setActiveTab('ppdb-online')} size="lg" className="h-14 px-10 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl glow-primary hover:scale-105 transition-all">
                        Pendaftaran 2025 <ArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                    <Button onClick={() => setActiveTab('profil-sejarah')} variant="ghost" size="lg" className="h-14 px-10 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border border-white/5 hover:bg-white/5">
                        Lihat Profil
                    </Button>
                  </div>
                </div>
            </div>
          </section>
        );

      case 'partners':
        if (settings?.showPartners === false) return null;
        return (
          <section key="partners" className="max-w-7xl mx-auto px-6 py-16 border-y border-white/5 items-center grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-2">
              <h3 className="text-[8px] font-black text-primary uppercase tracking-[0.4em]">Jejak Industri</h3>
              <p className="text-2xl font-black tracking-tighter uppercase italic">Mitra Strategis</p>
            </div>
            <div className="lg:col-span-3 opacity-40 hover:opacity-100 transition-all duration-1000 grayscale hover:grayscale-0">
              <PartnersSlider partners={partners || []} />
            </div>
          </section>
        );

      case 'apps':
        return (
          <section key="apps" className="max-w-7xl mx-auto px-6 py-16">
            <QuickLinksGrid 
              audience="public" 
              title="Layanan Digital" 
              description="Akses cepat ke platform penunjang akademik." 
            />
          </section>
        );

      case 'stats':
        if (settings?.showStats === false) return null;
        return (
          <section key="stats" className="max-w-7xl mx-auto px-6 py-16">
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
          <section key="majors" className="max-w-7xl mx-auto px-6 py-16">
              <div className="mb-16 space-y-3">
                  <div className='flex items-center gap-3 text-primary'>
                      <span className="text-[9px] font-black uppercase tracking-[0.5em]">Jalur Akademik</span>
                      <div className='h-px w-16 bg-primary/30'></div>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">Program Studi.</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                  {(areMajorsLoading ? Array(3).fill({}) : (majors || [])).slice(0, 3).map((major: any, i: number) => {
                    const Icon = iconMap[major.icon] || BookOpen;
                    return (
                         <Card key={major.id || i} className="group p-10 rounded-[2.5rem] border-white/5 bg-white/5 hover:bg-white/[0.08] transition-all duration-700 relative overflow-hidden flex flex-col h-full border shadow-xl">
                              <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-primary/20 group-hover:rotate-6 transition-transform">
                                  <Icon size={28} />
                              </div>
                              <h3 className="text-xl font-black mb-4 tracking-tight uppercase">{major.name || 'PROGRAM INTI'}</h3>
                              <p className="text-muted-foreground text-xs leading-relaxed mb-8 flex-grow font-medium opacity-70">
                                {major.description || 'Menguasai keterampilan teknis yang dibutuhkan industri dengan standar peralatan profesional.'}
                              </p>
                              <Button variant="link" onClick={() => setActiveTab('jurusan-kompetensi')} className="p-0 h-auto text-foreground font-black uppercase tracking-[0.3em] text-[9px] group-hover:text-primary transition-all">
                                SELENGKAPNYA <ChevronRight size={14} className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
          <div key="showcase" className="py-10">
            <ShowcaseSection />
          </div>
        );

      case 'news':
        if (settings?.showNews === false) return null;
        return (
          <section key="news" className="max-w-7xl mx-auto px-6 py-16">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                  <div className="space-y-3">
                      <div className='flex items-center gap-3 text-primary'>
                          <span className="text-[9px] font-black uppercase tracking-[0.5em]">Pembaruan</span>
                          <div className='h-px w-16 bg-primary/30'></div>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">Warta Kampus.</h2>
                  </div>
                  <Button onClick={() => setActiveTab('berita-pengumuman')} variant="outline" className="rounded-xl h-12 px-8 font-black uppercase tracking-[0.2em] text-[9px] border-white/10 hover:bg-white/5 shadow-xl">
                      Lihat Arsip
                  </Button>
              </div>
              <div className="grid md:grid-cols-3 gap-10">
                {(areNewsLoading ? Array(3).fill({}) : (newsArticles || [])).slice(0, 3).map((news: any, i: number) => (
                    <div key={news.id || i} className="group cursor-pointer space-y-6" onClick={() => news.id && onSelectArticle(news.id)}>
                      <div className="aspect-[16/10] relative rounded-[2rem] overflow-hidden bg-muted border border-white/5 shadow-2xl">
                        {areNewsLoading ? <Skeleton className="w-full h-full" /> : (
                          <Image 
                            src={convertGoogleDriveLink(news.imageUrl || "https://picsum.photos/seed/news/800/500")} 
                            alt={news.title} 
                            fill 
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" 
                          />
                        )}
                      </div>
                      <div className="space-y-3 px-2">
                        <div className="flex items-center gap-3 text-[8px] font-black text-primary uppercase tracking-[0.3em]">
                            {formatDateLabel(news.datePublished)} • {news.category || 'INFO'}
                        </div>
                        <h3 className="text-lg font-black leading-tight group-hover:text-primary transition-colors tracking-tighter uppercase italic line-clamp-2">{news.title || 'Inovasi Digital Pendidikan Vokasi'}</h3>
                        <p className='text-muted-foreground text-[11px] line-clamp-2 leading-relaxed font-medium opacity-60'>{news.content}</p>
                      </div>
                    </div>
                ))}
            </div>
          </section>
        );

      case 'cta':
        if (settings?.showCta === false) return null;
        return (
          <section key="cta" className="max-w-7xl mx-auto px-6 py-16">
            <div className="rounded-[3rem] p-16 md:p-24 text-center relative overflow-hidden bg-primary text-white shadow-3xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40 animate-pulse"></div>
              <div className="relative z-10 space-y-8">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter max-w-4xl mx-auto leading-tight italic">
                  GABUNG BERSAMA <br/>GENERASI AHLI.
                </h2>
                <p className="text-white/70 text-base md:text-xl max-w-xl mx-auto font-bold uppercase tracking-widest leading-relaxed">
                  Pendaftaran tahun ajaran 2025 telah dibuka. Amankan kursi masa depan Anda.
                </p>
                <div className="flex flex-wrap gap-6 justify-center pt-6">
                  <Button onClick={() => setActiveTab('ppdb-online')} size="lg" variant="secondary" className="h-16 px-12 rounded-xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all">
                      Daftar Sekarang
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('kontak')} className="h-16 px-12 rounded-xl font-black text-[11px] uppercase tracking-[0.3em] border-white/20 hover:bg-white/10">
                      Info Lanjut
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
      <div className="pb-24 animate-reveal tech-mesh">
        {sectionOrder.map(sectionId => renderSection(sectionId))}
      </div>
  );
};

export default HomeSection;