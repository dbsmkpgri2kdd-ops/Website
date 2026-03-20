'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type Testimonial } from '@/lib/data';
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
import { PlusCircle, Trash2, Edit, LoaderCircle, Quote } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  studentName: z.string().min(3, 'Nama alumnus harus diisi.'),
  graduationYear: z.string().min(4, 'Tahun lulus harus diisi (misal: 2020).'),
  occupation: z.string().min(3, 'Pekerjaan/aktivitas saat ini harus diisi.'),
  content: z.string().min(20, 'Isi testimoni minimal 20 karakter.'),
  studentPhotoUrl: z.string().url('URL foto tidak valid.'),
});

export function TestimonialsManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const testimonialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/testimonials`);
    return query(ref, orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: testimonials, isLoading } = useCollection<Testimonial>(testimonialsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { studentName: '', graduationYear: '', occupation: '', content: '', studentPhotoUrl: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingTestimonial(null);
      form.reset({ studentName: '', graduationYear: '', occupation: '', content: '', studentPhotoUrl: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingTestimonial(null);
    form.reset({ studentName: '', graduationYear: '', occupation: '', content: '', studentPhotoUrl: '' });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    form.reset(testimonial);
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;

    if (editingTestimonial) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/testimonials`, editingTestimonial.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Berhasil!', description: 'Testimoni telah diperbarui.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/testimonials`);
      addDocumentNonBlocking(ref, { ...values, createdAt: serverTimestamp() });
      toast({ title: 'Berhasil!', description: 'Testimoni baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/testimonials`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Testimoni telah dihapus.' });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Quote /> Manajemen Testimoni</CardTitle>
            <CardDescription>Kelola testimoni dari para alumni untuk ditampilkan di situs.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Testimoni
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingTestimonial ? 'Edit Testimoni' : 'Tambah Testimoni Baru'}</DialogTitle>
                    <DialogDescription>Lengkapi detail testimoni dari alumni. Klik simpan jika sudah selesai.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="studentName" render={({ field }) => (
                            <FormItem><FormLabel>Nama Alumnus</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="graduationYear" render={({ field }) => (
                            <FormItem><FormLabel>Tahun Lulus</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="occupation" render={({ field }) => (
                            <FormItem><FormLabel>Pekerjaan / Aktivitas</FormLabel><FormControl><Input {...field} placeholder="e.g. Kuliah di UGM" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="studentPhotoUrl" render={({ field }) => (
                            <FormItem><FormLabel>URL Foto Alumnus</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="content" render={({ field }) => (
                            <FormItem><FormLabel>Isi Testimoni</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
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
                    <TableHead>Alumnus</TableHead>
                    <TableHead>Tahun Lulus</TableHead>
                    <TableHead>Pekerjaan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">Memuat data testimoni...</TableCell>
                    </TableRow>
                    )}
                    {testimonials && testimonials.length > 0 ? (
                    testimonials.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.studentName}</TableCell>
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
                    !isLoading && <TableRow><TableCell colSpan={4} className="text-center">Belum ada testimoni. Mulai tambahkan!</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}

    
