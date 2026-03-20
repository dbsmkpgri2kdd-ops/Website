'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type Book } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const LibrarySection = () => {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const booksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/books`);
    return query(ref, orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: books, isLoading } = useCollection<Book>(booksQuery);

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    return books.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [books, searchTerm]);

  return (
    <section className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-headline text-primary">Perpustakaan Digital</h2>
        <p className="text-lg text-muted-foreground mt-2">Jelajahi koleksi buku kami dan temukan bacaan favoritmu.</p>
      </div>

      <div className="mb-12 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari buku berdasarkan judul, pengarang, atau ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {isLoading && Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="rounded-2xl shadow-lg overflow-hidden">
            <div className="aspect-[2/3] bg-muted animate-pulse"></div>
            <CardHeader>
              <Skeleton className='h-5 w-3/4' />
              <Skeleton className='h-4 w-1/2 mt-1' />
            </CardHeader>
          </Card>
        ))}
        {filteredBooks?.map((book) => (
          <Dialog key={book.id}>
            <DialogTrigger asChild>
              <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group cursor-pointer">
                <div className="relative aspect-[2/3] bg-muted">
                  <Image
                    src={convertGoogleDriveLink(book.coverImageUrl)}
                    alt={book.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    unoptimized
                  />
                  <Badge className={`absolute top-2 right-2 ${book.isAvailable ? 'bg-secondary' : 'bg-destructive'}`}>
                    {book.isAvailable ? 'Tersedia' : 'Dipinjam'}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-base font-bold font-headline truncate">{book.title}</CardTitle>
                  <CardDescription className="text-xs truncate">{book.author}</CardDescription>
                </CardHeader>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold font-headline text-primary">{book.title}</DialogTitle>
                <DialogDescription>{book.author}</DialogDescription>
              </DialogHeader>
              <div className="grid md:grid-cols-3 gap-6 py-4">
                <div className="md:col-span-1 relative aspect-[2/3] bg-muted rounded-lg overflow-hidden">
                   <Image
                    src={convertGoogleDriveLink(book.coverImageUrl)}
                    alt={book.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                   <Badge className={`${book.isAvailable ? 'bg-secondary' : 'bg-destructive'}`}>
                    Status: {book.isAvailable ? 'Tersedia' : 'Dipinjam'}
                  </Badge>
                  <p className="text-muted-foreground">{book.description || 'Tidak ada deskripsi.'}</p>
                  <div className="text-sm space-y-1">
                    {book.publisher && <p><span className="font-semibold">Penerbit:</span> {book.publisher}</p>}
                    {book.yearPublished && <p><span className="font-semibold">Tahun Terbit:</span> {book.yearPublished}</p>}
                    {book.isbn && <p><span className="font-semibold">ISBN:</span> {book.isbn}</p>}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
      
      {!isLoading && books?.length === 0 && (
        <p className="text-muted-foreground text-center col-span-full py-16">Katalog buku masih kosong. Admin akan segera menambahkan koleksi.</p>
      )}

      {!isLoading && books && books.length > 0 && filteredBooks.length === 0 && (
        <div className='text-center text-muted-foreground col-span-full py-16'>
          <p className="text-lg font-medium">Tidak ada buku ditemukan untuk "{searchTerm}"</p>
          <p className="text-sm">Coba gunakan kata kunci yang berbeda.</p>
        </div>
      )}
    </section>
  );
};

export default LibrarySection;
