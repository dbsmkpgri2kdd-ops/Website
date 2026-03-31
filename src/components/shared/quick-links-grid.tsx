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
 * Dioptimalkan untuk kerapian tampilan PWA (Android) dengan gaya Fresh Light.
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

  return (
    <div className="animate-fade-in">
      <div className="mb-12 text-center md:text-left space-y-3">
        <div className='flex items-center gap-2 text-primary justify-center md:justify-start'>
            <Sparkles size={14} className='animate-pulse' />
            <span className="text-xs font-bold uppercase tracking-widest">Digital Hub</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{title}</h2>
        <p className="text-muted-foreground text-sm max-w-2xl font-medium">{description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
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
                <Card className="h-full rounded-2xl shadow-sm border-border bg-white hover:border-primary/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden border">
                  <CardHeader className="flex flex-row items-center gap-4 p-6 pb-3">
                    <div className="p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{link.title}</CardTitle>
                      <div className="flex items-center text-[10px] text-muted-foreground font-medium mt-1 opacity-60">
                        Buka Aplikasi <ExternalLink size={10} className="ml-1" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium line-clamp-2">{link.description}</p>
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
