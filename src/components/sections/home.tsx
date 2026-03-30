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
          <section key="hero" className="relative h-[100dvh] -mt-20 flex items-center overflow-hidden">
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
                <div className="max-w-4xl space-y-12 animate-reveal">
                  <div className='inline-flex items-center gap-3 px-5 py-2 rounded-xl bg-white/5 border border-white/5 text-primary shadow-2xl backdrop-blur-xl'>
                    <Sparkles size={14} className='animate-pulse' />
                    <span className='text-[10px] font-black uppercase tracking-[0.4em]'>Pendidikan Berbasis Inovasi</span>
                  </div>
                  <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] text-foreground italic">
                    {schoolData?.heroTitle || "MASA DEPAN"} <br/><span className="text-primary not-italic">UNGGUL.</span>
                  </h1>
                  <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl font-medium leading-relaxed opacity-80">
                    {schoolData?.heroSubtitle || "Membangun kompetensi keahlian berstandar industri melalui ekosistem digital yang canggih."}
                  </p>
                  <div className="flex flex-wrap gap-6 pt-4">
                    <Button onClick={() => setActiveTab('ppdb-online')} size="lg" className="h-16 px-12 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-3xl glow-primary hover:scale-105 transition-all">
                        Pendaftaran 2025 <ArrowRight className='ml-2 h-5 w-5' />
                    </Button>
                    <Button onClick={() => setActiveTab('profil-sejarah')} variant="ghost" size="lg" className="h-16 px-12 rounded-2xl font-black text-xs uppercase tracking-[0.3em] border border-white/5 hover:bg-white/5">
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
          <section key="partners" className="max-w-7xl mx-auto px-6 py-20 border-y border-white/5 items-center grid lg:grid-cols-4 gap-12">
            <div className="lg:col-span-1 space-y-3">
              <h3 className="text-[9px] font-black text-primary uppercase tracking-[0.5em]">Jejak Industri</h3>
              <p className="text-3xl font-black tracking-tighter uppercase italic">Mitra Strategis</p>
            </div>
            <div className="lg:col-span-3 opacity-40 hover:opacity-100 transition-all duration-1000 grayscale hover:grayscale-0">
              <PartnersSlider partners={partners || []} />
            </div>
          </section>
        );

      case 'apps':
        return (
          <section key="apps" className="max-w-7xl mx-auto px-6 py-20">
            <QuickLinksGrid 
              audience="public" 
              title="Portal Layanan Digital" 
              description="Akses cepat ke berbagai aplikasi penunjang akademik dan informasi sekolah." 
            />
          </section>
        );

      case 'stats':
        if (settings?.showStats === false) return null;
        return (
          <section key="stats" className="max-w-7xl mx-auto px-6 py-20">
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
          <section key="majors" className="max-w-7xl mx-auto px-6 py-20">
              <div className="mb-24 space-y-4">
                  <div className='flex items-center gap-3 text-primary'>
                      <span className="text-[10px] font-black uppercase tracking-[0.6em]">Jalur Akademik</span>
                      <div className='h-px w-20 bg-primary/30'></div>
                  </div>
                  <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic">Jurusan.</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                  {(areMajorsLoading ? Array(3).fill({}) : (majors || [])).slice(0, 3).map((major: any, i: number) => {
                    const Icon = iconMap[major.icon] || BookOpen;
                    return (
                         <Card key={major.id || i} className="group p-12 rounded-[3rem] border-white/5 bg-white/5 hover:bg-white/[0.08] transition-all duration-700 relative overflow-hidden flex flex-col h-full border shadow-2xl">
                              <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-10 shadow-3xl shadow-primary/20 group-hover:rotate-6 transition-transform">
                                  <Icon size={32} />
                              </div>
                              <h3 className="text-2xl font-black mb-6 tracking-tight uppercase">{major.name || 'PROGRAM INTI'}</h3>
                              <p className="text-muted-foreground text-sm leading-relaxed mb-12 flex-grow font-medium opacity-70">
                                {major.description || 'Menguasai keterampilan teknis yang dibutuhkan industri dengan standar peralatan profesional.'}
                              </p>
                              <Button variant="link" onClick={() => setActiveTab('jurusan-kompetensi')} className="p-0 h-auto text-foreground font-black uppercase tracking-[0.3em] text-[10px] group-hover:text-primary transition-all">
                                SELENGKAPNYA <ChevronRight size={16} className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
          <section key="news" className="max-w-7xl mx-auto px-6 py-20">
              <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                  <div className="space-y-4">
                      <div className='flex items-center gap-3 text-primary'>
                          <span className="text-[10px] font-black uppercase tracking-[0.6em]">Pembaruan</span>
                          <div className='h-px w-20 bg-primary/30'></div>
                      </div>
                      <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic">Berita.</h2>
                  </div>
                  <Button onClick={() => setActiveTab('berita-pengumuman')} variant="outline" className="rounded-xl h-14 px-10 font-black uppercase tracking-[0.3em] text-[10px] border-white/10 hover:bg-white/5 shadow-2xl">
                      Lihat Arsip
                  </Button>
              </div>
              <div className="grid md:grid-cols-3 gap-12">
                {(areNewsLoading ? Array(3).fill({}) : (newsArticles || [])).slice(0, 3).map((news: any, i: number) => (
                    <div key={news.id || i} className="group cursor-pointer space-y-8" onClick={() => news.id && onSelectArticle(news.id)}>
                      <div className="aspect-[16/11] relative rounded-[2.5rem] overflow-hidden bg-muted border border-white/5 shadow-3xl">
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
                      <div className="space-y-4 px-4">
                        <div className="flex items-center gap-4 text-[9px] font-black text-primary uppercase tracking-[0.4em]">
                            {formatDateLabel(news.datePublished)} • {news.category || 'INFO'}
                        </div>
                        <h3 className="text-2xl font-black leading-tight group-hover:text-primary transition-colors tracking-tighter uppercase italic">{news.title || 'Inovasi Digital Pendidikan Vokasi'}</h3>
                        <p className='text-muted-foreground text-sm line-clamp-3 leading-relaxed font-medium opacity-60'>{news.content}</p>
                      </div>
                    </div>
                ))}
            </div>
          </section>
        );

      case 'cta':
        if (settings?.showCta === false) return null;
        return (
          <section key="cta" className="max-w-7xl mx-auto px-6 py-20">
            <div className="rounded-[4rem] p-20 md:p-32 text-center relative overflow-hidden bg-primary text-white shadow-[0_50px_100px_-20px_rgba(var(--primary),0.3)]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse"></div>
              <div className="relative z-10 space-y-12">
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter max-w-5xl mx-auto leading-[0.9] italic">
                  MEMBENTUK <br/>GENERASI AHLI.
                </h2>
                <p className="text-white/70 text-lg md:text-2xl max-w-2xl mx-auto font-bold uppercase tracking-widest leading-relaxed">
                  Penerimaan siswa baru tahun ajaran 2025 telah dibuka. Amankan jalur karir profesional Anda sekarang.
                </p>
                <div className="flex flex-wrap gap-8 justify-center pt-8">
                  <Button onClick={() => setActiveTab('ppdb-online')} size="lg" variant="secondary" className="h-20 px-16 rounded-2xl font-black text-sm uppercase tracking-[0.4em] shadow-3xl hover:scale-105 transition-all">
                      Daftar Sekarang
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('kontak')} className="h-20 px-16 rounded-2xl font-black text-sm uppercase tracking-[0.4em] border-white/20 hover:bg-white/10">
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
      <div className="pb-32 animate-reveal tech-mesh">
        {sectionOrder.map(sectionId => renderSection(sectionId))}
      </div>
  );
};

export default HomeSection;