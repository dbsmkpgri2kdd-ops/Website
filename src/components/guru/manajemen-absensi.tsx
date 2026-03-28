
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy, where } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type AttendanceRecord, type UserProfile } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, UserCheck, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  studentId: z.string({ required_error: 'Siswa harus dipilih.' }),
  date: z.date({ required_error: 'Tanggal harus diisi.' }),
  status: z.enum(["Hadir", "Sakit", "Izin", "Alpa"], { required_error: 'Status harus dipilih.'}),
  notes: z.string().optional(),
});

export function ManajemenAbsensi() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AttendanceRecord | null>(null);

  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, `schools/${SCHOOL_DATA_ID}/attendance`), orderBy('date', 'desc'));
  }, [firestore]);
  const { data: attendanceList, isLoading: areRecordsLoading } = useCollection<AttendanceRecord>(attendanceQuery);

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Mencari semua user dengan role siswa
    return query(collection(firestore, 'users'), where('role', '==', 'siswa'), orderBy('email'));
  }, [firestore]);
  const { data: students, isLoading: areStudentsLoading } = useCollection<UserProfile>(studentsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { notes: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingItem(null);
      form.reset({ studentId: '', notes: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingItem(null);
    form.reset({ studentId: '', date: new Date(), status: 'Hadir', notes: '' });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (item: AttendanceRecord) => {
    setEditingItem(item);
    form.reset({ 
      studentId: item.studentId,
      date: item.date.toDate ? item.date.toDate() : new Date(item.date), 
      status: item.status,
      notes: item.notes || '' 
    });
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !students) return;

    const selectedStudent = students.find(s => s.id === values.studentId);
    const studentName = selectedStudent?.displayName || selectedStudent?.email || 'Siswa';
    const dataToSave = { ...values, studentName };

    if (editingItem) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/attendance`, editingItem.id);
      updateDocumentNonBlocking(docRef, dataToSave);
      toast({ title: 'Berhasil!', description: 'Data absensi telah diperbarui.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/attendance`);
      addDocumentNonBlocking(ref, dataToSave);
      toast({ title: 'Berhasil!', description: 'Data absensi baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/attendance`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Data absensi telah dihapus.' });
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
            <CardTitle className="flex items-center gap-2"><UserCheck /> Manajemen Absensi Siswa</CardTitle>
            <CardDescription>Kelola data kehadiran siswa sehari-hari.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Catatan Absensi
            </Button>
            <div className="rounded-lg border overflow-hidden">
                <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead>Nama Siswa</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Catatan</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {areRecordsLoading && ( <TableRow><TableCell colSpan={5} className="text-center py-10">Memuat data...</TableCell></TableRow>)}
                    {attendanceList && attendanceList.length > 0 ? (
                    attendanceList.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.studentName}</TableCell>
                            <TableCell>{formatDate(item.date)}</TableCell>
                            <TableCell><Badge variant={item.status === 'Hadir' ? 'secondary' : 'default'}>{item.status}</Badge></TableCell>
                            <TableCell className="text-muted-foreground truncate max-w-xs">{item.notes || '-'}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : ( !areRecordsLoading && <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Belum ada data absensi.</TableCell></TableRow> )}
                </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit Absensi' : 'Tambah Absensi Baru'}</DialogTitle>
                    <DialogDescription>
                      Catat kehadiran siswa pada tanggal yang dipilih.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="studentId" render={({ field }) => (
                            <FormItem><FormLabel>Siswa</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger disabled={areStudentsLoading}><SelectValue placeholder="Pilih Siswa" /></SelectTrigger></FormControl><SelectContent>{students?.map(s => <SelectItem key={s.id} value={s.id}>{s.displayName || s.email}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="date" render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Tanggal</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="status" render={({ field }) => (
                            <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl><SelectContent>
                              <SelectItem value="Hadir">Hadir</SelectItem>
                              <SelectItem value="Sakit">Sakit</SelectItem>
                              <SelectItem value="Izin">Izin</SelectItem>
                              <SelectItem value="Alpa">Alpa</SelectItem>
                            </SelectContent></Select><FormMessage /></FormItem>
                         )}/>
                        <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem><FormLabel>Catatan (Opsional)</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <LoaderCircle className="animate-spin mr-2"/>}Simpan</Button>
                    </form>
                </Form>
                </DialogContent>
            </Dialog>
        </CardContent>
    </Card>
  );
}
