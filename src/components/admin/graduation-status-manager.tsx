'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type GraduationStatus } from '@/lib/data';
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
import { PlusCircle, Trash2, Edit, LoaderCircle, BadgeCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  studentIdentifier: z.string().min(5, 'Nomor identitas harus diisi (e.g., NISN).'),
  studentName: z.string().min(3, 'Nama siswa harus diisi.'),
  status: z.enum(["LULUS", "TIDAK LULUS", "DIPROSES"]),
  notes: z.string().optional(),
});

export function GraduationStatusManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<GraduationStatus | null>(null);

  const statusesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/graduationStatuses`);
    return query(ref, orderBy('studentName'));
  }, [firestore]);

  const { data: statuses, isLoading } = useCollection<GraduationStatus>(statusesQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { studentIdentifier: '', studentName: '', notes: '', status: 'DIPROSES' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingStatus(null);
      form.reset({ studentIdentifier: '', studentName: '', notes: '', status: 'DIPROSES' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingStatus(null);
    form.reset({ studentIdentifier: '', studentName: '', notes: '', status: 'DIPROSES' });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (status: GraduationStatus) => {
    setEditingStatus(status);
    form.reset({
      studentIdentifier: status.studentIdentifier,
      studentName: status.studentName,
      status: status.status,
      notes: status.notes || '',
    });
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    if (editingStatus) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/graduationStatuses`, editingStatus.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Berhasil!', description: 'Status kelulusan telah diperbarui.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/graduationStatuses`);
      addDocumentNonBlocking(ref, values);
      toast({ title: 'Berhasil!', description: 'Status kelulusan baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/graduationStatuses`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Data status kelulusan telah dihapus.' });
    }
  }

  const getBadgeVariant = (status: GraduationStatus['status']) => {
    switch(status) {
        case 'LULUS': return 'default';
        case 'TIDAK LULUS': return 'destructive';
        case 'DIPROSES': return 'secondary';
        default: return 'outline';
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><BadgeCheck /> Manajemen Status Kelulusan</CardTitle>
            <CardDescription>Kelola data kelulusan siswa untuk ditampilkan di halaman publik.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Data Kelulusan
            </Button>
            <div className="rounded-lg border overflow-hidden">
                <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                    <TableHead>No. Induk/Pendaftaran</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center py-10">Memuat data...</TableCell>
                    </TableRow>
                    )}
                    {statuses && statuses.length > 0 ? (
                    statuses.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-mono">{item.studentIdentifier}</TableCell>
                            <TableCell className="font-medium">{item.studentName}</TableCell>
                            <TableCell><Badge variant={getBadgeVariant(item.status)}>{item.status}</Badge></TableCell>
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
                    !isLoading && <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Belum ada data status kelulusan.</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingStatus ? 'Edit Status Kelulusan' : 'Tambah Data Baru'}</DialogTitle>
                    <DialogDescription>Lengkapi data kelulusan siswa. Klik simpan jika sudah selesai.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="studentIdentifier" render={({ field }) => (
                        <FormItem><FormLabel>Nomor Induk / Pendaftaran</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="studentName" render={({ field }) => (
                        <FormItem><FormLabel>Nama Lengkap Siswa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="LULUS">LULUS</SelectItem>
                                    <SelectItem value="TIDAK LULUS">TIDAK LULUS</SelectItem>
                                    <SelectItem value="DIPROSES">DIPROSES</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="notes" render={({ field }) => (
                        <FormItem><FormLabel>Catatan (Opsional)</FormLabel><FormControl><Textarea rows={3} {...field} placeholder="e.g. Lulus dengan pujian" /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <LoaderCircle className="animate-spin mr-2"/>}
                        Simpan
                    </Button>
                    </form>
                </Form>
                </DialogContent>
            </Dialog>
        </CardContent>
    </Card>
  );
}