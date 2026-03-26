'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type Prakerin } from '@/lib/data';
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
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, Briefcase, CalendarIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';

const formSchema = z.object({
  studentName: z.string().min(3, 'Nama siswa harus diisi.'),
  studentClass: z.string().min(3, 'Kelas siswa harus diisi.'),
  companyName: z.string().min(3, 'Nama perusahaan harus diisi.'),
  startDate: z.date({ required_error: 'Tanggal mulai harus diisi.' }),
  endDate: z.date().optional(),
  status: z.string({ required_error: 'Pilih status Prakerin.' })
});

const STATUS_OPTIONS: Prakerin['status'][] = ["Aktif", "Selesai", "Dibatalkan"];

const safeToDate = (date: any): Date | undefined => {
    if (!date) return undefined;
    if (typeof date.toDate === 'function') {
      return date.toDate();
    }
    if (date instanceof Date) {
      return date;
    }
    try {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
        }
    } catch (e) {
        return undefined;
    }
    return undefined;
  };

export function ManajemenPrakerin() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Prakerin | null>(null);

  const prakerinQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/prakerin`);
    return query(ref, orderBy('startDate', 'desc'));
  }, [firestore]);

  const { data: prakerinList, isLoading } = useCollection<Prakerin>(prakerinQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { studentName: '', studentClass: '', companyName: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingItem(null);
      form.reset({ studentName: '', studentClass: '', companyName: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingItem(null);
    form.reset();
    setIsDialogOpen(true);
  };
  
  const handleEdit = (item: Prakerin) => {
    setEditingItem(item);
    form.reset({
        ...item,
        startDate: safeToDate(item.startDate),
        endDate: safeToDate(item.endDate),
    });
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    const dataToSave = { ...values };

    if (editingItem) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/prakerin`, editingItem.id);
      updateDocumentNonBlocking(docRef, dataToSave);
      toast({ title: 'Berhasil!', description: 'Data Prakerin telah diperbarui.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/prakerin`);
      addDocumentNonBlocking(ref, dataToSave);
      toast({ title: 'Berhasil!', description: 'Data Prakerin baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/prakerin`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Data Prakerin telah dihapus.' });
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
            <CardTitle className="flex items-center gap-2"><Briefcase /> Manajemen Prakerin/PKL</CardTitle>
            <CardDescription>Kelola data siswa yang sedang atau telah melaksanakan Praktek Kerja Lapangan.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Data Prakerin
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit Data Prakerin' : 'Tambah Data Prakerin Baru'}</DialogTitle>
                    <DialogDescription>Isi detail data Prakerin siswa. Klik simpan jika sudah selesai.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="studentName" render={({ field }) => (
                            <FormItem><FormLabel>Nama Siswa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="studentClass" render={({ field }) => (
                            <FormItem><FormLabel>Kelas</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="companyName" render={({ field }) => (
                            <FormItem><FormLabel>Nama Perusahaan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="startDate" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Tanggal Mulai</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="endDate" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Tanggal Selesai (Opsional)</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                            )}/>
                        </div>
                         <FormField control={form.control} name="status" render={({ field }) => (
                            <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl><SelectContent>{STATUS_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                         )}/>
                        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <LoaderCircle className="animate-spin mr-2"/>}Simpan</Button>
                    </form>
                </Form>
                </DialogContent>
            </Dialog>
            <div className="rounded-lg border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>Perusahaan</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && ( <TableRow><TableCell colSpan={5} className="text-center">Memuat data...</TableCell></TableRow>)}
                    {prakerinList && prakerinList.length > 0 ? (
                    prakerinList.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.studentName}<br/><span className="text-xs text-muted-foreground">{item.studentClass}</span></TableCell>
                            <TableCell>{item.companyName}</TableCell>
                            <TableCell>{formatDate(item.startDate)} - {formatDate(item.endDate)}</TableCell>
                            <TableCell><Badge variant={item.status === 'Aktif' ? 'default' : item.status === 'Selesai' ? 'secondary' : 'destructive'}>{item.status}</Badge></TableCell>
                            <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : ( !isLoading && <TableRow><TableCell colSpan={5} className="text-center">Belum ada data Prakerin.</TableCell></TableRow> )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}

    
