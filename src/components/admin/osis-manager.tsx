'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, orderBy, serverTimestamp, doc } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type OsisPost } from '@/lib/data';
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
import { PlusCircle, Trash2, Edit, LoaderCircle, Megaphone } from 'lucide-react';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  title: z.string().min(10, 'Judul postingan minimal 10 karakter.'),
  category: z.string().min(3, 'Kategori harus diisi.'),
  content: z.string().min(20, 'Konten postingan minimal 20 karakter.'),
  imageUrl: z.string().url('URL gambar tidak valid.'),
});

export function OsisManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<OsisPost | null>(null);

  const osisQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const osisRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/osisPosts`);
    return query(osisRef, orderBy('datePublished', 'desc'));
  }, [firestore]);

  const { data: posts, isLoading } = useCollection<OsisPost>(osisQuery);

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
      setEditingPost(null);
      form.reset({ title: '', category: '', content: '', imageUrl: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingPost(null);
    form.reset({ title: '', category: '', content: '', imageUrl: '' });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (post: OsisPost) => {
    setEditingPost(post);
    form.reset(post);
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    if (editingPost) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/osisPosts`, editingPost.id);
      updateDocumentNonBlocking(docRef, values);
      toast({
        title: 'Berhasil!',
        description: 'Postingan OSIS telah diperbarui.',
      });
    } else {
      const osisRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/osisPosts`);
      addDocumentNonBlocking(osisRef, {
        ...values,
        schoolId: SCHOOL_DATA_ID,
        datePublished: serverTimestamp(),
      });
      toast({
        title: 'Berhasil!',
        description: 'Postingan OSIS baru telah ditambahkan.',
      });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus postingan ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/osisPosts`, id);
      deleteDocumentNonBlocking(docRef);
      toast({
        variant: 'destructive',
        title: 'Dihapus!',
        description: 'Postingan OSIS telah dihapus.',
      });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
      <CardHeader>
          <CardTitle className="flex items-center gap-2"><Megaphone /> Manajemen Osis Corner</CardTitle>
          <CardDescription>Buat, edit, dan kelola postingan untuk halaman OSIS.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAddNew} className="w-full mb-4">
          <PlusCircle className="mr-2" /> Tambah Postingan Baru
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Postingan' : 'Tambah Postingan Baru'}</DialogTitle>
              <DialogDescription>Tulis atau edit postingan untuk OSIS corner. Klik simpan jika sudah selesai.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul Postingan</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. Pengumuman, Kegiatan" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Gambar</FormLabel>
                      <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Isi Postingan</FormLabel>
                      <FormControl><Textarea rows={5} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <LoaderCircle className="animate-spin mr-2"/>}
                  Simpan Postingan
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gambar</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Memuat postingan...
                  </TableCell>
                </TableRow>
              )}
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <Image src={convertGoogleDriveLink(post.imageUrl || 'https://picsum.photos/seed/osis/80/60')} alt={post.title} width={80} height={60} className="rounded-md object-cover" unoptimized />
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                    <TableCell>{post.category}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                !isLoading && <TableRow><TableCell colSpan={4} className="text-center">Belum ada postingan. Mulai tambahkan!</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

    
