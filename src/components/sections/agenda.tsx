'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type Event } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Badge } from '../ui/badge';
import { Calendar } from 'lucide-react';

const AgendaSection = () => {
  const firestore = useFirestore();
  const eventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const eventsRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/events`);
    return query(eventsRef, orderBy('date', 'asc'));
  }, [firestore]);

  const { data: events, isLoading } = useCollection<Event>(eventsQuery);

  const groupedEvents = useMemo(() => {
    if (!events) return {};
    return events.reduce((acc, event) => {
      const month = format(event.date.toDate(), 'MMMM yyyy', { locale: idLocale });
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(event);
      return acc;
    }, {} as Record<string, Event[]>);
  }, [events]);

  const categoryColors: { [key: string]: string } = {
    'Akademik': 'bg-blue-100 text-blue-800',
    'Kegiatan Siswa': 'bg-green-100 text-green-800',
    'Rapat': 'bg-yellow-100 text-yellow-800',
    'Libur': 'bg-red-100 text-red-800',
    'Umum': 'bg-gray-100 text-gray-800',
  };

  return (
    <section className="py-16 max-w-4xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-headline text-primary">Agenda Sekolah</h2>
        <p className="text-lg text-muted-foreground mt-2">Jadwal kegiatan dan acara penting sekolah kami.</p>
      </div>
      <div className="space-y-12">
        {isLoading && Array.from({length: 2}).map((_, i) => (
            <div key={i}>
                <Skeleton className='h-8 w-40 mb-6' />
                <div className="space-y-4">
                    <Skeleton className='h-24 w-full' />
                    <Skeleton className='h-24 w-full' />
                </div>
            </div>
        ))}
        {Object.entries(groupedEvents).map(([month, monthEvents]) => (
          <div key={month}>
            <h3 className="text-2xl font-bold mb-6 font-headline text-primary flex items-center gap-2">
              <Calendar /> {month}
            </h3>
            <div className="space-y-4">
              {monthEvents.map((event) => (
                <Card key={event.id} className="shadow-md hover:shadow-lg transition-shadow rounded-xl">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg w-20 text-center">
                        <span className="text-3xl font-bold text-primary">{format(event.date.toDate(), 'd')}</span>
                        <span className="text-sm text-muted-foreground">{format(event.date.toDate(), 'MMM')}</span>
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                             <h4 className="font-bold font-headline text-lg">{event.title}</h4>
                             <Badge className={`${categoryColors[event.category] || categoryColors['Umum']} border-none`}>{event.category}</Badge>
                        </div>
                        {event.description && (
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
         {!isLoading && (!events || events.length === 0) && (
            <p className="text-muted-foreground text-center py-10">Admin belum menambahkan agenda kegiatan.</p>
        )}
      </div>
    </section>
  );
};

export default AgendaSection;
