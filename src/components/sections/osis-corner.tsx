'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type OsisPost } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { convertGoogleDriveLink } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID } from '@/lib/data';

type OsisCornerSectionProps = {
  onSelectPost: (postId: string) => void;
};

const OsisCornerSection = ({ onSelectPost }: OsisCornerSectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const firestore = useFirestore();

  const osisQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, `schools/${SCHOOL_DATA_ID}/osisPosts`), orderBy('datePublished', 'desc'));
  }, [firestore]);
  const { data: osisPosts, isLoading: arePostsLoading } = useCollection<OsisPost>(osisQuery);

  const filteredPosts = useMemo(() => {
    if (!osisPosts) return [];
    return osisPosts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [osisPosts, searchTerm]);

  return (
    <section className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-headline text-primary">Osis Corner</h2>
          <p className="text-lg text-muted-foreground mt-2">Informasi, pengumuman, dan kegiatan dari OSIS.</p>
      </div>

      <div className="mb-12 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari postingan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-base"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {arePostsLoading && Array.from({length: 6}).map((_, i) => (
            <Card key={i} className="rounded-2xl overflow-hidden shadow-lg">
                <CardHeader className="p-0 h-48">
                    <Skeleton className="w-full h-full" />
                </CardHeader>
                <CardContent className="p-6">
                    <Skeleton className="h-4 w-20 mb-4" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-10 w-full mb-4" />
                    <Skeleton className="h-5 w-28" />
                </CardContent>
            </Card>
        ))}
        {!arePostsLoading && filteredPosts.map((post) => {
          return (
            <Card key={post.id} className="rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1 group">
              {post.imageUrl && (
                <CardHeader className="p-0 h-48 overflow-hidden">
                  <Image 
                    src={convertGoogleDriveLink(post.imageUrl)} 
                    alt={post.title} 
                    width={400}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </CardHeader>
              )}
              <CardContent className="p-6">
                <Badge variant="secondary">{post.category}</Badge>
                <h3 className="text-xl font-bold mt-2 mb-3 font-headline h-14 overflow-hidden">{post.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 h-24 overflow-hidden">
                  {post.content}
                </p>
                <Button variant="link" onClick={() => onSelectPost(post.id)} className="p-0 text-primary font-semibold">Baca Selengkapnya</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
       {!arePostsLoading && osisPosts && osisPosts.length === 0 && (
          <div className='text-center text-muted-foreground mt-16'>Belum ada postingan dari OSIS.</div>
        )}
        {!arePostsLoading && osisPosts && osisPosts.length > 0 && filteredPosts.length === 0 && (
            <div className='text-center text-muted-foreground mt-16'>
                <p className="text-lg font-medium">Tidak ada hasil ditemukan untuk "{searchTerm}"</p>
                <p className="text-sm">Coba gunakan kata kunci yang berbeda.</p>
            </div>
        )}
    </section>
  );
};

export default OsisCornerSection;
