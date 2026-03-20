'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type Teacher } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, Users } from 'lucide-react';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(3, 'Nama harus diisi.'),
  title: z.string().min(5, 'Jabatan/Mapel minimal 5 karakter.'),
  photoUrl: z.string().url('URL foto tidak valid.'),
  bio: z.string().optional(),
  email: z.string().email('Email tidak valid.').optional().or(z.literal('')),
});

export function TeachersManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const teachersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/teachers`);
    return query(ref, orderBy('name'));
  }, [firestore]);

  const { data: teachers, isLoading } = useCollection<Teacher>(teachersQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', title: '', photoUrl: '', bio: '', email: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingTeacher(null);
      form.reset({ name: '', title: '', photoUrl: '', bio: '', email: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingTeacher(null);
    form.reset();
    setIsDialogOpen(true);
  };
  
  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    form.reset(teacher);
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    if (editingTeacher) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/teachers`, editingTeacher.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Berhasil!', description: 'Data guru/staf telah diperbarui.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/teachers`);
      addDocumentNonBlocking(ref, values);
      toast({ title: 'Berhasil!', description: 'Data guru/staf baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/teachers`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Data telah dihapus.' });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> Manajemen Staf & Guru</CardTitle>
            <CardDescription>Kelola daftar guru dan staf yang mengajar dan bekerja di sekolah.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Staf/Guru Baru
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingTeacher ? 'Edit Data Staf/Guru' : 'Tambah Staf/Guru Baru'}</DialogTitle>
                    <DialogDescription>Lengkapi data guru atau staf. Klik simpan jika sudah selesai.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Jabatan / Mata Pelajaran</FormLabel><FormControl><Input {...field} placeholder="e.g. Guru Matematika" /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="photoUrl" render={({ field }) => (
                        <FormItem><FormLabel>URL Foto</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email (Opsional)</FormLabel><FormControl><Input type="email" {...field} placeholder="guru@sekolah.sch.id"/></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="bio" render={({ field }) => (
                        <FormItem><FormLabel>Bio Singkat (Opsional)</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
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
                    <TableHead>Jabatan/Mapel</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">Memuat data...</TableCell>
                    </TableRow>
                    )}
                    {teachers && teachers.length > 0 ? (
                    teachers.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <Image src={convertGoogleDriveLink(item.photoUrl || 'https://picsum.photos/seed/teacher/40/40')} alt={item.name} width={40} height={40} className="rounded-full object-cover" unoptimized />
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.title}</TableCell>
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
                    !isLoading && <TableRow><TableCell colSpan={4} className="text-center">Belum ada data. Mulai tambahkan!</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}

    

    
