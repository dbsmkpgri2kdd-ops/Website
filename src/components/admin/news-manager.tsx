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
      <CardHeader className="bg-primary/5 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2"><Newspaper /> Manajemen Berita</CardTitle>
            <CardDescription>Kelola artikel informasi publik sekolah.</CardDescription>
          </div>
          <Button onClick={handleAddNew} size="sm" className="font-bold w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Tulis Berita
          </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl">{editingArticle ? 'Ubah Artikel' : 'Tulis Berita Baru'}</DialogTitle>
              <DialogDescription>Lengkapi informasi berita di bawah ini.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-5 pt-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Judul Artikel</FormLabel><FormControl><Input {...field} placeholder="Judul berita..." className="md:h-12 text-base md:text-lg font-semibold" /></FormControl><FormMessage /></FormItem>
                )}/>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem><FormLabel>Kategori</FormLabel><FormControl><Input {...field} placeholder="e.g. Prestasi, Acara" /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="imageUrl" render={({ field }) => (
                      <FormItem><FormLabel>URL Gambar Utama</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                  )}/>
                </div>
                <FormField control={form.control} name="content" render={({ field }) => (
                    <FormItem><FormLabel>Isi Berita</FormLabel><FormControl><Textarea rows={10} {...field} placeholder="Tuliskan berita di sini..." /></FormControl><FormMessage /></FormItem>
                )}/>
                <div className="flex flex-col-reverse md:flex-row justify-end gap-3 border-t pt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="w-full md:w-auto">Batal</Button>
                  <Button type="submit" className="font-bold w-full md:w-[150px]" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-2"/> : null}
                    {editingArticle ? 'Simpan' : 'Publikasikan'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={isCommentManagerOpen} onOpenChange={setIsCommentManagerOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle>Moderasi Komentar</DialogTitle>
              <DialogDescription className="truncate">Berita: "{selectedArticleForComments?.title}"</DialogDescription>
            </DialogHeader>
            <div className="mt-4 overflow-x-auto">
              {selectedArticleForComments && <CommentManager article={selectedArticleForComments} />}
            </div>
          </DialogContent>
        </Dialog>

        <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[80px] md:w-[100px]">Cover</TableHead>
                <TableHead>Berita</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
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
                      <div className="relative w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden border bg-muted shadow-sm">
                        <Image src={convertGoogleDriveLink(article.imageUrl)} alt={article.title} fill className="object-cover" unoptimized />
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-bold text-sm md:text-base leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">{article.title}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">Publikasi aktif</p>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="rounded-md text-[10px] md:text-xs">{article.category}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Komentar" onClick={() => handleManageComments(article)} className="h-8 w-8 hover:bg-primary/10 text-primary">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEdit(article)} className="h-8 w-8 hover:bg-accent/10">
                          <Edit className="h-4 w-4 text-accent-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Hapus" onClick={() => handleDelete(article.id)} className="h-8 w-8 hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                !isLoading && <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Belum ada berita.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}