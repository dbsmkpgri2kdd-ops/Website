'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type Alumnus } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Briefcase } from 'lucide-react';

const AlumniSection = () => {
  const firestore = useFirestore();
  const alumniQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/alumni`);
    return query(ref, orderBy('graduationYear', 'desc'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: alumni, isLoading } = useCollection<Alumnus>(alumniQuery);

  return (
    <section className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-headline text-primary">Database Alumni</h2>
        <p className="text-lg text-muted-foreground mt-2">Jejak langkah dan karir para lulusan kami.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {isLoading && Array.from({length: 8}).map((_, i) => (
            <Card key={i} className="rounded-2xl shadow-lg overflow-hidden text-center p-6">
                <Skeleton className='w-24 h-24 rounded-full mx-auto mb-4' />
                <Skeleton className='h-6 w-3/4 mx-auto mb-2'/>
                <Skeleton className='h-4 w-1/2 mx-auto'/>
            </Card>
        ))}
        {alumni?.map((person) => (
          <Card key={person.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center p-6 flex flex-col items-center">
            <div className="relative w-28 h-28 mb-4">
              <Image 
                  src={convertGoogleDriveLink(person.photoUrl)} 
                  alt={person.name} 
                  fill 
                  className="object-cover rounded-full border-4 border-primary/20" 
                  unoptimized
              />
            </div>
            <CardHeader className="p-0">
                <CardTitle className="text-lg font-bold font-headline">{person.name}</CardTitle>
                <CardDescription className="text-sm !mt-1 text-primary font-semibold">Lulusan {person.graduationYear}</CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4 flex-grow flex items-center">
                <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
                    <Briefcase size={14} />
                    {person.occupation}
                </p>
            </CardContent>
          </Card>
        ))}
         {!isLoading && alumni?.length === 0 && (
            <p className="text-muted-foreground text-center col-span-full py-16">Data alumni belum ditambahkan oleh admin.</p>
        )}
      </div>
    </section>
  );
};

export default AlumniSection;
