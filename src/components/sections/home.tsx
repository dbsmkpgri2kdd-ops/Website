
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
          <section key="hero" className="relative min-h-[80dvh] flex items-center overflow-hidden bg-white">
            <div className="absolute inset-0 z-0">
               <Image
                src="https://images.unsplash.com/photo-1523050853063-bd8012fbb230?q=80&w=2070"
                alt="School"
                fill
                className="object-cover opacity-5"
                priority
                sizes="100vw"
                data-ai-hint="bright university"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-white via-white/95 to-primary/5"></div>
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-20">
                <div className="max-w-3xl space-y-8 animate-reveal">
                  <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider uppercase'>
                    <Sparkles size={12} />
                    <span>Pusat Unggulan Vokasi 2025</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                    {schoolData?.heroTitle || "Wujudkan Masa Depan"} <br/><span className="text-primary">Vokasi yang Cemerlang.</span>
                  </h1>
                  <p className="text-base md:text-xl text-slate-600 max-w-xl font-medium leading-relaxed">
                    {schoolData?.heroSubtitle || "Mempersiapkan tenaga ahli profesional yang siap bersaing di era industri 4.0 melalui kurikulum berbasis kompetensi terapan."}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button onClick={() => setActiveTab('ppdb-online')} size="lg" className="h-12 px-8 rounded-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                        Daftar Siswa Baru <ArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                    <Button onClick={() => setActiveTab('profil-sejarah')} variant="outline" size="lg" className="h-12 px-8 rounded-lg font-bold">
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
          <section key="partners" className="bg-slate-50/50 py-12 border-y border-border">
            <div className="max-w-7xl mx-auto px-6 items-center grid lg:grid-cols-4 gap-10">
                <div className="lg:col-span-1">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Dipercaya Oleh</p>
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
          <section key="apps" className="max-w-7xl mx-auto px-6 py-20">
            <QuickLinksGrid 
              audience="public" 
              title="Portal Layanan Digital" 
              description="Akses satu pintu untuk seluruh kebutuhan administratif dan akademik civitas." 
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
              <div className="mb-12 text-center md:text-left space-y-3">
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Program Keahlian</h2>
                  <p className="text-muted-foreground text-sm max-w-2xl font-medium">Pilihan jurusan yang dirancang khusus untuk memenuhi standar keahlian industri global.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                  {(areMajorsLoading ? Array(3).fill({}) : (majors || [])).slice(0, 3).map((major: any, i: number) => {
                    const Icon = iconMap[major.icon] || BookOpen;
                    return (
                         <Card key={major.id || i} className="p-8 rounded-2xl border-border bg-white hover:border-primary/30 transition-all duration-300 flex flex-col h-full shadow-sm hover:shadow-md">
                              <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-6">
                                  <Icon size={24} />
                              </div>
                              <h3 className="text-lg font-bold mb-3 text-slate-900">{major.name || 'Bidang Studi'}</h3>
                              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow font-medium">
                                {major.description || 'Deskripsi program keahlian yang mendalam akan segera tersedia.'}
                              </p>
                              <Button variant="link" onClick={() => setActiveTab('jurusan-kompetensi')} className="p-0 h-auto text-primary font-bold text-xs">
                                Pelajari Selengkapnya <ChevronRight size={14} className="ml-1" />
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
          <div key="showcase" className="bg-slate-50 py-20 border-y border-border">
            <ShowcaseSection />
          </div>
        );

      case 'news':
        if (settings?.showNews === false) return null;
        return (
          <section key="news" className="max-w-7xl mx-auto px-6 py-20">
              <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                  <div className="space-y-3">
                      <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Berita Terkini</h2>
                      <p className="text-muted-foreground text-sm font-medium">Ikuti perkembangan terbaru dan info pengumuman resmi dari sekolah.</p>
                  </div>
                  <Button onClick={() => setActiveTab('berita-pengumuman')} variant="outline" className="rounded-lg h-10 px-6 font-bold text-xs">
                      Lihat Semua Berita
                  </Button>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {(areNewsLoading ? Array(3).fill({}) : (newsArticles || [])).slice(0, 3).map((news: any, i: number) => (
                    <div key={news.id || i} className="group cursor-pointer space-y-4" onClick={() => news.id && onSelectArticle(news.id)}>
                      <div className="aspect-video relative rounded-xl overflow-hidden bg-muted border border-border shadow-sm">
                        {areNewsLoading ? <Skeleton className="w-full h-full" /> : (
                          <Image 
                            src={convertGoogleDriveLink(news.imageUrl || "https://picsum.photos/seed/news/800/500")} 
                            alt={news.title} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-all duration-500" 
                          />
                        )}
                      </div>
                      <div className="space-y-2 px-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-wider">
                            <span>{formatDateLabel(news.datePublished)}</span>
                            <span className="opacity-30">•</span>
                            <span>{news.category || 'Warta'}</span>
                        </div>
                        <h3 className="text-base font-bold leading-tight group-hover:text-primary transition-colors text-slate-900 line-clamp-2">{news.title || 'Informasi Akademik Sekolah'}</h3>
                        <p className='text-slate-500 text-xs line-clamp-2 leading-relaxed font-medium'>{news.content}</p>
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
            <div className="rounded-3xl p-10 md:p-20 text-center relative overflow-hidden bg-primary shadow-xl">
              <div className="absolute inset-0 bg-white/5 pattern-dots"></div>
              <div className="relative z-10 space-y-8">
                <h2 className="text-3xl md:text-5xl font-bold text-white max-w-3xl mx-auto leading-tight">
                  Siap Bergabung dengan <br/>Generasi Unggul?
                </h2>
                <p className="text-white/80 text-base md:text-lg max-w-lg mx-auto font-medium leading-relaxed">
                  Pendaftaran tahun ajaran 2025/2026 telah dibuka. Mari melangkah bersama SMKS PGRI 2 Kedondong.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button onClick={() => setActiveTab('ppdb-online')} size="lg" variant="secondary" className="h-14 px-10 rounded-xl font-bold shadow-xl hover:scale-105 transition-all text-primary">
                      Daftar Sekarang
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('kontak')} className="h-14 px-10 rounded-xl font-bold border-white/20 text-white hover:bg-white/10">
                      Butuh Bantuan?
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
      <div className="pb-20 animate-reveal tech-mesh">
        {sectionOrder.map(sectionId => renderSection(sectionId))}
      </div>
  );
};

export default HomeSection;
