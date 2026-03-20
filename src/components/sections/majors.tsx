'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Computer, BarChart4, Film, Wrench, Bike, LoaderCircle } from 'lucide-react';
import React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type Major } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';

const iconMap: { [key: string]: React.ElementType } = {
  Computer,
  BarChart4,
  Film,
  Wrench,
  Bike,
  BarChart: BarChart4, // Alias
};


const MajorsSection = () => {
  const firestore = useFirestore();
  const majorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const majorsRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/majors`);
    return query(majorsRef, orderBy('name'));
  }, [firestore]);

  const { data: majors, isLoading: areMajorsLoading } = useCollection<Major>(majorsQuery);


  return (
    <section className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-headline text-primary">Kompetensi Keahlian</h2>
        <p className="text-lg text-muted-foreground mt-2">Pilihan jurusan yang relevan dengan kebutuhan industri saat ini.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {areMajorsLoading && Array.from({length: 4}).map((_, i) => (
            <Card key={i} className="rounded-2xl shadow-lg flex flex-col sm:flex-row items-center p-6 gap-6">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </Card>
        ))}
        {!areMajorsLoading && majors?.map((major) => {
          const Icon = iconMap[major.icon];
          return (
            <Card key={major.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex flex-col sm:flex-row items-center p-6 gap-6">
              {Icon && (
                 <div className="p-4 bg-primary/10 text-primary rounded-xl">
                    <Icon size={32} />
                 </div>
              )}
              <div className="text-center sm:text-left">
                  <CardTitle className="text-xl font-bold mb-2 font-headline">{major.name}</CardTitle>
                  <CardDescription>{major.description}</CardDescription>
              </div>
            </Card>
          );
        })}
         {!areMajorsLoading && majors?.length === 0 && (
            <p className="text-muted-foreground text-center md:col-span-2">Data jurusan belum ditambahkan oleh admin.</p>
        )}
      </div>
    </section>
  );
};

export default MajorsSection;
