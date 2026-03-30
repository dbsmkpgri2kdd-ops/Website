'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type Facility } from '@/lib/data';
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
  DialogDescription
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
import { PlusCircle, Trash2, Edit, LoaderCircle, Building } from 'lucide-react';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(3, 'Nama fasilitas minimal 3 karakter.'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter.'),
  imageUrl: z.string().url('URL gambar tidak valid.'),
});

export function FacilitiesManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);

  const facilitiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const facilitiesRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/facilities`);
    return query(facilitiesRef, orderBy('name'));
  }, [firestore]);

  const { data: facilities, isLoading } = useCollection<Facility>(facilitiesQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', description: '', imageUrl: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingFacility(null);
      form.reset({ name: '', description: '', imageUrl: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingFacility(null);
    form.reset({ name: '', description: '', imageUrl: '' });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility);
    form.reset({
      name: facility.name,
      description: facility.description,
      imageUrl: facility.imageUrl,
    });
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    if (editingFacility) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/facilities`, editingFacility.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Berhasil!', description: 'Fasilitas telah diperbarui.' });
    } else {
      const facilitiesRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/facilities`);
      addDocumentNonBlocking(facilitiesRef, values);
      toast({ title: 'Berhasil!', description: 'Fasilitas baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus fasilitas ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/facilities`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Fasilitas telah dihapus.' });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building /> Manajemen Fasilitas</CardTitle>
            <CardDescription>Kelola daftar fasilitas yang dimiliki sekolah.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Fasilitas
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingFacility ? 'Edit Fasilitas' : 'Tambah Fasilitas Baru'}</DialogTitle>
                    <DialogDescription>Lengkapi detail fasilitas. Klik simpan jika sudah selesai.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nama Fasilitas</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
                        <FormItem><FormLabel>URL Gambar</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Deskripsi Singkat</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
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
                    <TableHead>Nama Fasilitas</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">Memuat fasilitas...</TableCell>
                    </TableRow>
                    )}
                    {facilities && facilities.length > 0 ? (
                    facilities.map((facility) => (
                        <TableRow key={facility.id}>
                            <TableCell>
                                <div className="relative w-20 h-14 rounded-md overflow-hidden">
                                  <Image src={convertGoogleDriveLink(facility.imageUrl || 'https://picsum.photos/seed/placeholder/80/60')} alt={facility.name} fill className="object-cover" unoptimized />
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">{facility.name}</TableCell>
                            <TableCell className="max-w-sm truncate">{facility.description}</TableCell>
                            <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(facility)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(facility.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    !isLoading && <TableRow><TableCell colSpan={4} className="text-center">Belum ada fasilitas. Mulai tambahkan!</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}