'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { PlusCircle, Trash2, Edit, LoaderCircle, UserCheck, Calendar as CalendarIcon, Filter, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

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
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, `schools/${SCHOOL_DATA_ID}/attendance`), orderBy('date', 'desc'));
  }, [firestore]);
  const { data: attendanceList, isLoading: areRecordsLoading } = useCollection<AttendanceRecord>(attendanceQuery);

  const studentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'siswa'), orderBy('email'));
  }, [firestore]);
  const { data: students, isLoading: areStudentsLoading } = useCollection<UserProfile>(studentsQuery);

  const classes = useMemo(() => {
    if (!students) return [];
    // Explicit type guard to ensure c is string
    const classSet = new Set(students.map(s => s.className).filter((c): c is string => !!c));
    return Array.from(classSet).sort();
  }, [students]);

  const filteredAttendance = useMemo(() => {
    if (!attendanceList) return [];
    return attendanceList.filter(record => {
      const matchesSearch = record.studentName.toLowerCase().includes(searchQuery.toLowerCase());
      const studentProfile = students?.find(s => s.id === record.studentId);
      const matchesClass = classFilter === 'ALL' || studentProfile?.className === classFilter;
      return matchesSearch && matchesClass;
    });
  }, [attendanceList, searchQuery, classFilter, students]);

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
    const studentNis = selectedStudent?.nis;
    const studentClass = selectedStudent?.className;
    const dataToSave = { ...values, studentName, studentNis, studentClass };

    if (editingItem) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/attendance`, editingItem.id);
      updateDocumentNonBlocking(docRef, dataToSave);
      toast({ title: 'Absensi diperbarui', description: 'Data kehadiran telah disimpan.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/attendance`);
      addDocumentNonBlocking(ref, dataToSave);
      toast({ title: 'Absensi dicatat', description: 'Data kehadiran baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Hapus catatan absensi ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/attendance`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Data dihapus' });
    }
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const jsDate = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return format(jsDate, "d MMM yyyy", { locale: idLocale });
  }

  return (
    <Card className="shadow-lg border-none rounded-[2rem] bg-card/50 backdrop-blur-md overflow-hidden">
        <CardHeader className="p-8 border-b border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
                <CardTitle className="text-xl font-bold uppercase flex items-center gap-3 font-headline">
                  <UserCheck size={24} className="text-primary" /> Manajemen absensi
                </CardTitle>
                <CardDescription className="text-[10px] mt-1 uppercase font-bold tracking-widest opacity-60">Monitor kehadiran siswa secara real-time.</CardDescription>
            </div>
            <Button onClick={handleAddNew} size="sm" className="rounded-xl font-bold h-12 px-6 shadow-xl glow-primary">
                <PlusCircle className="mr-2 h-4 w-4" /> Catat kehadiran
            </Button>
        </CardHeader>
        <CardContent className="p-0">
            <div className="p-6 bg-muted/20 border-b border-border flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Input 
                        placeholder="Cari nama siswa..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 rounded-xl bg-background border-border pl-10"
                    />
                    <Search className="absolute left-3.5 top-3.5 text-muted-foreground opacity-40" size={16} />
                </div>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0"><Filter size={16} /></div>
                    <Select onValueChange={setClassFilter} value={classFilter}>
                        <SelectTrigger className="h-11 w-40 rounded-xl bg-background border-border font-bold text-xs">
                            <SelectValue placeholder="Semua kelas" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="ALL" className="font-bold text-[10px] uppercase">SEMUA KELAS</SelectItem>
                            {classes.map(c => (
                                <SelectItem key={c} value={c} className="font-bold text-[10px] uppercase">{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                <TableHeader className="bg-muted/30">
                    <TableRow className="border-border">
                        <TableHead className="px-8 font-bold text-[10px] uppercase opacity-40">Identitas siswa</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase opacity-40">Waktu kehadiran</TableHead>
                        <TableHead className="font-bold text-[10px] uppercase opacity-40">Status</TableHead>
                        <TableHead className="text-right px-8 font-bold text-[10px] uppercase opacity-40">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {areRecordsLoading && ( <TableRow><TableCell colSpan={4} className="text-center py-20"><LoaderCircle className="animate-spin mx-auto text-primary" /></TableCell></TableRow>)}
                    {filteredAttendance.length > 0 ? (
                    filteredAttendance.map((item) => {
                        const studentProfile = students?.find(s => s.id === item.studentId);
                        return (
                            <TableRow key={item.id} className="border-border hover:bg-muted/20 group">
                                <TableCell className="px-8 py-5">
                                    <p className="font-bold text-sm tracking-tight uppercase">{item.studentName}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">{studentProfile?.className || 'Umum'}</p>
                                </TableCell>
                                <TableCell><span className="text-xs font-medium">{formatDate(item.date)}</span></TableCell>
                                <TableCell>
                                    <Badge className={cn(
                                        "border-none px-3 py-1 rounded-lg font-bold text-[9px] uppercase",
                                        item.status === 'Hadir' ? "bg-emerald-500/10 text-emerald-600" :
                                        item.status === 'Sakit' ? "bg-amber-500/10 text-amber-600" :
                                        item.status === 'Izin' ? "bg-blue-500/10 text-blue-600" :
                                        "bg-red-500/10 text-red-600"
                                    )}>
                                        {item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right px-8">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary" onClick={() => handleEdit(item)}><Edit size={16} /></Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-destructive opacity-40 hover:opacity-100" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })
                    ) : ( !areRecordsLoading && <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground opacity-40"><UserCheck size={40} className="mx-auto mb-3" /><p className="text-xs font-bold uppercase">Tidak ada data absensi ditemukan</p></TableCell></TableRow> )}
                </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
                <DialogHeader className="p-8 bg-primary/5 border-b border-border">
                    <DialogTitle className="text-xl font-bold uppercase font-headline">{editingItem ? 'Ubah' : 'Input'} kehadiran</DialogTitle>
                    <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Formulir Pencatatan Harian Siswa</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
                        <FormField control={form.control} name="studentId" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60">Nama siswa</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger className="h-12 rounded-xl bg-muted/50 border-border"><SelectValue placeholder={areStudentsLoading ? "Memuat siswa..." : "Klik untuk memilih"} /></SelectTrigger></FormControl>
                                    <SelectContent className="rounded-xl border-border bg-card/95 backdrop-blur-xl">
                                        {students?.map(s => <SelectItem key={s.id} value={s.id} className="py-3 font-bold text-[10px] uppercase">{s.displayName || s.email}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="date" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60">Tanggal</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" className={cn("h-12 rounded-xl bg-muted/50 border-border text-left font-normal px-4", !field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "PPP", { locale: idLocale }) : <span>Pilih tanggal</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-2xl border-border bg-card/95 backdrop-blur-xl" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="rounded-2xl" />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60">Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger className="h-12 rounded-xl bg-muted/50 border-border"><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent className="rounded-xl border-border bg-card/95 backdrop-blur-xl">
                                            <SelectItem value="Hadir" className="font-bold text-[10px] uppercase text-emerald-600">HADIR</SelectItem>
                                            <SelectItem value="Sakit" className="font-bold text-[10px] uppercase text-amber-600">SAKIT</SelectItem>
                                            <SelectItem value="Izin" className="font-bold text-[10px] uppercase text-blue-600">IZIN</SelectItem>
                                            <SelectItem value="Alpa" className="font-bold text-[10px] uppercase text-red-600">ALPA</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60">Catatan khusus (opsional)</FormLabel>
                                <FormControl><Textarea rows={3} {...field} placeholder="e.g. Terlambat 15 menit karena kendaraan rusak" className="rounded-2xl bg-muted/50 border-border font-bold uppercase text-[10px]" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <Button type="submit" className="w-full h-14 rounded-xl font-bold shadow-xl shadow-primary/20 uppercase text-xs tracking-widest" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-2"/> : null} Simpan kehadiran
                        </Button>
                    </form>
                </Form>
                </DialogContent>
            </Dialog>
        </CardContent>
    </Card>
  );
}
