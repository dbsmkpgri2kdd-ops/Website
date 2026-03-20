'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type Schedule } from '@/lib/data';
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
import { PlusCircle, Trash2, Edit, LoaderCircle, CalendarClock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  className: z.string().min(1, 'Nama kelas harus diisi.'),
  dayOfWeek: z.string({ required_error: 'Hari harus dipilih.' }),
  timeSlot: z.string().min(5, 'Jam pelajaran harus diisi (e.g., 07:00-07:45).'),
  subjectName: z.string().min(3, 'Nama mata pelajaran harus diisi.'),
  teacherName: z.string().min(3, 'Nama guru harus diisi.'),
});

const DAYS_OF_WEEK = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function ScheduleManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const schedulesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/schedules`);
    return query(ref, orderBy('className'));
  }, [firestore]);

  const { data: schedules, isLoading } = useCollection<Schedule>(schedulesQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { className: '', timeSlot: '', subjectName: '', teacherName: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingSchedule(null);
      form.reset({ className: '', timeSlot: '', subjectName: '', teacherName: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingSchedule(null);
    form.reset({ className: '', timeSlot: '', subjectName: '', teacherName: '' });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    form.reset(schedule);
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;
    
    if (editingSchedule) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/schedules`, editingSchedule.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Berhasil!', description: 'Data jadwal telah diperbarui.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/schedules`);
      addDocumentNonBlocking(ref, values);
      toast({ title: 'Berhasil!', description: 'Jadwal baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  };
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/schedules`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Data jadwal telah dihapus.' });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarClock /> Manajemen Jadwal Pelajaran</CardTitle>
            <CardDescription>Kelola jadwal pelajaran untuk semua kelas.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Jadwal Baru
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</DialogTitle>
                    <DialogDescription>Lengkapi detail jadwal pelajaran. Klik simpan jika sudah selesai.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="className" render={({ field }) => (
                        <FormItem><FormLabel>Nama Kelas</FormLabel><FormControl><Input {...field} placeholder="Contoh: X TKJ 1" /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="dayOfWeek" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Hari</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih hari" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {DAYS_OF_WEEK.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField control={form.control} name="timeSlot" render={({ field }) => (
                        <FormItem><FormLabel>Jam Pelajaran</FormLabel><FormControl><Input {...field} placeholder="07:00 - 07:45" /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="subjectName" render={({ field }) => (
                        <FormItem><FormLabel>Mata Pelajaran</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="teacherName" render={({ field }) => (
                        <FormItem><FormLabel>Nama Guru</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
                    <TableHead>Kelas</TableHead>
                    <TableHead>Hari</TableHead>
                    <TableHead>Jam</TableHead>
                    <TableHead>Pelajaran</TableHead>
                    <TableHead>Guru</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center">Memuat data jadwal...</TableCell>
                    </TableRow>
                    )}
                    {schedules && schedules.length > 0 ? (
                    schedules.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.className}</TableCell>
                            <TableCell>{item.dayOfWeek}</TableCell>
                            <TableCell>{item.timeSlot}</TableCell>
                            <TableCell>{item.subjectName}</TableCell>
                            <TableCell>{item.teacherName}</TableCell>
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
                    !isLoading && <TableRow><TableCell colSpan={6} className="text-center">Belum ada data jadwal. Mulai tambahkan!</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}

    
