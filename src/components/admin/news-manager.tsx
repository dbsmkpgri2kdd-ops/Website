'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, orderBy, serverTimestamp, doc } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type NewsArticle } from '@/lib/data';
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
import { PlusCircle, Trash2, Edit, LoaderCircle, Newspaper, MessageSquare, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CommentManager } from './comment-manager';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  title: z.string().min(10, 'Judul berita minimal 10 karakter.'),
  category: z.string().min(3, 'Kategori harus diisi.'),
  content: z.string().min(20, 'Konten berita minimal 20 karakter.'),
  imageUrl: z.string().url('URL gambar tidak valid.'),
});

export function NewsManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [isCommentManagerOpen, setIsCommentManagerOpen] = useState(false);
  const [selectedArticleForComments, setSelectedArticleForComments] = useState<NewsArticle | null>(null);

  const newsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, `schools/${SCHOOL_DATA_ID}/newsArticles`), orderBy('datePublished', 'desc'));
  }, [firestore]);

  const { data: news, isLoading } = useCollection<NewsArticle>(newsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      category: '',
      content: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingArticle(null);
      form.reset({ title: '', category: '', content: '', imageUrl: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingArticle(null);
    form.reset({ title: '', category: '', content: '', imageUrl: '' });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    form.reset(article);
    setIsDialogOpen(true);
  };
  
  const handleManageComments = (article: NewsArticle) => {
    setSelectedArticleForComments(article);
    setIsCommentManagerOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    if (editingArticle) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/newsArticles`, editingArticle.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Berita Diperbarui', description: 'Artikel berita telah berhasil disimpan.' });
    } else {
      const newsRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/newsArticles`);
      addDocumentNonBlocking(newsRef, {
        ...values,
        schoolId: SCHOOL_DATA_ID,
        datePublished: serverTimestamp(),
      });
      toast({ title: 'Berita Ditambahkan', description: 'Artikel baru telah dipublikasikan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Hapus berita ini secara permanen?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/newsArticles`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Berita Dihapus', description: 'Artikel telah dihapus dari sistem.' });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2"><Newspaper /> Manajemen Berita & Pengumuman</CardTitle>
            <CardDescription>Kelola artikel informasi publik untuk seluruh pengunjung situs.</CardDescription>
          </div>
          <Button onClick={handleAddNew} size="sm" className="font-bold">
            <PlusCircle className="mr-2 h-4 w-4" /> Tulis Berita
          </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{editingArticle ? 'Ubah Artikel' : 'Tulis Berita Baru'}</DialogTitle>
              <DialogDescription>Pastikan informasi yang Anda tulis sudah akurat dan menggunakan bahasa yang formal.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Judul Artikel</FormLabel><FormControl><Input {...field} placeholder="Masukkan judul berita yang menarik..." className="h-12 text-lg font-semibold" /></FormControl><FormMessage /></FormItem>
                )}/>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem><FormLabel>Kategori</FormLabel><FormControl><Input {...field} placeholder="e.g. Prestasi, Pengumuman, Acara" /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="imageUrl" render={({ field }) => (
                      <FormItem><FormLabel>URL Gambar Utama</FormLabel><FormControl><Input {...field} placeholder="https://drive.google.com/..." /></FormControl><FormMessage /></FormItem>
                  )}/>
                </div>
                <FormField control={form.control} name="content" render={({ field }) => (
                    <FormItem><FormLabel>Isi Berita Lengkap</FormLabel><FormControl><Textarea rows={12} {...field} placeholder="Tuliskan detail berita di sini..." /></FormControl><FormMessage /></FormItem>
                )}/>
                <div className="flex justify-end gap-3 border-t pt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                  <Button type="submit" size="lg" className="font-bold min-w-[150px]" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-2"/> : null}
                    {editingArticle ? 'Simpan Perubahan' : 'Publikasikan'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={isCommentManagerOpen} onOpenChange={setIsCommentManagerOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Moderasi Komentar</DialogTitle>
              <DialogDescription>Mengelola komentar publik untuk artikel: <span className="font-bold text-primary">"{selectedArticleForComments?.title}"</span></DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {selectedArticleForComments && <CommentManager article={selectedArticleForComments} />}
            </div>
          </DialogContent>
        </Dialog>

        <div className="rounded-none border-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">Cover</TableHead>
                <TableHead>Informasi Berita</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Kelola</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10"><LoaderCircle className="animate-spin mx-auto text-primary" /></TableCell>
                </TableRow>
              )}
              {news && news.length > 0 ? (
                news.map((article) => (
                  <TableRow key={article.id} className="hover:bg-muted/30 group">
                    <TableCell>
                      <div className="relative w-20 h-14 rounded-lg overflow-hidden border bg-muted shadow-sm">
                        <Image src={convertGoogleDriveLink(article.imageUrl)} alt={article.title} fill className="object-cover" unoptimized />
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-bold text-base leading-tight mb-1 group-hover:text-primary transition-colors">{article.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><ExternalLink size={10} /> Dipublikasikan secara publik</p>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="rounded-md">{article.category}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Lihat Komentar" onClick={() => handleManageComments(article)} className="hover:bg-primary/10 hover:text-primary">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Edit Berita" onClick={() => handleEdit(article)} className="hover:bg-accent/10">
                          <Edit className="h-4 w-4 text-accent-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Hapus Berita" onClick={() => handleDelete(article.id)} className="hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                !isLoading && <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Belum ada berita yang dipublikasikan.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
