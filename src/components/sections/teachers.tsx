'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type Teacher } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Mail } from 'lucide-react';

const TeachersSection = () => {
  const firestore = useFirestore();
  const teachersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/teachers`);
    return query(ref, orderBy('name'));
  }, [firestore]);

  const { data: teachers, isLoading } = useCollection<Teacher>(teachersQuery);

  return (
    <section className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-headline text-primary">Staf & Guru</h2>
        <p className="text-lg text-muted-foreground mt-2">Tenaga pendidik dan kependidikan profesional kami.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {isLoading && Array.from({length: 8}).map((_, i) => (
            <Card key={i} className="rounded-2xl shadow-lg overflow-hidden text-center p-6">
                <Skeleton className='w-24 h-24 rounded-full mx-auto mb-4' />
                <Skeleton className='h-6 w-3/4 mx-auto mb-2'/>
                <Skeleton className='h-4 w-1/2 mx-auto'/>
            </Card>
        ))}
        {teachers?.map((teacher) => (
          <Card key={teacher.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center p-6 flex flex-col items-center">
            <div className="relative w-28 h-28 mb-4">
              <Image 
                  src={convertGoogleDriveLink(teacher.photoUrl)} 
                  alt={teacher.name} 
                  fill 
                  className="object-cover rounded-full border-4 border-primary/20" 
                  unoptimized
              />
            </div>
            <CardHeader className="p-0">
                <CardTitle className="text-lg font-bold font-headline">{teacher.name}</CardTitle>
                <CardDescription className="text-sm !mt-1 text-primary">{teacher.title}</CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4">
                {teacher.email && (
                    <a href={`mailto:${teacher.email}`} className="text-xs text-muted-foreground hover:text-accent-foreground flex items-center gap-1 justify-center">
                        <Mail size={12} />
                        {teacher.email}
                    </a>
                )}
            </CardContent>
          </Card>
        ))}
         {!isLoading && teachers?.length === 0 && (
            <p className="text-muted-foreground text-center col-span-full py-16">Data staf dan guru belum ditambahkan oleh admin.</p>
        )}
      </div>
    </section>
  );
};

export default TeachersSection;
    
