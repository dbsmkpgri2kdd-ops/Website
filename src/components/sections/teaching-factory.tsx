'use client';

import { Factory, ShoppingCart, User } from 'lucide-react';
import { SCHOOL_DATA_ID, type TeachingFactoryProduct } from '@/lib/data';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const TeachingFactorySection = () => {
    const firestore = useFirestore();
    const productsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/teachingFactoryProducts`);
        return query(ref, orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: products, isLoading } = useCollection<TeachingFactoryProduct>(productsQuery);

    return (
        <section className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold font-headline text-primary">Teaching Factory (TeFa)</h2>
                <p className="text-lg text-muted-foreground mt-2">
                    Produk dan proyek inovatif hasil karya siswa-siswi kami.
                </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading && Array.from({length: 3}).map((_, i) => (
                    <Card key={i} className="rounded-2xl shadow-lg overflow-hidden">
                        <Skeleton className="aspect-video w-full" />
                        <CardHeader>
                            <Skeleton className='h-7 w-3/4' />
                            <Skeleton className='h-5 w-1/2 mt-2' />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Skeleton className='h-4 w-full' />
                                <Skeleton className='h-4 w-5/6' />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Skeleton className='h-10 w-32' />
                        </CardFooter>
                    </Card>
                ))}
                {products?.map(product => (
                    <Card key={product.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex flex-col overflow-hidden group">
                        <div className="relative aspect-video bg-muted">
                            <Image
                                src={convertGoogleDriveLink(product.imageUrl)}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                unoptimized
                            />
                        </div>
                        <CardHeader>
                             {product.studentCreator && (
                                <CardDescription className="flex items-center gap-2 text-sm !mb-1">
                                    <User size={14}/> Dibuat oleh {product.studentCreator.name}
                                </CardDescription>
                            )}
                            <CardTitle className="font-headline text-2xl text-primary">{product.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground text-sm">{product.description}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
                             {product.price ? (
                                <Badge variant="default" className="text-lg">{product.price}</Badge>
                             ) : (
                                <div></div>
                             )}
                            <Button variant="secondary">
                                <ShoppingCart className="mr-2 h-4 w-4" /> Hubungi Kami
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                {!isLoading && products?.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground col-span-full">
                        <Factory size={48} className="mx-auto mb-4" />
                        <h3 className="text-xl font-semibold">Belum Ada Produk</h3>
                        <p>Saat ini belum ada produk atau proyek yang ditampilkan. Silakan cek kembali nanti.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default TeachingFactorySection;
