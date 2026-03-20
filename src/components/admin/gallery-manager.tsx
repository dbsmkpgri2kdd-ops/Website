'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type GalleryImage } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, LoaderCircle, Image as ImageIcon, Film } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  mediaType: z.string({ required_error: 'Tipe media harus dipilih.' }),
  imageUrl: z.string().url('URL media tidak valid.'),
  description: z.string().min(3, 'Deskripsi minimal 3 karakter.'),
  imageHint: z.string().optional(),
});

export function GalleryManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const galleryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const galleryRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/gallery`);
    return query(galleryRef, orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: images, isLoading } = useCollection<GalleryImage>(galleryQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { mediaType: 'image', imageUrl: '', description: '', imageHint: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      form.reset({ mediaType: 'image', imageUrl: '', description: '', imageHint: '' });
    }
  }, [isDialogOpen, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    const galleryRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/gallery`);
    addDocumentNonBlocking(galleryRef, { ...values, createdAt: serverTimestamp() });
    toast({ title: 'Berhasil!', description: 'Media baru telah ditambahkan ke galeri.' });
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus media ini dari galeri?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/gallery`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Media telah dihapus.' });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><ImageIcon /> Manajemen Galeri</CardTitle>
            <CardDescription>Kelola gambar dan video yang tampil di halaman galeri.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={() => setIsDialogOpen(true)} className="w-full">
                <PlusCircle className="mr-2" /> Tambah Media Baru
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Media ke Galeri</DialogTitle>
                    <DialogDescription>Unggah gambar atau video baru ke galeri publik.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="mediaType" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipe Media</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih tipe media" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="image">Gambar</SelectItem>
                                    <SelectItem value="video">Video</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
                        <FormItem><FormLabel>URL Media</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Deskripsi Singkat</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="imageHint" render={({ field }) => (
                        <FormItem><FormLabel>Petunjuk AI (opsional)</FormLabel><FormControl><Input {...field} placeholder="e.g. students classroom" /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <LoaderCircle className="animate-spin mr-2"/>}
                        Simpan Media
                    </Button>
                    </form>
                </Form>
                </DialogContent>
            </Dialog>

            <ScrollArea className="h-96 mt-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                    {isLoading && Array.from({length: 4}).map((_, i) => <div key={i} className="relative aspect-square"><div className="absolute inset-0 bg-muted rounded-md animate-pulse"></div></div>)}
                    {images?.map(image => (
                        <div key={image.id} className="relative aspect-square group bg-muted rounded-md overflow-hidden">
                             {image.mediaType === 'video' 
                                ? <div className="w-full h-full flex items-center justify-center"><Film className="w-16 h-16 text-muted-foreground" /></div>
                                : <Image src={convertGoogleDriveLink(image.imageUrl)} alt={image.description} fill className="object-cover" unoptimized />
                            }
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button variant="destructive" size="icon" onClick={() => handleDelete(image.id)}>
                                    <Trash2 />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {!isLoading && images?.length === 0 && <p className="text-sm text-muted-foreground col-span-2 text-center py-8">Belum ada media di galeri.</p>}
                </div>
            </ScrollArea>
        </CardContent>
    </Card>
  );
}

    
