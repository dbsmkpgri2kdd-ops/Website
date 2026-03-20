'use client';

import { ShieldCheck } from 'lucide-react';
import { SCHOOL_DATA_ID, type LspCertification } from '@/lib/data';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const LspSection = () => {
  const firestore = useFirestore();
  const lspQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/lspCertifications`);
    return query(ref, orderBy('name', 'asc'));
  }, [firestore]);

  const { data: certifications, isLoading } = useCollection<LspCertification>(lspQuery);

  return (
    <section className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-headline text-primary">LSP & Sertifikasi</h2>
        <p className="text-lg text-muted-foreground mt-2">
            Tingkatkan kompetensi Anda dengan skema sertifikasi yang diakui secara profesional.
        </p>
      </div>

       <div className="grid md:grid-cols-2 gap-8">
            {isLoading && Array.from({length: 4}).map((_, i) => (
                <Card key={i} className="rounded-2xl shadow-lg">
                    <CardHeader>
                        <Skeleton className='h-7 w-3/4' />
                        <Skeleton className='h-5 w-1/2 mt-2' />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className='h-4 w-full' />
                        <Skeleton className='h-4 w-5/6 mt-2' />
                    </CardContent>
                </Card>
            ))}
            {certifications?.map(cert => (
                 <Card key={cert.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                    <CardHeader>
                        <Badge variant="secondary" className="w-fit mb-2">No: {cert.schemaNumber}</Badge>
                        <CardTitle className="font-headline text-2xl text-primary">{cert.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-muted-foreground">{cert.description}</p>
                    </CardContent>
                </Card>
            ))}
             {!isLoading && certifications?.length === 0 && (
                <div className="text-center py-20 text-muted-foreground col-span-full">
                    <ShieldCheck size={48} className="mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">Belum Ada Skema Sertifikasi</h3>
                    <p>Admin belum menambahkan informasi mengenai skema sertifikasi LSP.</p>
                </div>
            )}
       </div>
    </section>
  );
};

export default LspSection;
