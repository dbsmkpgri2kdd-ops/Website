
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type NewsArticle, type Major, type School, type NavLink, type IndustryPartner, SCHOOL_DATA_ID } from '@/lib/data';
import { ArrowRight, BookOpen, Calendar, Computer, BarChart4, Film, Wrench, Bike } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { convertGoogleDriveLink } from '@/lib/utils';
import PartnersSlider from '@/components/sections/home-partners-slider';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { QuickLinksGrid } from '@/components/shared/quick-links-grid';

type HomeSectionProps = {
  setActiveTab: (tab: NavLink) => void;
  onSelectArticle: (articleId: string) => void;
};

const iconMap: { [key: string]: React.ElementType } = {
  Computer, BarChart4, Film, Wrench, Bike, BookOpen,
};

const HomeSection = ({ setActiveTab, onSelectArticle }: HomeSectionProps) => {
  const firestore = useFirestore();

  const schoolDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'schools', SCHOOL_DATA_ID);
  }, [firestore]);
  const { data: schoolData, isLoading: isSchoolDataLoading } = useDoc<School>(schoolDocRef);

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
  const { data: partners, isLoading: arePartnersLoading } = useCollection<IndustryPartner>(partnersQuery);
  
  const formatDateLabel = (date: any) => {
    if (!date) return '';
    try {
      const jsDate = date.toDate ? date.toDate() : new Date(date);
      return format(jsDate, "d MMM yyyy", { locale: idLocale });
    } catch (e) {
      return '';
    }
  }

  const layout = schoolData?.layoutSettings || {
    showHero: true,
    showPartners: true,
    showStats: true,
    showMajors: true,
    showNews: true,
    showCta: true,
  };

  return (
      <div className="animate-fade-in space-y-12 md:space-y-40 pb-20 overflow-x-hidden">
        {/* Hero Section */}
        {layout.showHero && (
          <section className="relative min-h-[80vh] md:min-h-[90vh] -mt-20 flex items-center overflow-hidden bg-[#0a0c1b]">
            <div className="absolute inset-0 z-10 bg-gradient-to-b md:bg-gradient-to-r from-[#0a0c1b] via-[#0a0c1b]/80 to-transparent"></div>
            <Image
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
                alt="School environment"
                fill
                className="object-cover object-center scale-105 opacity-60 md:opacity-100"
                priority
                data-ai-hint="school students"
              />
            <div className="relative z-20 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-8 items-center pt-24 md:pt-0">
                <div className="space-y-6 md:space-y-10 text-center lg:text-left">
                  <div className="space-y-3 md:space-y-4">
                    <Badge className="bg-primary/20 text-primary border-primary/30 px-4 md:px-5 py-1.5 md:py-2 rounded-full font-black text-[10px] md:text-xs backdrop-blur-md uppercase tracking-[0.2em]">Institutional Excellence</Badge>
                    <h1 className="text-3xl md:text-7xl font-black text-white font-headline leading-[1.1] tracking-tighter">
                      Membangun Masa Depan <br/><span className='text-primary'>Generasi Vokasi.</span>
                    </h1>
                  </div>
                  <p className="text-base md:text-xl text-gray-300 max-w-xl leading-relaxed font-medium mx-auto lg:mx-0">
                    Menyiapkan lulusan yang kompeten, berdaya saing global, dan memiliki integritas tinggi.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center lg:justify-start">
                    <button onClick={() => setActiveTab('ppdb-online')} className="bg-primary text-white h-14 md:h-16 px-8 md:px-12 rounded-full font-black text-base md:text-xl shadow-xl shadow-primary/20 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                        Daftar PPDB <ArrowRight className='h-5 w-5 md:h-6 md:w-6' />
                    </button>
                    <button onClick={() => setActiveTab('profil-sejarah')} className="h-14 md:h-16 px-8 md:px-12 rounded-full font-bold text-base md:text-xl text-white border border-white/20 hover:bg-white/10 backdrop-blur-sm transition-all">
                        Profil Sekolah
                    </button>
                  </div>
                </div>
            </div>
          </section>
        )}

        {/* Strategic Partners Slider */}
        {layout.showPartners && !arePartnersLoading && partners && partners.length > 0 && (
          <section className="-mt-12 md:-mt-32 relative z-30 max-w-7xl mx-auto px-4 md:px-6">
             <div className="bg-card shadow-2xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 border border-primary/5">
               <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                  <div className="shrink-0 text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Global Partnership</p>
                    <h3 className="text-lg md:text-xl font-black font-headline tracking-tight">Mitra Strategis</h3>
                  </div>
                  <div className="flex-1 w-full overflow-hidden">
                    <PartnersSlider partners={partners} />
                  </div>
               </div>
             </div>
          </section>
        )}

        {/* Quick Links Section (PUBLIC) */}
        <section className="max-w-7xl mx-auto px-6">
          <QuickLinksGrid 
            audience="public" 
            title="Layanan & Tautan Cepat"
            description="Akses mudah ke berbagai platform layanan informasi sekolah kami."
          />
        </section>

        {/* Welcome Section */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-20 items-center">
            <div className='space-y-6 md:space-y-8 order-2 lg:order-1'>
              <div className="space-y-3 md:space-y-4">
                <h2 className='text-3xl md:text-5xl font-black font-headline tracking-tighter leading-tight'>Pendidikan Vokasi <br/><span className='text-primary'>Berstandar Industri.</span></h2>
                <div className="w-16 md:w-20 h-1.5 md:h-2 bg-primary rounded-full"></div>
              </div>
               {isSchoolDataLoading ? (
                    <div className='space-y-4 mt-4'>
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </div>
               ) : (
                <div className="text-muted-foreground text-base md:text-xl leading-relaxed font-medium">
                    {schoolData?.history ? (schoolData.history.length > 300 ? schoolData.history.substring(0, 300) + '...' : schoolData.history) : 'Selamat datang di situs resmi sekolah kami.'}
                </div>
               )}
              {layout.showStats && (
                <div className="grid grid-cols-2 gap-6 md:gap-8 pt-2">
                  <div className="space-y-1 md:space-y-2">
                      <p className="text-3xl md:text-4xl font-black text-primary font-headline tracking-tighter">{schoolData?.studentCount || '1200'}+</p>
                      <p className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest">Siswa Aktif</p>
                  </div>
                  <div className="space-y-1 md:space-y-2">
                      <p className="text-3xl md:text-4xl font-black text-primary font-headline tracking-tighter">{schoolData?.industryPartnerCount || '100'}+</p>
                      <p className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest">Mitra DUDI</p>
                  </div>
                </div>
              )}
            </div>
            <div className="relative group mt-6 md:mt-0 order-1 lg:order-2">
               <div className="absolute inset-0 bg-primary/10 rounded-[2rem] md:rounded-[3rem] rotate-3 scale-105 group-hover:rotate-0 transition-transform duration-700"></div>
               <div className="relative aspect-square md:aspect-[4/5] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl">
                  <Image 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                    alt="School" 
                    fill 
                    className="object-cover"
                    data-ai-hint="learning classroom"
                  />
               </div>
            </div>
          </div>
        </section>
        
        {/* Majors Section */}
        {layout.showMajors && (
          <section className="py-16 md:py-32 bg-muted/30 relative">
              <div className="max-w-7xl mx-auto px-6 relative z-10">
                  <div className="text-center mb-10 md:mb-24 space-y-3 md:space-y-4">
                      <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary">Academic Paths</p>
                      <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter">Kompetensi <span className='text-primary'>Keahlian</span></h2>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6 md:gap-10">
                      {areMajorsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-[250px] md:h-[400px] rounded-[2rem] md:rounded-[3rem]" />
                        ))
                      ) : (
                        majors?.slice(0, 3).map((major) => {
                          const Icon = iconMap[major.icon] || BookOpen;
                          return (
                               <Card key={major.id} className="p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm hover:shadow-2xl bg-card border-none flex flex-col group overflow-hidden relative">
                                    <div className="w-14 h-14 md:w-20 md:h-20 bg-primary text-white rounded-2xl md:rounded-3xl flex items-center justify-center mb-6">
                                        <Icon className="w-8 h-8 md:w-10 md:h-10" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black font-headline mb-4 group-hover:text-primary transition-colors tracking-tight leading-tight">{major.name}</h3>
                                    <p className="text-muted-foreground text-sm md:text-lg leading-relaxed font-medium flex-grow mb-6">{major.description}</p>
                                    <button onClick={() => setActiveTab('jurusan-kompetensi')} className="w-full md:w-fit rounded-full font-black border border-primary/20 hover:bg-primary hover:text-white px-6 py-2.5 transition-all text-sm">
                                      Lihat Kurikulum
                                    </button>
                               </Card>
                          )
                        })
                      )}
                  </div>
              </div>
          </section>
        )}

        {/* News Section */}
        {layout.showNews && (
          <section className="py-16 md:py-32 bg-[#0a0c1b] text-white overflow-hidden relative">
              <div className="max-w-7xl mx-auto px-6 relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-20 gap-6 md:gap-8">
                      <div className='space-y-3 md:space-y-4'>
                          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary">News & Press</p>
                          <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter leading-tight">Berita <span className='text-primary'>Terkini</span></h2>
                      </div>
                      <button onClick={() => setActiveTab('berita-pengumuman')} className='w-full md:w-fit rounded-full text-white border border-white/20 hover:bg-white/10 px-8 py-3 font-bold transition-all text-sm'>Lihat Semua Berita</button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                    {areNewsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-[350px] md:h-[500px] rounded-[2rem] md:rounded-[3rem] bg-white/5" />
                      ))
                    ) : (
                      newsArticles?.map((news) => (
                        <Card key={news.id} className="rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl group cursor-pointer border-none bg-white/[0.03] backdrop-blur-sm" onClick={() => onSelectArticle(news.id)}>
                          <div className="p-0 h-48 md:h-72 overflow-hidden relative">
                            <Image 
                              src={convertGoogleDriveLink(news.imageUrl)} 
                              alt={news.title} 
                              fill
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              unoptimized
                            />
                          </div>
                          <CardContent className="p-6 md:p-10 space-y-4">
                            <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                               <Calendar size={12}/> {formatDateLabel(news.datePublished)}
                            </div>
                            <h3 className="text-lg md:text-2xl font-black font-headline leading-tight group-hover:text-primary transition-colors line-clamp-2 tracking-tight">{news.title}</h3>
                          </CardContent>
                        </Card>
                      ))
                    )}
                </div>
              </div>
          </section>
        )}

        {/* CTA Section */}
        {layout.showCta && (
          <section className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
            <div className="bg-[#0a0c1b] text-white rounded-[2rem] md:rounded-[4rem] p-10 md:p-32 text-center flex flex-col items-center relative overflow-hidden shadow-2xl">
              <h2 className="text-3xl md:text-7xl font-black font-headline mb-8 md:mb-10 leading-[1.1] tracking-tighter relative z-10">Siap Menjadi <br/> <span className='text-primary'>Ahli di Bidangnya?</span></h2>
              <div className="flex flex-wrap gap-6 justify-center relative z-10 w-full md:w-auto">
                  <button onClick={() => setActiveTab('ppdb-online')} className="w-full md:w-auto bg-primary text-white h-16 md:h-20 px-10 md:px-16 rounded-full font-black text-lg md:text-2xl shadow-2xl hover:scale-105 transition-all">
                      Daftar Sekarang
                  </button>
              </div>
            </div>
          </section>
        )}
      </div>
  );
};

export default HomeSection;
