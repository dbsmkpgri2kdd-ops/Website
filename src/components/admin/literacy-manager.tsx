'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, orderBy, serverTimestamp, doc } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type LiteracyArticle } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, PenSquare } from 'lucide-react';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  title: z.string().min(10, 'Judul minimal 10 karakter.'),
  studentName: z.string().min(3, 'Nama siswa harus diisi.'),
  studentClass: z.string().min(3, 'Kelas siswa harus diisi.'),
  category: z.string().min(3, 'Kategori harus diisi (e.g., Puisi, Cerpen).'),
  content: z.string().min(20, 'Konten tulisan minimal 20 karakter.'),
  imageUrl: z.string().url('URL gambar tidak valid.').optional().or(z.literal('')),
});

export function LiteracyManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<LiteracyArticle | null>(null);

  const articlesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/literacyArticles`);
    return query(ref, orderBy('datePublished', 'desc'));
  }, [firestore]);

  const { data: articles, isLoading } = useCollection<LiteracyArticle>(articlesQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      studentName: '',
      studentClass: '',
      category: '',
      content: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingArticle(null);
      form.reset();
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingArticle(null);
    form.reset();
    setIsDialogOpen(true);
  };
  
  const handleEdit = (article: LiteracyArticle) => {
    setEditingArticle(article);
    form.reset(article);
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    if (editingArticle) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/literacyArticles`, editingArticle.id);
      updateDocumentNonBlocking(docRef, values);
      toast({
        title: 'Berhasil!',
        description: 'Karya tulis telah diperbarui.',
      });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/literacyArticles`);
      addDocumentNonBlocking(ref, {
        ...values,
        schoolId: SCHOOL_DATA_ID,
        datePublished: serverTimestamp(),
      });
      toast({
        title: 'Berhasil!',
        description: 'Karya tulis telah ditambahkan.',
      });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus karya tulis ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/literacyArticles`, id);
      deleteDocumentNonBlocking(docRef);
      toast({
        variant: 'destructive',
        title: 'Dihapus!',
        description: 'Karya tulis telah dihapus.',
      });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
      <CardHeader>
          <CardTitle className="flex items-center gap-2"><PenSquare /> Manajemen Pojok Literasi</CardTitle>
          <CardDescription>Kelola dan publikasikan karya tulis dari para siswa.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAddNew} className="w-full mb-4">
          <PlusCircle className="mr-2" /> Publikasi Karya Baru
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{editingArticle ? 'Edit Karya Tulis' : 'Publikasi Karya Tulis Baru'}</DialogTitle>
              <DialogDescription>Publikasikan karya tulis siswa di sini. Klik simpan jika sudah selesai.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Judul Karya</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="studentName" render={({ field }) => (
                    <FormItem><FormLabel>Nama Siswa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="studentClass" render={({ field }) => (
                    <FormItem><FormLabel>Kelas</FormLabel><FormControl><Input {...field} placeholder="e.g., XII TKJ 1" /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Kategori</FormLabel><FormControl><Input {...field} placeholder="e.g., Puisi, Cerpen, Esai" /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem><FormLabel>URL Gambar (Opsional)</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="content" render={({ field }) => (
                    <FormItem><FormLabel>Isi Karya Tulis</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <LoaderCircle className="animate-spin mr-2"/>}
                  Simpan Karya
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Siswa</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Memuat karya tulis...
                  </TableCell>
                </TableRow>
              )}
              {articles && articles.length > 0 ? (
                articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-xs truncate">{article.title}</TableCell>
                    <TableCell>{article.studentName} ({article.studentClass})</TableCell>
                    <TableCell>{article.category}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(article)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(article.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                !isLoading && <TableRow><TableCell colSpan={4} className="text-center">Belum ada karya tulis yang dipublikasi.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

    
