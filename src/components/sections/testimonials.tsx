'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type Testimonial } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote } from 'lucide-react';
import Image from 'next/image';

const TestimonialsSection = () => {
  const firestore = useFirestore();
  const testimonialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/testimonials`);
    return query(ref, orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: testimonials, isLoading } = useCollection<Testimonial>(testimonialsQuery);

  return (
    <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6 animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold font-headline text-primary">Apa Kata Alumni?</h2>
                <p className="text-lg text-muted-foreground mt-2">Kisah sukses dan pengalaman berharga dari para lulusan.</p>
            </div>
            {isLoading && (
                 <div className="flex justify-center">
                    <div className="w-full max-w-2xl">
                        <Skeleton className="h-80 w-full rounded-2xl" />
                    </div>
                </div>
            )}
            {!isLoading && testimonials && testimonials.length > 0 && (
                <Carousel
                    opts={{ align: "start", loop: true }}
                    className="w-full max-w-4xl mx-auto"
                >
                    <CarouselContent>
                        {testimonials.map((testimonial) => (
                        <CarouselItem key={testimonial.id} className="md:basis-1/2">
                            <div className="p-1 h-full">
                            <Card className="rounded-2xl shadow-lg flex flex-col items-center text-center p-8 h-full justify-between bg-card">
                                <Quote className="w-10 h-10 text-primary/20 mb-4" />
                                <CardContent className="p-0 flex-grow">
                                    <p className="italic text-muted-foreground">"{testimonial.content}"</p>
                                </CardContent>
                                <div className="mt-6">
                                     <Avatar className="w-16 h-16 mx-auto mb-4 border-2 border-primary">
                                        <Image src={convertGoogleDriveLink(testimonial.studentPhotoUrl)} alt={testimonial.studentName} fill className="object-cover" unoptimized />
                                        <AvatarFallback>{testimonial.studentName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <h4 className="text-lg font-bold font-headline">{testimonial.studentName}</h4>
                                    <p className="text-sm text-accent">{testimonial.occupation}</p>
                                    <p className="text-xs text-muted-foreground">Lulusan Tahun {testimonial.graduationYear}</p>
                                </div>
                            </Card>
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                </Carousel>
            )}
             {!isLoading && testimonials?.length === 0 && (
                <p className="text-muted-foreground text-center">Data testimoni belum ditambahkan oleh admin.</p>
            )}
        </div>
    </section>
  );
};

export default TestimonialsSection;
