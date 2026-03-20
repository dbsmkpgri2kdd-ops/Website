'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type Event } from '@/lib/data';
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
import { PlusCircle, Trash2, Edit, LoaderCircle, Calendar as CalendarIconLucide, CalendarIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
  title: z.string().min(5, 'Judul acara minimal 5 karakter.'),
  description: z.string().optional(),
  date: z.date({ required_error: 'Tanggal harus diisi.' }),
  category: z.string({ required_error: 'Pilih kategori acara.' }),
});

const EVENT_CATEGORIES = ["Akademik", "Kegiatan Siswa", "Rapat", "Libur", "Umum"];

export function AgendaManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/events`);
    return query(ref, orderBy('date', 'desc'));
  }, [firestore]);

  const { data: events, isLoading } = useCollection<Event>(eventsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingEvent(null);
      form.reset({ title: '', description: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingEvent(null);
    form.reset({ title: '', description: '' });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    form.reset({
        ...event,
        date: event.date.toDate(),
    });
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    const dataToSave = { ...values };

    if (editingEvent) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/events`, editingEvent.id);
      updateDocumentNonBlocking(docRef, dataToSave);
      toast({ title: 'Berhasil!', description: 'Data acara telah diperbarui.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/events`);
      addDocumentNonBlocking(ref, dataToSave);
      toast({ title: 'Berhasil!', description: 'Acara baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus acara ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/events`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Data acara telah dihapus.' });
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
            <CardTitle className="flex items-center gap-2"><CalendarIconLucide /> Manajemen Agenda</CardTitle>
            <CardDescription>Kelola agenda dan jadwal kegiatan sekolah.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Acara Baru
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingEvent ? 'Edit Acara' : 'Tambah Acara Baru'}</DialogTitle>
                    <DialogDescription>Lengkapi informasi acara di bawah ini. Klik simpan jika sudah selesai.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Judul Acara</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kategori</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih kategori acara" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {EVENT_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                     )}/>
                    <FormField control={form.control} name="date" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Tanggal Acara</FormLabel>
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
                        <FormItem><FormLabel>Deskripsi (Opsional)</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
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
                    <TableHead>Judul Acara</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">Memuat data acara...</TableCell>
                    </TableRow>
                    )}
                    {events && events.length > 0 ? (
                    events.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium max-w-xs truncate">{item.title}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{formatDate(item.date)}</TableCell>
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
                    !isLoading && <TableRow><TableCell colSpan={4} className="text-center">Belum ada data acara. Mulai tambahkan!</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}

    
