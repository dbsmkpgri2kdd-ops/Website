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
        <div className="p-2 md:p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shrink-0">
          <i className={cn(iconStr, "text-lg md:text-xl")} />
        </div>
      );
    }
    const IconComp = iconMap[iconStr] || Globe;
    return (
      <div className="p-2 md:p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm shrink-0">
        <IconComp className="w-5 h-5 md:w-6 md:h-6" />
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 md:mb-12 text-center md:text-left space-y-3">
        <div className='flex items-center gap-2 text-primary justify-center md:justify-start'>
            <Sparkles size={14} className='animate-pulse' />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Digital hub</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-black text-foreground leading-tight tracking-tighter uppercase italic">{title}</h2>
        <p className="text-muted-foreground text-[10px] md:text-sm max-w-2xl font-bold opacity-80">{description}</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 md:h-40 rounded-2xl md:rounded-[2rem]" />
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
                <Card className="h-full rounded-2xl md:rounded-[2rem] shadow-sm md:shadow-md border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden border">
                  <CardHeader className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-3 md:p-6 pb-2 md:pb-3 text-center md:text-left">
                    {renderIcon(link.icon)}
                    <div className="flex-1 min-w-0 w-full">
                      <CardTitle className="text-[9px] md:text-base font-black text-foreground truncate group-hover:text-primary transition-colors uppercase italic tracking-tight">{link.title}</CardTitle>
                      <div className="hidden md:flex items-center text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-60">
                        Buka aplikasi <ExternalLink size={10} className="ml-1" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 hidden md:block">
                    <p className="text-xs text-muted-foreground leading-relaxed font-bold opacity-80 line-clamp-2 uppercase tracking-wide">{link.description}</p>
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