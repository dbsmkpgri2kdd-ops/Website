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
 * Komponen Grid untuk menampilkan Tautan Aplikasi berdasarkan audiens.
 * Dioptimalkan untuk PWA (3-4 kolom di mobile) dengan gaya app-drawer.
 * Menggunakan skema warna Clean White - Blue & Yellow.
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
    if (iconStr.includes('fa-')) {
      return (
        <div className="p-2.5 md:p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm w-12 h-12 md:w-14 md:h-14 flex items-center justify-center shrink-0">
          <i className={cn(iconStr, "text-xl md:text-2xl")} />
        </div>
      );
    }
    const IconComp = iconMap[iconStr] || Globe;
    return (
      <div className="p-2.5 md:p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm w-12 h-12 md:w-14 md:h-14 flex items-center justify-center shrink-0">
        <IconComp className="w-6 h-6 md:w-7 md:h-7" />
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 md:mb-12 text-center md:text-left space-y-3">
        <div className='flex items-center gap-2 text-primary justify-center md:justify-start'>
            <Sparkles size={14} className='animate-pulse text-accent' />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-primary">Portal Layanan Terpadu</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight tracking-tighter uppercase italic">{title}</h2>
        <p className="text-muted-foreground text-[10px] md:text-sm max-w-2xl font-bold opacity-80">{description}</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 md:h-48 rounded-[2rem]" />
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
                <Card className="h-full rounded-[2rem] md:rounded-[2.5rem] shadow-sm md:shadow-lg border-slate-100 bg-white hover:border-primary/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 overflow-hidden border">
                  <CardHeader className="flex flex-col items-center gap-3 md:gap-4 p-4 md:p-8 pb-3 md:pb-4 text-center">
                    {renderIcon(link.icon)}
                    <div className="w-full">
                      <CardTitle className="text-[10px] md:text-base font-black text-slate-900 leading-tight group-hover:text-primary transition-colors uppercase italic tracking-tight line-clamp-2 min-h-[2.5em] flex items-center justify-center">
                        {link.title}
                      </CardTitle>
                      <div className="hidden md:flex items-center justify-center text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-2 opacity-40 group-hover:opacity-100 transition-opacity">
                        Buka Aplikasi <ExternalLink size={10} className="ml-1.5" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 hidden md:block">
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium text-center line-clamp-2 opacity-60">
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
