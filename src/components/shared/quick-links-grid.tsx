'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type QuickLink } from '@/lib/data';
import { Globe, Laptop, AppWindow, BookOpen, GraduationCap, Users, ExternalLink, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const iconMap: { [key: string]: any } = {
  Globe, Laptop, AppWindow, BookOpen, GraduationCap, Users
};

type QuickLinksGridProps = {
  audience: 'public' | 'guru' | 'siswa';
  title?: string;
  description?: string;
};

/**
 * Komponen Grid Layanan Digital v3.8 (Mobile-App style)
 * Dioptimalkan untuk mode PWA (3-4 kolom pada perangkat seluler).
 * Menonjolkan konsep Clean White, Royal Blue, dan Vibrant Yellow.
 */
export function QuickLinksGrid({ audience, title = "Layanan Digital", description = "Akses satu pintu untuk seluruh kebutuhan administratif dan akademik civitas." }: QuickLinksGridProps) {
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

  const renderIcon = (iconStr: string) => {
    const isFontAwesome = iconStr.includes('fa-');
    return (
      <div className="p-3 md:p-4 rounded-2xl bg-primary text-white shadow-xl glow-primary w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-500">
        {isFontAwesome ? (
          <i className={cn(iconStr, "text-xl md:text-2xl")} />
        ) : (
          (() => {
            const IconComp = iconMap[iconStr] || Globe;
            return <IconComp className="w-6 h-6 md:w-8 md:h-8" />;
          })()
        )}
      </div>
    );
  };

  return (
    <div className="animate-reveal">
      <div className="mb-10 md:mb-16 text-center md:text-left space-y-3">
        <div className='flex items-center gap-3 text-primary justify-center md:justify-start'>
            <Sparkles size={14} className='animate-pulse text-accent' />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary">Academic Hub Services</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tighter uppercase italic font-headline">{title}</h2>
        <p className="text-slate-600 text-[10px] md:text-sm max-w-2xl font-bold opacity-80 uppercase tracking-widest leading-relaxed">{description}</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-10">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 md:h-56 rounded-[2rem] md:rounded-[3rem]" />
          ))
        ) : (
          links?.map((link) => {
            return (
              <a 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group block"
              >
                <Card className="h-full rounded-[2rem] md:rounded-[3.5rem] shadow-xl md:shadow-2xl border-slate-100 bg-white hover:border-primary/20 hover:shadow-primary/10 transition-all duration-700 hover:-translate-y-2 overflow-hidden border-2">
                  <CardHeader className="flex flex-col items-center gap-4 md:gap-6 p-4 md:p-10 pb-3 md:pb-6 text-center">
                    {renderIcon(link.icon)}
                    <div className="w-full">
                      <CardTitle className="text-[9px] md:text-base font-black text-slate-900 leading-tight group-hover:text-primary transition-colors uppercase italic tracking-tighter line-clamp-2 min-h-[2em] flex items-center justify-center font-headline">
                        {link.title}
                      </CardTitle>
                      <div className="hidden md:flex items-center justify-center text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-3 opacity-40 group-hover:opacity-100 transition-opacity">
                        Launch App <ExternalLink size={10} className="ml-1.5" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-10 pb-10 hidden lg:block">
                    <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider text-center line-clamp-2 opacity-80">
                      {link.description}
                    </p>
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