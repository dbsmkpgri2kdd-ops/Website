'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type Book } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, Library } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(3, 'Judul buku minimal 3 karakter.'),
  author: z.string().min(3, 'Nama pengarang minimal 3 karakter.'),
  publisher: z.string().optional(),
  yearPublished: z.string().optional(),
  isbn: z.string().optional(),
  coverImageUrl: z.string().url('URL gambar tidak valid.'),
  description: z.string().optional(),
  isAvailable: z.boolean().default(true),
});

export function LibraryManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const booksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/books`);
    return query(ref, orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: books, isLoading } = useCollection<Book>(booksQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      author: '',
      publisher: '',
      yearPublished: '',
      isbn: '',
      coverImageUrl: '',
      description: '',
      isAvailable: true,
    },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingBook(null);
      form.reset({
        title: '',
        author: '',
        publisher: '',
        yearPublished: '',
        isbn: '',
        coverImageUrl: '',
        description: '',
        isAvailable: true,
      });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingBook(null);
    form.reset();
    setIsDialogOpen(true);
  };
  
  const handleEdit = (book: Book) => {
    setEditingBook(book);
    form.reset(book);
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;

    if (editingBook) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/books`, editingBook.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Berhasil!', description: 'Data buku telah diperbarui.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/books`);
      addDocumentNonBlocking(ref, { ...values, createdAt: serverTimestamp() });
      toast({ title: 'Berhasil!', description: 'Buku baru telah ditambahkan ke katalog.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus buku ini dari katalog?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/books`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Buku telah dihapus dari katalog.' });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Library /> Manajemen Perpustakaan</CardTitle>
        <CardDescription>Kelola katalog buku digital yang tersedia di perpustakaan sekolah.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAddNew} className="w-full mb-4">
          <PlusCircle className="mr-2" /> Tambah Buku Baru
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{editingBook ? 'Edit Buku' : 'Tambah Buku Baru'}</DialogTitle>
              <DialogDescription>Lengkapi data buku di bawah ini. Klik simpan jika sudah selesai.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Judul Buku</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="author" render={({ field }) => (
                  <FormItem><FormLabel>Pengarang</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="publisher" render={({ field }) => (
                  <FormItem><FormLabel>Penerbit (Opsional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="yearPublished" render={({ field }) => (
                  <FormItem><FormLabel>Tahun Terbit (Opsional)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="isbn" render={({ field }) => (
                  <FormItem><FormLabel>ISBN (Opsional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="coverImageUrl" render={({ field }) => (
                  <FormItem><FormLabel>URL Gambar Sampul</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Deskripsi (Opsional)</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="isAvailable" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Ketersediaan</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}/>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <LoaderCircle className="animate-spin mr-2"/>}
                  Simpan
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sampul</TableHead>
                <TableHead>Judul Buku</TableHead>
                <TableHead>Pengarang</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Memuat data buku...</TableCell>
                </TableRow>
              )}
              {books && books.length > 0 ? (
                books.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                       <Image src={convertGoogleDriveLink(item.coverImageUrl)} alt={item.title} width={40} height={60} className="rounded-sm object-cover" />
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">{item.title}</TableCell>
                    <TableCell>{item.author}</TableCell>
                    <TableCell>
                        <Badge variant={item.isAvailable ? 'secondary' : 'destructive'}>
                            {item.isAvailable ? 'Tersedia' : 'Dipinjam'}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                !isLoading && <TableRow><TableCell colSpan={5} className="text-center">Belum ada buku di katalog.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

    
