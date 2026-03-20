'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type Achievement } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Award, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Badge } from '../ui/badge';

const AchievementsSection = () => {
  const firestore = useFirestore();
  const achievementsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const achievementsRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/achievements`);
    return query(achievementsRef, orderBy('dateAchieved', 'desc'));
  }, [firestore]);

  const { data: achievements, isLoading } = useCollection<Achievement>(achievementsQuery);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const jsDate = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return format(jsDate, "d MMMM yyyy", { locale: idLocale });
  }

  return (
    <section className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-headline text-primary">Prestasi Siswa</h2>
        <p className="text-lg text-muted-foreground mt-2">Etalase pencapaian gemilang siswa-siswi kami.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading && Array.from({length: 6}).map((_, i) => (
            <Card key={i} className="rounded-2xl shadow-lg overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse"></div>
                <CardHeader>
                    <Skeleton className='h-6 w-3/4'/>
                    <Skeleton className='h-4 w-1/2 mt-2'/>
                </CardHeader>
                <CardContent>
                    <Skeleton className='h-4 w-full'/>
                    <Skeleton className='h-4 w-5/6 mt-2'/>
                </CardContent>
            </Card>
        ))}
        {achievements?.map((achievement) => (
          <Card key={achievement.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
            <div className="relative aspect-video">
              <Image 
                  src={convertGoogleDriveLink(achievement.imageUrl)} 
                  alt={achievement.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform" 
                  unoptimized
              />
            </div>
            <CardHeader>
                <Badge variant="secondary" className="w-fit">{achievement.level}</Badge>
                <CardTitle className="text-xl font-bold font-headline pt-2">{achievement.title}</CardTitle>
                <CardDescription className="text-sm !mt-1">{achievement.competitionName}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="font-semibold text-primary">{achievement.studentName}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <Calendar className="mr-1.5 h-3.5 w-3.5" />
                    <span>{formatDate(achievement.dateAchieved)}</span>
                </div>
            </CardContent>
          </Card>
        ))}
         {!isLoading && achievements?.length === 0 && (
            <p className="text-muted-foreground text-center md:col-span-2 lg:col-span-3">Data prestasi belum ditambahkan oleh admin.</p>
        )}
      </div>
    </section>
  );
};

export default AchievementsSection;
