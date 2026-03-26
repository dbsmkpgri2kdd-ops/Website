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
  
  const formatDate = (date: any) => {
    if (!date) return '';
    try {
      const jsDate = date.toDate ? date.toDate() : new Date(date);
      return format(jsDate, "d MMM yyyy", { locale: idLocale });
    } catch (e) {
      return '';
    }
  }

  return (
      <div className="animate-fade-in space-y-24 md:space-y-40 pb-20">
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] -mt-20 flex items-center overflow-hidden bg-[#0a0c1b]">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0a0c1b] via-[#0a0c1b]/80 to-transparent"></div>
          <Image
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
              alt="School environment"
              fill
              className="object-cover object-center scale-105"
              priority
            />
          <div className="relative z-20 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-10">
                <div className="space-y-4">
                  <Badge className="bg-primary/20 text-primary border-primary/30 px-5 py-2 rounded-full font-black text-xs backdrop-blur-md uppercase tracking-[0.2em]">Institutional Excellence</Badge>
                  <h1 className="text-5xl md:text-7xl font-black text-white font-headline leading-[1.1] tracking-tighter">
                    Membangun Masa Depan <br/><span className='text-primary'>Generasi Vokasi.</span>
                  </h1>
                </div>
                <p className="text-xl text-gray-300 max-w-xl leading-relaxed font-medium">
                  Menyiapkan lulusan yang kompeten, berdaya saing global, dan memiliki integritas tinggi untuk memenuhi tantangan industri masa depan.
                </p>
                <div className="flex flex-wrap gap-6">
                  <Button size="lg" onClick={() => setActiveTab('ppdb-online')} className="h-16 px-12 rounded-full font-black text-xl shadow-xl shadow-primary/20 hover:scale-105 transition-all duration-300">
                      Daftar PPDB <ArrowRight className='ml-2 h-6 w-6' />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => setActiveTab('profil-sejarah')} className="h-16 px-12 rounded-full font-bold text-xl text-white border-white/20 hover:bg-white/10 backdrop-blur-sm">
                      Profil Sekolah
                  </Button>
                </div>
              </div>
          </div>
        </section>

        {/* TRUST BAR */}
        {!arePartnersLoading && partners && partners.length > 0 && (
          <section className="-mt-32 relative z-30 max-w-7xl mx-auto px-6">
             <div className="bg-card shadow-2xl rounded-[3rem] p-8 md:p-12 border border-primary/5">
               <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="shrink-0 text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Global Partnership</p>
                    <h3 className="text-xl font-black font-headline tracking-tight">Mitra Strategis</h3>
                  </div>
                  <div className="flex-1 w-full overflow-hidden">
                    <PartnersSlider partners={partners} />
                  </div>
               </div>
             </div>
          </section>
        )}

        {/* ABOUT SECTION */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className='space-y-8'>
              <div className="space-y-4">
                <h2 className='text-5xl font-black font-headline tracking-tighter leading-tight'>Pendidikan Vokasi <br/><span className='text-primary'>Berstandar Industri.</span></h2>
                <div className="w-20 h-2 bg-primary rounded-full"></div>
              </div>
               {isSchoolDataLoading ? (
                    <div className='space-y-4 mt-4'>
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </div>
               ) : (
                <div className="text-muted-foreground text-xl leading-relaxed font-medium">
                    {schoolData?.history ? (schoolData.history.length > 300 ? schoolData.history.substring(0, 300) + '...' : schoolData.history) : 'Selamat datang di situs resmi sekolah kami.'}
                </div>
               )}
              <div className="grid grid-cols-2 gap-8 pt-4">
                 <div className="space-y-2">
                    <p className="text-4xl font-black text-primary font-headline tracking-tighter">{schoolData?.studentCount || '1200'}+</p>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Siswa Aktif</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-4xl font-black text-primary font-headline tracking-tighter">{schoolData?.industryPartnerCount || '100'}+</p>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Mitra DUDI</p>
                 </div>
              </div>
            </div>
            <div className="relative group">
               <div className="absolute inset-0 bg-primary/10 rounded-[3rem] rotate-3 scale-105 group-hover:rotate-0 transition-transform duration-700"></div>
               <div className="relative aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                  <Image 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                    alt="School" 
                    fill 
                    className="object-cover"
                  />
               </div>
            </div>
          </div>
        </section>
        
        {/* MAJORS GRID */}
        <section className="py-32 bg-muted/30 relative">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-24 space-y-4">
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-primary">Academic Paths</p>
                    <h2 className="text-5xl font-black font-headline tracking-tighter">Kompetensi <span className='text-primary'>Keahlian</span></h2>
                </div>
                <div className="grid md:grid-cols-3 gap-10">
                    {areMajorsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-[400px] rounded-[3rem]" />
                      ))
                    ) : (
                      majors?.slice(0, 3).map((major) => {
                        const Icon = iconMap[major.icon] || BookOpen;
                        return (
                             <Card key={major.id} className="p-10 rounded-[3rem] shadow-sm hover:shadow-2xl bg-card border-none flex flex-col group overflow-hidden relative">
                                  <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center mb-10">
                                      <Icon size={40} />
                                  </div>
                                  <h3 className="text-3xl font-black font-headline mb-6 group-hover:text-primary transition-colors tracking-tight leading-tight">{major.name}</h3>
                                  <p className="text-muted-foreground text-lg leading-relaxed font-medium flex-grow mb-8">{major.description}</p>
                                  <Button variant="outline" className="rounded-full font-black border-primary/20 hover:bg-primary hover:text-white" onClick={() => setActiveTab('jurusan-kompetensi')}>
                                    Lihat Kurikulum
                                  </Button>
                             </Card>
                        )
                      })
                    )}
                </div>
            </div>
        </section>

        {/* LATEST UPDATES */}
        <section className="py-32 bg-[#0a0c1b] text-white overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                    <div className='space-y-4'>
                        <p className="text-xs font-black uppercase tracking-[0.4em] text-primary">News & Press</p>
                        <h2 className="text-5xl font-black font-headline tracking-tighter leading-tight">Berita <span className='text-primary'>Terkini</span></h2>
                    </div>
                    <Button size="lg" variant="outline" onClick={() => setActiveTab('berita-pengumuman')} className='rounded-full text-white border-white/20 hover:bg-white/10'>Lihat Semua</Button>
                </div>
                <div className="grid md:grid-cols-3 gap-12">
                  {areNewsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-[500px] rounded-[3rem] bg-white/5" />
                    ))
                  ) : (
                    newsArticles?.map((news) => (
                      <Card key={news.id} className="rounded-[3rem] overflow-hidden shadow-2xl group cursor-pointer border-none bg-white/[0.03] backdrop-blur-sm" onClick={() => onSelectArticle(news.id)}>
                        <div className="p-0 h-72 overflow-hidden relative">
                          <Image 
                            src={convertGoogleDriveLink(news.imageUrl)} 
                            alt={news.title} 
                            fill
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            unoptimized
                          />
                        </div>
                        <CardContent className="p-10 space-y-6">
                          <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                             <Calendar size={14}/> {formatDate(news.datePublished)}
                          </div>
                          <h3 className="text-2xl font-black font-headline leading-tight group-hover:text-primary transition-colors line-clamp-2 tracking-tight">{news.title}</h3>
                        </CardContent>
                      </Card>
                    ))
                  )}
              </div>
            </div>
        </section>

        {/* CTA FOOTER */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="bg-[#0a0c1b] text-white rounded-[4rem] p-12 md:p-32 text-center flex flex-col items-center relative overflow-hidden shadow-2xl">
            <h2 className="text-5xl md:text-7xl font-black font-headline mb-10 leading-[1] tracking-tighter relative z-10">Siap Menjadi <br/> <span className='text-primary'>Ahli di Bidangnya?</span></h2>
            <div className="flex flex-wrap gap-8 justify-center relative z-10">
                <Button size="lg" className="h-20 px-16 rounded-full font-black text-2xl shadow-2xl" onClick={() => setActiveTab('ppdb-online')}>
                    Daftar Sekarang
                </Button>
            </div>
          </div>
        </section>
      </div>
  );
};

export default HomeSection;
