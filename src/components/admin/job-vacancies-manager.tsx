'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type JobVacancy } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, Briefcase, CalendarIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
  title: z.string().min(5, 'Judul pekerjaan minimal 5 karakter.'),
  companyName: z.string().min(3, 'Nama perusahaan harus diisi.'),
  location: z.string().min(3, 'Lokasi harus diisi.'),
  description: z.string().min(20, 'Deskripsi pekerjaan minimal 20 karakter.'),
  requirements: z.string().min(10, 'Persyaratan minimal 10 karakter.'),
  applyUrl: z.string().url('URL untuk melamar tidak valid.'),
  closingDate: z.date().optional(),
});

export function JobVacanciesManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<JobVacancy | null>(null);

  const vacanciesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/jobVacancies`);
    return query(ref, orderBy('postedDate', 'desc'));
  }, [firestore]);

  const { data: vacancies, isLoading } = useCollection<JobVacancy>(vacanciesQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', companyName: '', location: '', description: '', requirements: '', applyUrl: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingVacancy(null);
      form.reset({ title: '', companyName: '', location: '', description: '', requirements: '', applyUrl: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingVacancy(null);
    form.reset();
    setIsDialogOpen(true);
  };
  
  const handleEdit = (vacancy: JobVacancy) => {
    setEditingVacancy(vacancy);
    form.reset({
        ...vacancy,
        requirements: vacancy.requirements.join('\n'),
        closingDate: vacancy.closingDate?.toDate(),
    });
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    const dataToSave = { 
        ...values,
        requirements: values.requirements.split('\n').filter(req => req.trim() !== ''),
    };

    if (editingVacancy) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/jobVacancies`, editingVacancy.id);
      updateDocumentNonBlocking(docRef, dataToSave);
      toast({ title: 'Berhasil!', description: 'Data lowongan telah diperbarui.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/jobVacancies`);
      addDocumentNonBlocking(ref, { ...dataToSave, postedDate: serverTimestamp() });
      toast({ title: 'Berhasil!', description: 'Lowongan baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus lowongan ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/jobVacancies`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Data lowongan telah dihapus.' });
    }
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const jsDate = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return format(jsDate, "d MMM yyyy");
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Briefcase /> Manajemen Bursa Kerja (BKK)</CardTitle>
            <CardDescription>Kelola daftar lowongan pekerjaan untuk ditampilkan di halaman BKK.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Lowongan Baru
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingVacancy ? 'Edit Lowongan' : 'Tambah Lowongan Baru'}</DialogTitle>
                    <DialogDescription>Isi detail lowongan pekerjaan. Klik simpan jika sudah selesai.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Judul Posisi</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="companyName" render={({ field }) => (
                            <FormItem><FormLabel>Nama Perusahaan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="location" render={({ field }) => (
                            <FormItem><FormLabel>Lokasi</FormLabel><FormControl><Input {...field} placeholder="e.g. Jakarta, Remote" /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="applyUrl" render={({ field }) => (
                            <FormItem><FormLabel>URL untuk Melamar</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="closingDate" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Tanggal Penutupan (Opsional)</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Deskripsi Pekerjaan</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="requirements" render={({ field }) => (
                            <FormItem><FormLabel>Persyaratan (satu per baris)</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
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
                    <TableHead>Posisi</TableHead>
                    <TableHead>Perusahaan</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Ditutup</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">Memuat data lowongan...</TableCell>
                    </TableRow>
                    )}
                    {vacancies && vacancies.length > 0 ? (
                    vacancies.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium max-w-xs truncate">{item.title}</TableCell>
                            <TableCell>{item.companyName}</TableCell>
                            <TableCell>{item.location}</TableCell>
                            <TableCell>{formatDate(item.closingDate) || 'N/A'}</TableCell>
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
                    !isLoading && <TableRow><TableCell colSpan={5} className="text-center">Belum ada data lowongan. Mulai tambahkan!</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}

    
