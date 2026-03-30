
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
          <section key="hero" className="relative h-[85dvh] -mt-20 flex items-center overflow-hidden">
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
                <div className="max-w-3xl space-y-6 animate-reveal">
                  <div className='inline-flex items-center gap-3 px-4 py-1.5 rounded-lg bg-white/5 border border-white/5 text-primary shadow-xl backdrop-blur-xl'>
                    <Sparkles size={12} />
                    <span className='text-[9px] font-black uppercase tracking-[0.3em]'>Pusat Pendidikan Vokasi</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight text-foreground uppercase italic">
                    {schoolData?.heroTitle || "Membangun Masa Depan"} <br/><span className="text-primary not-italic">Vokasi Unggul.</span>
                  </h1>
                  <p className="text-sm md:text-lg text-muted-foreground max-w-xl font-medium leading-relaxed opacity-80">
                    {schoolData?.heroSubtitle || "Menyiapkan lulusan kompeten yang siap bersaing di pasar kerja global melalui ekosistem digital terintegrasi."}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button onClick={() => setActiveTab('ppdb-online')} size="lg" className="h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl glow-primary hover:scale-105 transition-all">
                        Pendaftaran 2025 <ArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                    <Button onClick={() => setActiveTab('profil-sejarah')} variant="ghost" size="lg" className="h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border border-white/10 hover:bg-white/5">
                        Tentang Sekolah
                    </Button>
                  </div>
                </div>
            </div>
          </section>
        );

      case 'partners':
        if (settings?.showPartners === false) return null;
        return (
          <section key="partners" className="max-w-7xl mx-auto px-6 py-12 border-y border-white/5 items-center grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-1 text-center md:text-left">
              <h3 className="text-[8px] font-black text-primary uppercase tracking-[0.4em]">Partner Strategis</h3>
              <p className="text-xl font-black tracking-tighter uppercase italic">Jejak Industri</p>
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
              title="Portal Layanan" 
              description="Akses terpadu ke seluruh platform digital sekolah." 
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
              <div className="mb-12 space-y-2 text-center md:text-left">
                  <div className='flex items-center gap-3 text-primary justify-center md:justify-start'>
                      <span className="text-[9px] font-black uppercase tracking-[0.5em]">Akademik</span>
                      <div className='h-px w-12 bg-primary/30'></div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">Kompetensi Keahlian.</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                  {(areMajorsLoading ? Array(3).fill({}) : (majors || [])).slice(0, 3).map((major: any, i: number) => {
                    const Icon = iconMap[major.icon] || BookOpen;
                    return (
                         <Card key={major.id || i} className="group p-8 rounded-[2rem] border-white/5 bg-white/5 hover:bg-white/[0.08] transition-all duration-500 flex flex-col h-full border shadow-xl">
                              <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center mb-6 shadow-2xl shadow-primary/20 group-hover:rotate-6 transition-transform">
                                  <Icon size={24} />
                              </div>
                              <h3 className="text-lg font-black mb-3 tracking-tight uppercase">{major.name || 'PROGRAM STUDI'}</h3>
                              <p className="text-muted-foreground text-[11px] leading-relaxed mb-6 flex-grow font-medium opacity-70">
                                {major.description || 'Pelajari keterampilan mendalam yang dibutuhkan oleh standar industri saat ini.'}
                              </p>
                              <Button variant="link" onClick={() => setActiveTab('jurusan-kompetensi')} className="p-0 h-auto text-foreground font-black uppercase tracking-[0.3em] text-[8px] group-hover:text-primary transition-all">
                                SELENGKAPNYA <ChevronRight size={12} className="ml-1 transition-all" />
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
              <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                  <div className="space-y-2 text-center md:text-left">
                      <div className='flex items-center gap-3 text-primary justify-center md:justify-start'>
                          <span className="text-[9px] font-black uppercase tracking-[0.5em]">Informasi</span>
                          <div className='h-px w-12 bg-primary/30'></div>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">Berita Terkini.</h2>
                  </div>
                  <Button onClick={() => setActiveTab('berita-pengumuman')} variant="outline" className="rounded-xl h-10 px-6 font-black uppercase tracking-[0.2em] text-[8px] border-white/10 hover:bg-white/5 shadow-xl">
                      Arsip Berita
                  </Button>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {(areNewsLoading ? Array(3).fill({}) : (newsArticles || [])).slice(0, 3).map((news: any, i: number) => (
                    <div key={news.id || i} className="group cursor-pointer space-y-4" onClick={() => news.id && onSelectArticle(news.id)}>
                      <div className="aspect-[16/10] relative rounded-[1.5rem] overflow-hidden bg-muted border border-white/5 shadow-2xl">
                        {areNewsLoading ? <Skeleton className="w-full h-full" /> : (
                          <Image 
                            src={convertGoogleDriveLink(news.imageUrl || "https://picsum.photos/seed/news/800/500")} 
                            alt={news.title} 
                            fill 
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                          />
                        )}
                      </div>
                      <div className="space-y-2 px-1">
                        <div className="flex items-center gap-3 text-[7px] font-black text-primary uppercase tracking-[0.3em]">
                            {formatDateLabel(news.datePublished)} • {news.category || 'PENGUMUMAN'}
                        </div>
                        <h3 className="text-md font-black leading-snug group-hover:text-primary transition-colors tracking-tight uppercase italic line-clamp-2">{news.title || 'Informasi Penting Akademik'}</h3>
                        <p className='text-muted-foreground text-[10px] line-clamp-2 leading-relaxed font-medium opacity-60'>{news.content}</p>
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
            <div className="rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden bg-primary text-white shadow-3xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
              <div className="relative z-10 space-y-6">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter max-w-3xl mx-auto leading-tight italic uppercase">
                  Mulai Perjalanan <br/>Profesional Anda.
                </h2>
                <p className="text-white/80 text-sm md:text-lg max-w-lg mx-auto font-bold uppercase tracking-widest leading-relaxed">
                  Gabung bersama ribuan siswa yang siap membangun masa depan cemerlang.
                </p>
                <div className="flex flex-wrap gap-4 justify-center pt-4">
                  <Button onClick={() => setActiveTab('ppdb-online')} size="lg" variant="secondary" className="h-14 px-10 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all">
                      Daftar Sekarang
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('kontak')} className="h-14 px-10 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] border-white/20 hover:bg-white/10">
                      Bantuan
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
