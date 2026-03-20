'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type IndustryPartner } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, Building2 } from 'lucide-react';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(3, 'Nama mitra minimal 3 karakter.'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter.'),
  logoUrl: z.string().url('URL logo tidak valid.'),
  websiteUrl: z.string().url('URL website tidak valid.').optional().or(z.literal('')),
});

export function IndustryPartnersManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<IndustryPartner | null>(null);

  const partnersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const partnersRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/industryPartners`);
    return query(partnersRef, orderBy('name'));
  }, [firestore]);

  const { data: partners, isLoading } = useCollection<IndustryPartner>(partnersQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', description: '', logoUrl: '', websiteUrl: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingPartner(null);
      form.reset({ name: '', description: '', logoUrl: '', websiteUrl: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingPartner(null);
    form.reset({ name: '', description: '', logoUrl: '', websiteUrl: '' });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (partner: IndustryPartner) => {
    setEditingPartner(partner);
    form.reset(partner);
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    if (editingPartner) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/industryPartners`, editingPartner.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Berhasil!', description: 'Mitra industri telah diperbarui.' });
    } else {
      const partnersRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/industryPartners`);
      addDocumentNonBlocking(partnersRef, values);
      toast({ title: 'Berhasil!', description: 'Mitra industri baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus mitra ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/industryPartners`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Mitra industri telah dihapus.' });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 /> Manajemen Mitra Industri</CardTitle>
            <CardDescription>Kelola daftar perusahaan dan institusi yang bekerja sama dengan sekolah.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Mitra Baru
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingPartner ? 'Edit Mitra Industri' : 'Tambah Mitra Baru'}</DialogTitle>
                    <DialogDescription>Lengkapi data mitra industri. Klik simpan jika sudah selesai.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nama Perusahaan/Institusi</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="logoUrl" render={({ field }) => (
                        <FormItem><FormLabel>URL Logo</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="websiteUrl" render={({ field }) => (
                        <FormItem><FormLabel>URL Website (Opsional)</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Deskripsi Singkat Kerja Sama</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
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
                    <TableHead>Logo</TableHead>
                    <TableHead>Nama Mitra</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">Memuat data mitra...</TableCell>
                    </TableRow>
                    )}
                    {partners && partners.length > 0 ? (
                    partners.map((partner) => (
                        <TableRow key={partner.id}>
                            <TableCell>
                                <Image src={convertGoogleDriveLink(partner.logoUrl || '/logo.png')} alt={partner.name} width={60} height={60} className="rounded-md object-contain" />
                            </TableCell>
                            <TableCell className="font-medium">{partner.name}</TableCell>
                            <TableCell className="max-w-sm truncate">{partner.description}</TableCell>
                            <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(partner)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(partner.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    !isLoading && <TableRow><TableCell colSpan={4} className="text-center">Belum ada mitra industri. Mulai tambahkan!</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}

    
