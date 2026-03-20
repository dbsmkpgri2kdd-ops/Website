'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type Facility } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';

const FacilitiesSection = () => {
  const firestore = useFirestore();
  const facilitiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const facilitiesRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/facilities`);
    return query(facilitiesRef, orderBy('name'));
  }, [firestore]);

  const { data: facilities, isLoading: areFacilitiesLoading } = useCollection<Facility>(facilitiesQuery);


  return (
    <section className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-headline text-primary">Fasilitas Sekolah</h2>
        <p className="text-lg text-muted-foreground mt-2">Sarana dan prasarana penunjang kegiatan belajar mengajar.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {areFacilitiesLoading && Array.from({length: 6}).map((_, i) => (
            <Card key={i} className="rounded-2xl shadow-lg overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse"></div>
                <CardHeader>
                    <Skeleton className='h-6 w-3/4'/>
                </CardHeader>
                <CardContent>
                    <Skeleton className='h-4 w-full'/>
                    <Skeleton className='h-4 w-5/6 mt-2'/>
                </CardContent>
            </Card>
        ))}
        {!areFacilitiesLoading && facilities?.map((facility) => {
          return (
            <Card key={facility.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
              <div className="relative aspect-video">
                <Image 
                    src={convertGoogleDriveLink(facility.imageUrl)} 
                    alt={facility.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform" 
                    unoptimized
                />
              </div>
              <CardHeader>
                  <CardTitle className="text-xl font-bold font-headline">{facility.name}</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-muted-foreground">{facility.description}</p>
              </CardContent>
            </Card>
          );
        })}
         {!areFacilitiesLoading && facilities?.length === 0 && (
            <p className="text-muted-foreground text-center md:col-span-2 lg:col-span-3">Data fasilitas belum ditambahkan oleh admin.</p>
        )}
      </div>
    </section>
  );
};

export default FacilitiesSection;
