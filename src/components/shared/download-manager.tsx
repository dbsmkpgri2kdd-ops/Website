'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type DownloadableFile } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  title: z.string().min(5, 'Judul file minimal 5 karakter.'),
  description: z.string().optional(),
  fileUrl: z.string().url('URL file tidak valid.'),
  category: z.string().min(3, 'Kategori harus diisi.'),
});

export function DownloadManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<DownloadableFile | null>(null);

  const filesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/downloadableFiles`);
    return query(ref, orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: files, isLoading } = useCollection<DownloadableFile>(filesQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '', fileUrl: '', category: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingFile(null);
      form.reset({ title: '', description: '', fileUrl: '', category: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingFile(null);
    form.reset({ title: '', description: '', fileUrl: '', category: '' });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (file: DownloadableFile) => {
    setEditingFile(file);
    form.reset(file);
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;

    if (editingFile) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/downloadableFiles`, editingFile.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Berhasil!', description: 'Data file telah diperbarui.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/downloadableFiles`);
      addDocumentNonBlocking(ref, { ...values, createdAt: serverTimestamp() });
      toast({ title: 'Berhasil!', description: 'File baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus file ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/downloadableFiles`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Data file telah dihapus.' });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText /> Manajemen Pusat Unduhan</CardTitle>
            <CardDescription>Kelola file-file yang dapat diunduh oleh pengunjung situs.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah File Baru
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingFile ? 'Edit File' : 'Tambah File Baru'}</DialogTitle>
                    <DialogDescription>
                      Lengkapi detail file yang akan diunggah. Klik simpan jika sudah selesai.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Judul File</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel>Kategori</FormLabel><FormControl><Input {...field} placeholder="e.g. Formulir, Modul Belajar" /></FormControl><FormMessage /></FormItem>
                     )}/>
                    <FormField control={form.control} name="fileUrl" render={({ field }) => (
                        <FormItem><FormLabel>URL File</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Deskripsi (Opsional)</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
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
                    <TableHead>Judul File</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">Memuat data file...</TableCell>
                    </TableRow>
                    )}
                    {files && files.length > 0 ? (
                    files.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium max-w-xs truncate">{item.title}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell className="max-w-xs truncate text-muted-foreground">{item.description}</TableCell>
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
                    !isLoading && <TableRow><TableCell colSpan={4} className="text-center">Belum ada file. Mulai tambahkan!</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
