'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { type PortfolioItem } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, FolderKanban, Link as LinkIcon, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';

const formSchema = z.object({
  title: z.string().min(3, 'Judul karya minimal 3 karakter.'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter.'),
  imageUrl: z.string().url('URL gambar tidak valid.'),
  projectUrl: z.string().url('URL proyek tidak valid.').optional().or(z.literal('')),
});

export function PortofolioDigital() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const portfolioQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    const ref = collection(firestore, `users/${user.uid}/portfolio`);
    return query(ref, orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: portfolioItems, isLoading } = useCollection<PortfolioItem>(portfolioQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '', imageUrl: '', projectUrl: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingItem(null);
      form.reset({ title: '', description: '', imageUrl: '', projectUrl: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingItem(null);
    form.reset();
    setIsDialogOpen(true);
  };
  
  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    form.reset(item);
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) return;
    
    if (editingItem) {
      const docRef = doc(firestore, `users/${user.uid}/portfolio`, editingItem.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Berhasil!', description: 'Karya Anda telah diperbarui.' });
    } else {
      const ref = collection(firestore, `users/${user.uid}/portfolio`);
      addDocumentNonBlocking(ref, { ...values, createdAt: serverTimestamp() });
      toast({ title: 'Berhasil!', description: 'Karya baru telah ditambahkan ke portofolio.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore || !user) return;
    if (confirm('Apakah Anda yakin ingin menghapus karya ini?')) {
      const docRef = doc(firestore, `users/${user.uid}/portfolio`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Karya telah dihapus dari portofolio.' });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><FolderKanban /> Portofolio Digital Saya</CardTitle>
            <CardDescription>Kelola dan pamerkan karya-karya terbaik Anda di sini. Portofolio ini dapat dilihat oleh calon perusahaan atau universitas.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-6">
                <PlusCircle className="mr-2" /> Tambah Karya Baru
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit Karya' : 'Tambah Karya Baru'}</DialogTitle>
                    <DialogDescription>Tambahkan karya terbaikmu ke portofolio. Klik simpan jika sudah selesai.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Judul Karya/Proyek</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
                        <FormItem><FormLabel>URL Gambar</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="projectUrl" render={({ field }) => (
                        <FormItem><FormLabel>URL Proyek (Opsional)</FormLabel><FormControl><Input {...field} placeholder="https://github.com/..." /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Deskripsi</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <DialogFooter>
                        <DialogClose asChild><Button variant="ghost">Batal</Button></DialogClose>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <LoaderCircle className="animate-spin mr-2"/>}
                            Simpan
                        </Button>
                    </DialogFooter>
                    </form>
                </Form>
                </DialogContent>
            </Dialog>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading && Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="rounded-2xl h-80 w-full" />)}
                {portfolioItems && portfolioItems.map((item) => (
                    <Card key={item.id} className="rounded-2xl shadow-md overflow-hidden flex flex-col group">
                        <div className="relative aspect-video bg-muted">
                             <Image src={convertGoogleDriveLink(item.imageUrl)} alt={item.title} fill className="object-cover" unoptimized/>
                             <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="secondary" onClick={() => handleEdit(item)}><Edit size={16}/></Button>
                                <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 size={16}/></Button>
                             </div>
                        </div>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                             <p className="text-sm text-muted-foreground">{item.description}</p>
                        </CardContent>
                        <CardFooter>
                            {item.projectUrl && (
                                <Button asChild variant="outline" size="sm">
                                    <a href={item.projectUrl} target='_blank' rel='noopener noreferrer'><ExternalLink size={14}/> Lihat Proyek</a>
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
                 {!isLoading && portfolioItems?.length === 0 && (
                    <p className="col-span-full text-center text-muted-foreground py-10">Anda belum memiliki portofolio. Mulai tambahkan karya terbaik Anda!</p>
                )}
            </div>
        </CardContent>
    </Card>
  );
}

    
