
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type QuickLink } from '@/lib/data';
import { Globe, Laptop, AppWindow as AppIcon, BookOpen, GraduationCap, Users, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: { [key: string]: any } = {
  Globe, Laptop, AppIcon, BookOpen, GraduationCap, Users
};

type QuickLinksGridProps = {
  audience: 'public' | 'guru' | 'siswa';
  title?: string;
  description?: string;
};

export function QuickLinksGrid({ audience, title = "Aplikasi & Tautan", description = "Akses cepat ke berbagai layanan dan fitur sekolah kami." }: QuickLinksGridProps) {
  const firestore = useFirestore();

  const linksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/quickLinks`);
    // Filter by specific audience or 'all'
    return query(
      ref, 
      where('audience', 'in', ['all', audience]),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, audience]);

  const { data: links, isLoading } = useCollection<QuickLink>(linksQuery);

  if (!isLoading && (!links || links.length === 0)) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold font-headline text-primary">{title}</h2>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
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
                <Card className="h-full rounded-2xl shadow-md border-primary/5 hover:border-primary/20 hover:shadow-xl transition-all hover:-translate-y-1 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold truncate group-hover:text-primary transition-colors">{link.title}</CardTitle>
                      <div className="flex items-center text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">
                        Buka Aplikasi <ExternalLink size={10} className="ml-1" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{link.description}</p>
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
