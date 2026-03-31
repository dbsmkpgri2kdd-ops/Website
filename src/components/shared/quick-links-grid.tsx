'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type QuickLink } from '@/lib/data';
import { Globe, Laptop, AppWindow, BookOpen, GraduationCap, Users } from 'lucide-react';
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
 * QuickLinksGrid v6.0 - Optimized for PWA & Minimalist Aesthetic
 * 3 columns on mobile, 4 on small screens, up to 6 on desktop.
 */
export function QuickLinksGrid({ audience, title, description }: QuickLinksGridProps) {
  const firestore = useFirestore();

  const linksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    try {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/quickLinks`);
      return query(ref, where('audience', 'in', ['all', audience]));
    } catch (e) {
      return null;
    }
  }, [firestore, audience]);

  const { data: links, isLoading, error } = useCollection<QuickLink>(linksQuery);

  if (error || (!isLoading && (!links || links.length === 0))) return null;

  const renderIcon = (iconStr: string) => {
    const isFontAwesome = iconStr.includes('fa-');
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 border border-slate-100 group-hover:border-primary shadow-sm">
        {isFontAwesome ? (
          <i className={cn(iconStr, "text-xs")} />
        ) : (
          (() => {
            const IconComp = iconMap[iconStr] || Globe;
            return <IconComp className="w-5 h-5" />;
          })()
        )}
      </div>
    );
  };

  return (
    <div className="animate-reveal">
      {(title || description) && (
        <div className="mb-6 space-y-1">
          {title && <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 opacity-40">{title}</h2>}
          {description && <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{description}</p>}
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))
        ) : (
          links?.map((link) => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="group block">
              <Card className="h-full rounded-[1.5rem] border-slate-100 bg-white hover:border-primary/20 transition-all duration-300 shadow-sm flex flex-col items-center justify-center p-4 text-center">
                {renderIcon(link.icon)}
                <CardTitle className="mt-3 text-[9px] font-bold text-slate-600 group-hover:text-primary transition-colors tracking-tight leading-tight uppercase line-clamp-2">
                  {link.title}
                </CardTitle>
              </Card>
            </a>
          ))
        )}
      </div>
    </div>
  );
}