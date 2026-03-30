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
    <section className="py-24 max-w-7xl mx-auto px-6 animate-reveal">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div className="space-y-4">
            <div className='flex items-center gap-3 text-primary'>
                <Sparkles size={12} className='animate-pulse' />
                <span className="text-[9px] font-black uppercase tracking-[0.5em]">Inovasi Siswa</span>
                <div className='h-px w-16 bg-primary/30'></div>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-tight">PAMERAN.<br/><span className='text-primary not-italic'>KARYA.</span></h2>
        </div>
        <p className="text-muted-foreground max-w-xs font-medium leading-relaxed opacity-60 uppercase text-[9px] tracking-[0.2em]">Kumpulan proyek inovatif dan solusi digital unggulan yang dikembangkan oleh siswa berbakat.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading && Array.from({length: 3}).map((_, i) => (
            <Card key={i} className="rounded-[2.5rem] overflow-hidden shadow-2xl h-[500px] border-white/5 bg-white/5">
                <Skeleton className="h-64 w-full" />
                <div className="p-8 space-y-4">
                    <Skeleton className='h-6 w-3/4'/>
                    <Skeleton className='h-20 w-full'/>
                </div>
            </Card>
        ))}
        
        {items?.map((item) => (
          <Card key={item.id} className="rounded-[2.5rem] shadow-2xl hover:shadow-primary/10 transition-all duration-1000 overflow-hidden group flex flex-col bg-white/5 border-white/5 border-2 hover:border-primary/20 scale-100 hover:scale-[1.02]">
            <div className="relative aspect-[4/5] overflow-hidden bg-black/40">
              <Image 
                  src={convertGoogleDriveLink(item.imageUrl || 'https://picsum.photos/seed/portfolio/800/1000')} 
                  alt={item.title} 
                  fill 
                  className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" 
                  unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-8 space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                 <div className="flex items-center gap-2 text-[8px] font-black text-primary uppercase tracking-[0.3em]">
                    <User size={12} className='text-primary' /> {item.studentName || 'Siswa Kreator'}
                </div>
                <CardTitle className="text-2xl font-black tracking-tight leading-none uppercase italic text-white">{item.title}</CardTitle>
                
                <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100'>
                    <p className="text-white/60 text-[10px] line-clamp-2 mb-6 font-medium leading-relaxed tracking-wide">{item.description}</p>
                    {item.projectUrl && (
                        <Button asChild className="rounded-xl font-black uppercase tracking-[0.3em] text-[9px] h-12 px-6 shadow-2xl bg-primary text-white hover:bg-primary/90 w-full">
                            <a href={item.projectUrl} target="_blank" rel="noopener noreferrer">Kunjungi Proyek <ExternalLink className='ml-2 h-3.5 w-3.5' /></a>
                        </Button>
                    )}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {!isLoading && (!items || items.length === 0) && (
            <div className="col-span-full py-32 text-center bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center space-y-6">
                <div className='w-20 h-20 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center animate-pulse'>
                    <Code size={36} />
                </div>
                <div className='space-y-2'>
                    <h3 className='text-2xl font-black text-foreground uppercase tracking-tighter italic'>Menunggu Terobosan</h3>
                    <p className="text-[9px] text-muted-foreground max-w-xs mx-auto font-bold opacity-50 uppercase tracking-[0.3em] leading-loose">Karya inovasi siswa terbaik akan dipamerkan secara eksklusif di sini.</p>
                </div>
            </div>
        )}
      </div>
    </section>
  );
};

export default ShowcaseSection;