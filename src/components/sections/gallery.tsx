'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type GalleryImage } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { convertGoogleDriveLink, convertGoogleDriveLinkForEmbed } from '@/lib/utils';
import { useEffect, useState } from 'react';

const GallerySection = () => {
  const firestore = useFirestore();
  const [mounted, setMounted] = useState(false);

  const galleryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const galleryRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/gallery`);
    return query(galleryRef, orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: galleryImages, isLoading } = useCollection<GalleryImage>(galleryQuery);

  const [clientHeights, setClientHeights] = useState<Record<string, number>>({});
  
  useEffect(() => {
      setMounted(true);
      const getDeterministicHeight = (idOrIndex: string | number) => {
        const seed = typeof idOrIndex === 'string'
          ? idOrIndex.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
          : idOrIndex;
        return 300 + ((seed * 9301 + 49297) % 233280) % 201;
      };
      
      const newHeights: Record<string, number> = {};
      if (galleryImages) {
          galleryImages.forEach(img => {
              newHeights[img.id] = getDeterministicHeight(img.id);
          });
      }
      for (let i = 0; i < 12; i++) {
        newHeights[`skeleton-${i}`] = getDeterministicHeight(i);
      }
      setClientHeights(newHeights);

  }, [galleryImages]);


  return (
    <section className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-headline text-primary">Galeri Sekolah</h2>
        <p className="text-lg text-muted-foreground mt-2">Momen dan kegiatan di SMKS PGRI 2 KEDONDONG.</p>
      </div>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {(isLoading || !mounted) && (
            Array.from({length: 12}).map((_, i) => (
                <div key={i} className="break-inside-avoid">
                    <Skeleton style={{ height: `${clientHeights[`skeleton-${i}`] || 300}px`}} className="w-full rounded-xl" />
                </div>
            ))
        )}
        {mounted && galleryImages?.map((image) => (
          <div key={image.id} className="break-inside-avoid">
            <Card className="rounded-xl overflow-hidden shadow-lg group">
              {image.mediaType === 'video' ? (
                <div className="relative aspect-video bg-black">
                  <iframe
                    src={convertGoogleDriveLinkForEmbed(image.imageUrl)}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={image.description}
                  ></iframe>
                </div>
              ) : (
                <Image
                  src={convertGoogleDriveLink(image.imageUrl)}
                  alt={image.description}
                  width={400}
                  height={clientHeights[image.id] || 300}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  data-ai-hint={image.imageHint}
                  unoptimized
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              )}
            </Card>
          </div>
        ))}
         {mounted && !isLoading && galleryImages?.length === 0 && (
            <p className="text-muted-foreground text-center col-span-full">Galeri masih kosong. Admin akan segera menambahkan foto dan video.</p>
        )}
      </div>
    </section>
  );
};

export default GallerySection;