'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type Alumnus } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, GraduationCap } from 'lucide-react';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(3, 'Nama alumnus harus diisi.'),
  graduationYear: z.string().min(4, 'Tahun lulus harus diisi.'),
  occupation: z.string().min(3, 'Pekerjaan/Aktivitas harus diisi.'),
  photoUrl: z.string().url('URL foto tidak valid.'),
  notes: z.string().optional(),
});

export function AlumniManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlumnus, setEditingAlumnus] = useState<Alumnus | null>(null);

  const alumniQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/alumni`);
    return query(ref, orderBy('name'));
  }, [firestore]);

  const { data: alumni, isLoading } = useCollection<Alumnus>(alumniQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', graduationYear: '', occupation: '', photoUrl: '', notes: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingAlumnus(null);
      form.reset({ name: '', graduationYear: '', occupation: '', photoUrl: '', notes: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingAlumnus(null);
    form.reset();
    setIsDialogOpen(true);
  };
  
  const handleEdit = (alumnus: Alumnus) => {
    setEditingAlumnus(alumnus);
    form.reset(alumnus);
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    if (editingAlumnus) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/alumni`, editingAlumnus.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Berhasil!', description: 'Data alumni telah diperbarui.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/alumni`);
      addDocumentNonBlocking(ref, values);
      toast({ title: 'Berhasil!', description: 'Alumni baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus data alumni ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/alumni`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Data alumni telah dihapus.' });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><GraduationCap /> Manajemen Alumni</CardTitle>
            <CardDescription>Kelola database alumni sekolah untuk keperluan tracer study dan networking.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Alumni Baru
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingAlumnus ? 'Edit Data Alumni' : 'Tambah Alumni Baru'}</DialogTitle>
                    <DialogDescription>Lengkapi data alumni di bawah ini. Klik simpan jika sudah selesai.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="graduationYear" render={({ field }) => (
                        <FormItem><FormLabel>Tahun Lulus</FormLabel><FormControl><Input {...field} placeholder="e.g. 2021" /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="occupation" render={({ field }) => (
                        <FormItem><FormLabel>Pekerjaan / Aktivitas Saat Ini</FormLabel><FormControl><Input {...field} placeholder="e.g. Bekerja di PT. Sejahtera" /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="photoUrl" render={({ field }) => (
                        <FormItem><FormLabel>URL Foto</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="notes" render={({ field }) => (
                        <FormItem><FormLabel>Catatan Admin (Opsional)</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
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
                    <TableHead>Foto</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Lulus</TableHead>
                    <TableHead>Pekerjaan/Aktivitas</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">Memuat data alumni...</TableCell>
                    </TableRow>
                    )}
                    {alumni && alumni.length > 0 ? (
                    alumni.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <Image src={convertGoogleDriveLink(item.photoUrl || 'https://picsum.photos/seed/logo/40/40')} alt={item.name} width={40} height={40} className="rounded-full object-cover" unoptimized />
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.graduationYear}</TableCell>
                            <TableCell>{item.occupation}</TableCell>
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
                    !isLoading && <TableRow><TableCell colSpan={5} className="text-center">Belum ada data alumni. Mulai tambahkan!</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}

    

    
