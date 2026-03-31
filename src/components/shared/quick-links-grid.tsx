
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type QuickLink } from '@/lib/data';
import { Globe, Laptop, AppWindow, BookOpen, GraduationCap, Users, ExternalLink, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: { [key: string]: any } = {
  Globe, Laptop, AppWindow, BookOpen, GraduationCap, Users
};

type QuickLinksGridProps = {
  audience: 'public' | 'guru' | 'siswa';
  title?: string;
  description?: string;
};

/**
 * Komponen Grid untuk menampilkan Tautan Aplikasi berdasarkan audiens.
 * Dioptimalkan untuk kerapian tampilan PWA (Android).
 */
export function QuickLinksGrid({ audience, title = "Aplikasi & Layanan", description = "Akses cepat ke berbagai platform penunjang akademik dan operasional." }: QuickLinksGridProps) {
  const firestore = useFirestore();

  const linksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    try {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/quickLinks`);
      return query(
        ref, 
        where('audience', 'in', ['all', audience])
      );
    } catch (e) {
      console.warn("QuickLinks query inactive.");
      return null;
    }
  }, [firestore, audience]);

  const { data: links, isLoading, error } = useCollection<QuickLink>(linksQuery);

  if (error) return null;
  if (!isLoading && (!links || links.length === 0)) return null;

  return (
    <div className="space-y-8 sm:space-y-10 animate-fade-in">
      <div className="text-center md:text-left space-y-2">
        <div className='flex items-center gap-3 text-primary justify-center md:justify-start'>
            <Sparkles size={12} className='animate-pulse' />
            <span className="text-[9px] font-black uppercase tracking-[0.5em]">Digital Hub</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black font-headline tracking-tighter uppercase italic">{title}</h2>
        <p className="text-muted-foreground text-[10px] sm:text-sm font-medium max-w-2xl uppercase tracking-widest opacity-60">{description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-[2rem]" />
          ))
        ) : (
          links?.map((link) => {
            const Icon = iconMap[link.icon] || Globe;
            return (
              <a 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block"
              >
                <Card className="h-full rounded-[2rem] shadow-xl border-white/5 bg-white/5 backdrop-blur-xl hover:border-primary/20 hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-1 overflow-hidden border">
                  <CardHeader className="flex flex-row items-center gap-4 p-6 pb-3">
                    <div className="p-3.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg group-hover:rotate-6">
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">{link.title}</CardTitle>
                      <div className="flex items-center text-[7px] text-muted-foreground uppercase font-black tracking-widest mt-1 opacity-40">
                        Launch <ExternalLink size={8} className="ml-1" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <p className="text-[10px] text-muted-foreground leading-relaxed font-medium line-clamp-2 uppercase tracking-wider opacity-50">{link.description}</p>
                  </CardContent>
                </Card>
              </a>
            )
          })
        )}
      </div>
    </div>
  );
}
