'use client';

import { CheckCircle } from 'lucide-react';
import { type School } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type ProfileSectionProps = {
    schoolData: School | null;
    isSchoolDataLoading: boolean;
};

const ProfileSection = ({ schoolData, isSchoolDataLoading }: ProfileSectionProps) => {
  return (
    <section className="py-16 max-w-5xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-headline text-primary">Tentang Kami</h2>
        <p className="text-lg text-muted-foreground mt-2">Mengenal lebih dekat {schoolData?.shortName}.</p>
      </div>

      <Card className="rounded-3xl shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary font-headline">Sejarah Singkat</CardTitle>
          </CardHeader>
          <CardContent>
            {isSchoolDataLoading ? (
                <div className='space-y-2'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-4/5' />
                </div>
            ) : (
                <p className="text-base leading-relaxed text-muted-foreground">{schoolData?.history || 'Sejarah sekolah belum ditambahkan oleh admin.'}</p>
            )}
          </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        <Card className="rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary font-headline">Visi Kami</CardTitle>
          </CardHeader>
          <CardContent>
            {isSchoolDataLoading ? (
                <div className='space-y-2'>
                    <Skeleton className='h-5 w-full' />
                    <Skeleton className='h-5 w-full' />
                    <Skeleton className='h-5 w-2/3' />
                </div>
            ) : (
                <p className="text-lg leading-relaxed text-muted-foreground">{schoolData?.vision}</p>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary font-headline">Misi Kami</CardTitle>
          </CardHeader>
          <CardContent>
            {isSchoolDataLoading ? (
                <ul className='space-y-4'>
                    {Array.from({length: 3}).map((_, i) => (
                        <li key={i} className="flex gap-3 items-start">
                            <Skeleton className='h-6 w-6 rounded-full' />
                            <div className='space-y-2 flex-grow'>
                                <Skeleton className='h-4 w-full' />
                                <Skeleton className='h-4 w-4/5' />
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <ul className="space-y-4">
                {schoolData?.mission.map((item, i) => (
                    <li key={i} className="flex gap-3 items-start">
                    <CheckCircle className="text-secondary shrink-0 mt-1" size={20} />
                    <span className="text-muted-foreground">{item}</span>
                    </li>
                ))}
                </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProfileSection;
