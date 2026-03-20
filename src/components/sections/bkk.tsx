'use client';

import { Briefcase, Building, Calendar, CheckSquare, ExternalLink, MapPin } from 'lucide-react';
import { SCHOOL_DATA_ID, type JobVacancy } from '@/lib/data';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const BkkSection = () => {
    const firestore = useFirestore();
    const vacanciesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/jobVacancies`);
        return query(ref, orderBy('postedDate', 'desc'));
    }, [firestore]);

    const { data: vacancies, isLoading } = useCollection<JobVacancy>(vacanciesQuery);

    const formatDate = (date: any) => {
        if (!date) return null;
        const jsDate = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
        return format(jsDate, "d MMMM yyyy", { locale: idLocale });
    }

  return (
    <section className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
       <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-headline text-primary">Bursa Kerja Khusus (BKK)</h2>
        <p className="text-lg text-muted-foreground mt-2">
            Temukan peluang karir Anda melalui portal lowongan kerja kami.
        </p>
      </div>

       <div className="grid lg:grid-cols-2 gap-8">
            {isLoading && Array.from({length: 4}).map((_, i) => (
                <Card key={i} className="rounded-2xl shadow-lg">
                    <CardHeader>
                        <Skeleton className='h-7 w-3/4' />
                        <Skeleton className='h-5 w-1/2 mt-2' />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Skeleton className='h-4 w-full' />
                            <Skeleton className='h-4 w-5/6' />
                            <Skeleton className='h-4 w-full' />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className='h-10 w-32' />
                    </CardFooter>
                </Card>
            ))}
            {vacancies?.map(job => (
                 <Card key={job.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                    <CardHeader>
                        <Badge variant="secondary" className="w-fit mb-2">{formatDate(job.postedDate)}</Badge>
                        <CardTitle className="font-headline text-2xl text-primary">{job.title}</CardTitle>
                        <CardDescription className="!mt-1 text-base flex items-center gap-2">
                           <Building size={16} /> {job.companyName}
                        </CardDescription>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                             <MapPin size={14} /> {job.location}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><CheckSquare size={18}/> Persyaratan:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
                           {job.requirements.map((req, i) => <li key={i}>{req}</li>)}
                        </ul>
                    </CardContent>
                    <CardFooter className="flex-wrap gap-4">
                        <Button asChild>
                            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                                Lamar Sekarang <ExternalLink />
                            </a>
                        </Button>
                        {job.closingDate && (
                             <div className="flex items-center text-sm text-destructive font-medium">
                                <Calendar className="mr-2 h-4 w-4" />
                                Ditutup pada {formatDate(job.closingDate)}
                            </div>
                        )}
                    </CardFooter>
                </Card>
            ))}
             {!isLoading && vacancies?.length === 0 && (
                <div className="text-center py-20 text-muted-foreground col-span-full">
                    <Briefcase size={48} className="mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">Belum Ada Lowongan</h3>
                    <p>Saat ini belum ada lowongan pekerjaan yang tersedia. Silakan cek kembali nanti.</p>
                </div>
            )}
       </div>
    </section>
  );
};

export default BkkSection;
