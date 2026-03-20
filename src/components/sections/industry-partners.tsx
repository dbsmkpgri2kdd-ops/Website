'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type IndustryPartner } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Link as LinkIcon } from 'lucide-react';

const IndustryPartnersSection = () => {
  const firestore = useFirestore();
  const partnersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const partnersRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/industryPartners`);
    return query(partnersRef, orderBy('name'));
  }, [firestore]);

  const { data: partners, isLoading } = useCollection<IndustryPartner>(partnersQuery);


  return (
    <section className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-headline text-primary">Mitra Industri</h2>
        <p className="text-lg text-muted-foreground mt-2">Perusahaan dan institusi yang mendukung kesuksesan siswa kami.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading && Array.from({length: 6}).map((_, i) => (
            <Card key={i} className="rounded-2xl shadow-lg overflow-hidden flex flex-col">
                <div className="h-40 flex items-center justify-center p-6 bg-muted/50">
                    <Skeleton className='h-20 w-32'/>
                </div>
                <CardHeader>
                    <Skeleton className='h-6 w-3/4'/>
                </CardHeader>
                <CardContent>
                    <Skeleton className='h-4 w-full'/>
                    <Skeleton className='h-4 w-5/6 mt-2'/>
                </CardContent>
            </Card>
        ))}
        {partners?.map((partner) => {
          const PartnerLogo = (
             <div className="h-40 flex items-center justify-center p-6 bg-muted/30 group-hover:bg-muted/60 transition-colors">
                <Image 
                    src={convertGoogleDriveLink(partner.logoUrl)} 
                    alt={`${partner.name} logo`}
                    width={150}
                    height={80}
                    className="object-contain" 
                    unoptimized
                />
              </div>
          );

          return (
            <Card key={partner.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group flex flex-col">
              {partner.websiteUrl ? (
                <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer">{PartnerLogo}</a>
              ) : PartnerLogo}
              
              <CardHeader>
                  <CardTitle className="text-xl font-bold font-headline">{partner.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{partner.description}</p>
              </CardContent>
            </Card>
          );
        })}
         {!isLoading && partners?.length === 0 && (
            <p className="text-muted-foreground text-center md:col-span-2 lg:col-span-3 py-16">Data mitra industri belum ditambahkan oleh admin.</p>
        )}
      </div>
    </section>
  );
};

export default IndustryPartnersSection;
