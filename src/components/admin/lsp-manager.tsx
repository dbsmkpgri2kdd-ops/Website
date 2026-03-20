'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type LspCertification } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(5, 'Nama skema minimal 5 karakter.'),
  schemaNumber: z.string().min(3, 'Nomor skema harus diisi.'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter.'),
});

export function LspManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<LspCertification | null>(null);

  const certsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/lspCertifications`);
    return query(ref, orderBy('name'));
  }, [firestore]);

  const { data: certs, isLoading } = useCollection<LspCertification>(certsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', schemaNumber: '', description: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingCert(null);
      form.reset({ name: '', schemaNumber: '', description: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingCert(null);
    form.reset();
    setIsDialogOpen(true);
  };
  
  const handleEdit = (cert: LspCertification) => {
    setEditingCert(cert);
    form.reset(cert);
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    if (editingCert) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/lspCertifications`, editingCert.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Berhasil!', description: 'Skema sertifikasi telah diperbarui.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/lspCertifications`);
      addDocumentNonBlocking(ref, values);
      toast({ title: 'Berhasil!', description: 'Skema sertifikasi baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus skema ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/lspCertifications`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Skema sertifikasi telah dihapus.' });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck /> Manajemen LSP</CardTitle>
            <CardDescription>Kelola daftar skema sertifikasi yang ditawarkan oleh LSP sekolah.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Skema Baru
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingCert ? 'Edit Skema Sertifikasi' : 'Tambah Skema Baru'}</DialogTitle>
                    <DialogDescription>Lengkapi data skema sertifikasi. Klik simpan jika sudah selesai.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nama Skema Sertifikasi</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="schemaNumber" render={({ field }) => (
                        <FormItem><FormLabel>Nomor Skema</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
                    <TableHead>Nama Skema</TableHead>
                    <TableHead>Nomor Skema</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">Memuat data...</TableCell>
                    </TableRow>
                    )}
                    {certs && certs.length > 0 ? (
                    certs.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.schemaNumber}</TableCell>
                            <TableCell className="max-w-xs truncate">{item.description}</TableCell>
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
                    !isLoading && <TableRow><TableCell colSpan={4} className="text-center">Belum ada skema. Mulai tambahkan!</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}

    
