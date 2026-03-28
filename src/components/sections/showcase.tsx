'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where, limit, orderBy } from 'firebase/firestore';
import { type PortfolioItem } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { ExternalLink, User, Code, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

const ShowcaseSection = () => {
  const firestore = useFirestore();
  
  const showcaseQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    try {
      // Mengambil karya siswa yang ditandai publik secara global
      return query(
        collectionGroup(firestore, 'portfolio'),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc'),
        limit(6)
      );
    } catch (e) {
      console.warn("Showcase query fallback activated:", e);
      return query(
        collectionGroup(firestore, 'portfolio'),
        where('isPublic', '==', true),
        limit(6)
      );
    }
  }, [firestore]);

  const { data: items, isLoading, error } = useCollection<PortfolioItem>(showcaseQuery);

  if (error) return null;

  return (
    <section className="py-32 max-w-7xl mx-auto px-6 animate-reveal">
      <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
        <div className="space-y-6">
            <div className='flex items-center gap-3 text-primary'>
                <Sparkles size={14} className='animate-pulse' />
                <span className="text-[10px] font-black uppercase tracking-[0.6em]">Inovasi Siswa</span>
                <div className='h-px w-20 bg-primary/30'></div>
            </div>
            <h2 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.8]">PAMERAN.<br/><span className='text-primary not-italic'>KARYA.</span></h2>
        </div>
        <p className="text-muted-foreground max-w-sm font-medium leading-relaxed opacity-60 uppercase text-[10px] tracking-[0.2em]">Kumpulan proyek inovatif dan solusi digital unggulan yang dikembangkan oleh siswa berbakat SMKS PGRI 2 Kedondong.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {isLoading && Array.from({length: 3}).map((_, i) => (
            <Card key={i} className="rounded-[3rem] overflow-hidden shadow-2xl h-[550px] border-white/5 bg-white/5">
                <Skeleton className="h-72 w-full" />
                <div className="p-10 space-y-6">
                    <Skeleton className='h-8 w-3/4'/>
                    <Skeleton className='h-24 w-full'/>
                </div>
            </Card>
        ))}
        
        {items?.map((item) => (
          <Card key={item.id} className="rounded-[3rem] shadow-2xl hover:shadow-primary/10 transition-all duration-1000 overflow-hidden group flex flex-col bg-white/5 border-white/5 border-2 hover:border-primary/20 scale-100 hover:scale-[1.02]">
            <div className="relative aspect-[4/5] overflow-hidden bg-black/40">
              <Image 
                  src={convertGoogleDriveLink(item.imageUrl || 'https://picsum.photos/seed/portfolio/800/1000')} 
                  alt={item.title} 
                  fill 
                  className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" 
                  unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-10 space-y-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                 <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-[0.4em]">
                    <User size={14} className='text-primary' /> {item.studentName || 'Siswa Kreator'}
                </div>
                <CardTitle className="text-4xl font-black tracking-tight leading-none uppercase italic text-white">{item.title}</CardTitle>
                
                <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100'>
                    <p className="text-white/60 text-xs line-clamp-3 mb-8 font-medium leading-relaxed tracking-wide">{item.description}</p>
                    {item.projectUrl && (
                        <Button asChild className="rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] h-14 px-8 shadow-3xl bg-primary text-white hover:bg-primary/90 w-full">
                            <a href={item.projectUrl} target="_blank" rel="noopener noreferrer">Kunjungi Proyek <ExternalLink className='ml-2 h-4 w-4' /></a>
                        </Button>
                    )}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {!isLoading && (!items || items.length === 0) && (
            <div className="col-span-full py-40 text-center bg-white/5 rounded-[4rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center space-y-8">
                <div className='w-24 h-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center animate-pulse'>
                    <Code size={48} />
                </div>
                <div className='space-y-3'>
                    <h3 className='text-3xl font-black text-foreground uppercase tracking-tighter italic'>Menunggu Terobosan</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto font-bold opacity-50 uppercase tracking-[0.3em] leading-loose">Karya inovasi siswa terbaik akan dipamerkan secara eksklusif di sini setelah proses kurasi digital.</p>
                </div>
            </div>
        )}
      </div>
    </section>
  );
};

export default ShowcaseSection;
