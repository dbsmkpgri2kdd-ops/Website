'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type TeachingFactoryProduct } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, Factory } from 'lucide-react';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter.'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter.'),
  imageUrl: z.string().url('URL gambar tidak valid.'),
  price: z.string().optional(),
  studentCreator: z.string().optional(),
});

export function TeachingFactoryManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<TeachingFactoryProduct | null>(null);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/teachingFactoryProducts`);
    return query(ref, orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: products, isLoading } = useCollection<TeachingFactoryProduct>(productsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', description: '', imageUrl: '', price: '', studentCreator: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingProduct(null);
      form.reset({ name: '', description: '', imageUrl: '', price: '', studentCreator: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingProduct(null);
    form.reset();
    setIsDialogOpen(true);
  };
  
  const handleEdit = (product: TeachingFactoryProduct) => {
    setEditingProduct(product);
    // Modifikasi baris di bawah ini agar studentCreator dikonversi ke string jika perlu
    form.reset({
      ...product,
      studentCreator: typeof product.studentCreator === 'object' 
        ? product.studentCreator.name 
        : product.studentCreator
    });
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    if (editingProduct) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/teachingFactoryProducts`, editingProduct.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Berhasil!', description: 'Produk telah diperbarui.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/teachingFactoryProducts`);
      addDocumentNonBlocking(ref, { ...values, createdAt: serverTimestamp() });
      toast({ title: 'Berhasil!', description: 'Produk baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/teachingFactoryProducts`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Produk telah dihapus.' });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Factory /> Manajemen Teaching Factory</CardTitle>
            <CardDescription>Kelola produk atau proyek hasil karya siswa yang ditampilkan.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Produk/Proyek Baru
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
                    <DialogDescription>Lengkapi data produk atau proyek. Klik simpan jika sudah selesai.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nama Produk/Proyek</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
                        <FormItem><FormLabel>URL Gambar</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Deskripsi</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem><FormLabel>Harga (Opsional)</FormLabel><FormControl><Input {...field} placeholder="e.g. Rp 100.000" /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="studentCreator" render={({ field }) => (
                        <FormItem><FormLabel>Kreator/Kelas (Opsional)</FormLabel><FormControl><Input {...field} placeholder="e.g. XII TKJ 1" /></FormControl><FormMessage /></FormItem>
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
                    <TableHead>Gambar</TableHead>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Kreator</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">Memuat produk...</TableCell>
                    </TableRow>
                    )}
                    {products && products.length > 0 ? (
                    products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell>
                                <Image src={convertGoogleDriveLink(product.imageUrl || 'https://picsum.photos/seed/product/60/60')} alt={product.name} width={60} height={60} className="rounded-md object-cover" unoptimized />
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.price || 'N/A'}</TableCell>
                            <TableCell>{product.studentCreator || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    !isLoading && <TableRow><TableCell colSpan={5} className="text-center">Belum ada produk. Mulai tambahkan!</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}

    
