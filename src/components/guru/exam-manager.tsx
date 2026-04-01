
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type Exam } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, ShieldCheck, Key, CalendarIcon, Camera, Clock, MonitorCheck, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ProctoringCenter } from './proctoring-center';

const formSchema = z.object({
  title: z.string().min(5, 'Judul ujian minimal 5 karakter.'),
  subject: z.string().min(3, 'Nama mata pelajaran harus diisi.'),
  class: z.string().min(2, 'Nama kelas harus diisi.'),
  date: z.date({ required_error: 'Tanggal pelaksanaan harus diisi.' }),
  startTime: z.string().min(5, 'Jam mulai (e.g. 07:30).'),
  endTime: z.string().min(5, 'Jam selesai (e.g. 09:30).'),
  durationMinutes: z.coerce.number().min(5, 'Durasi minimal 5 menit.').max(300, 'Maksimal 300 menit.'),
  token: z.string().min(4, 'Token minimal 4 karakter.'),
  url: z.string().url('URL soal ujian tidak valid (Google Form/Lainnya).'),
  isActive: z.boolean().default(true),
  isCameraRequired: z.boolean().default(false),
});

export function ExamManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [monitoringExamId, setMonitoringExamId] = useState<string | null>(null);

  const examsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/exams`);
    return query(ref, orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: exams, isLoading } = useCollection<Exam>(examsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
        title: '', subject: '', class: '', startTime: '', endTime: '', durationMinutes: 60, token: '', url: '', isActive: true, isCameraRequired: false 
    },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingExam(null);
      form.reset();
    }
  }, [isDialogOpen, form]);

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    form.reset({
        ...exam,
        date: exam.date?.toDate ? exam.date.toDate() : new Date(exam.date),
    });
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    if (editingExam) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/exams`, editingExam.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Ujian diperbarui', description: 'Data jadwal ujian telah disimpan.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/exams`);
      addDocumentNonBlocking(ref, { ...values, createdAt: serverTimestamp() });
      toast({ title: 'Ujian ditambahkan', description: 'Jadwal ujian baru telah aktif.' });
    }
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Hapus jadwal ujian ini secara permanen?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/exams`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Ujian dihapus' });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const jsDate = date.toDate ? date.toDate() : new Date(date);
    return format(jsDate, "EEEE, d MMM yyyy", { locale: idLocale });
  };

  if (monitoringExamId) {
    const exam = exams?.find(e => e.id === monitoringExamId);
    return (
        <ProctoringCenter 
            examId={monitoringExamId} 
            examTitle={exam?.title || 'Ujian'} 
            onBack={() => setMonitoringExamId(null)} 
        />
    );
  }

  return (
    <Card className="shadow-2xl border-none rounded-[2.5rem] bg-white overflow-hidden border font-sans">
        <CardHeader className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-xl font-extrabold uppercase flex items-center gap-3 font-headline text-slate-900">
                <ShieldCheck size={24} className="text-primary"/> Manajemen Ujian Online
              </CardTitle>
              <CardDescription className="text-[10px] mt-1 uppercase font-bold tracking-widest text-slate-400">Atur jadwal, soal, dan keamanan sesi ExamBro.</CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} size="lg" className="rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl glow-primary h-14 px-8">
                <PlusCircle className="mr-2 h-5 w-5" /> Buat Jadwal Baru
            </Button>
        </CardHeader>
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-100">
                        <TableHead className="px-8 font-bold uppercase tracking-widest text-[10px] text-slate-500">Mata Pelajaran</TableHead>
                        <TableHead className="font-bold uppercase tracking-widest text-[10px] text-slate-500">Waktu & Durasi</TableHead>
                        <TableHead className="font-bold uppercase tracking-widest text-[10px] text-slate-500">Akses & Keamanan</TableHead>
                        <TableHead className="text-right px-8 font-bold uppercase tracking-widest text-[10px] text-slate-500">Kontrol</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && <TableRow><TableCell colSpan={4} className="text-center py-20"><LoaderCircle className="animate-spin mx-auto text-primary" /></TableCell></TableRow>}
                    {exams?.map((exam) => (
                        <TableRow key={exam.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <TableCell className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black uppercase shadow-inner border border-primary/5">{exam.subject.charAt(0)}</div>
                                    <div>
                                        <p className="font-extrabold uppercase text-sm tracking-tight font-headline text-slate-900">{exam.subject}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{exam.title}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <p className="font-bold text-xs text-slate-700">{formatDate(exam.date)}</p>
                                <div className='flex gap-2 mt-1.5'>
                                    <Badge variant="outline" className="text-[9px] font-bold px-2 border-slate-200 uppercase tracking-widest h-5">{exam.class}</Badge>
                                    <Badge className="text-[9px] font-bold px-2 bg-primary/5 text-primary border-none h-5">{exam.durationMinutes} Menit</Badge>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary"><Key size={12}/> {exam.token}</div>
                                    <div className='flex gap-2'>
                                        <Badge variant={exam.isActive ? 'default' : 'secondary'} className="w-fit text-[8px] font-bold uppercase px-2 h-4">{exam.isActive ? 'Aktif' : 'Nonaktif'}</Badge>
                                        {exam.isCameraRequired && <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-none text-[8px] font-bold uppercase px-2 h-4"><Camera size={10} className='mr-1' /> On-Cam</Badge>}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right px-8">
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" className="h-10 rounded-xl font-bold uppercase text-[9px] tracking-widest border-primary/20 text-primary hover:bg-primary/5" onClick={() => setMonitoringExamId(exam.id)}>
                                        <MonitorCheck size={16} className="mr-2" /> Live Proctoring
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 text-slate-400 hover:text-primary transition-all" onClick={() => handleEdit(exam)}><Edit size={18}/></Button>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all" onClick={() => handleDelete(exam.id)}><Trash2 size={18}/></Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {!isLoading && exams?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-20 opacity-30"><ShieldCheck size={64} className="mx-auto mb-4 text-slate-200" /><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Belum ada jadwal ujian tersedia</p></TableCell></TableRow>}
                </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[650px] rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl bg-white">
                <DialogHeader className="p-8 bg-slate-50 border-b border-slate-100">
                    <div className='flex items-center gap-4'>
                        <div className='p-3 bg-primary text-white rounded-2xl shadow-xl'><ShieldCheck size={24}/></div>
                        <div>
                            <DialogTitle className="font-extrabold uppercase tracking-tight text-2xl font-headline text-slate-900">Konfigurasi Ujian v5.5</DialogTitle>
                            <DialogDescription className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">Input jadwal dan parameter keamanan sesi.</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
                        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Judul Ujian</FormLabel><FormControl><Input {...field} placeholder="e.g. Penilaian Akhir Semester" className="h-14 rounded-2xl bg-slate-50 border-slate-100 focus:border-primary text-sm font-bold" /></FormControl><FormMessage /></FormItem>)}/>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <FormField control={form.control} name="subject" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Mata Pelajaran</FormLabel><FormControl><Input {...field} placeholder="Matematika" className="h-12 rounded-xl bg-slate-50 border-slate-100" /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={form.control} name="class" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Kelas Target</FormLabel><FormControl><Input {...field} placeholder="XII TKJ 1" className="h-12 rounded-xl bg-slate-50 border-slate-100" /></FormControl><FormMessage /></FormItem>)}/>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="date" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tanggal Pelaksanaan</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" className={cn("h-12 rounded-xl bg-slate-50 border-slate-100 text-left font-bold text-xs px-4", !field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "PPP", { locale: idLocale }) : <span>Pilih Tanggal</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-30" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-2xl border-slate-100 bg-white" align="start">
                                            <CalendarPicker mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="rounded-2xl" />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="startTime" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Jam Mulai</FormLabel><FormControl><Input {...field} placeholder="07:30" className="h-12 rounded-xl bg-slate-50 border-slate-100 font-mono text-center" /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={form.control} name="durationMinutes" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Durasi (Menit)</FormLabel>
                                        <FormControl><Input type="number" {...field} className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold text-center text-primary" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary/5 p-6 rounded-3xl border border-primary/10">
                            <FormField control={form.control} name="token" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Token Keamanan</FormLabel><FormControl><Input {...field} placeholder="ABCD" className="h-14 rounded-2xl bg-white border-primary/20 font-black uppercase tracking-[0.4em] text-center text-primary text-xl" /></FormControl><FormMessage /></FormItem>)}/>
                            <div className="space-y-4 py-2">
                                <FormField control={form.control} name="isActive" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-xl">
                                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Sesi Aktif</FormLabel>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="isCameraRequired" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-xl">
                                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2"><Camera size={12} className='text-amber-500'/> Wajib Kamera</FormLabel>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}/>
                            </div>
                        </div>

                        <FormField control={form.control} name="url" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tautan Soal (URL Direct)</FormLabel>
                                <FormControl>
                                    <div className='relative'>
                                        <Input {...field} placeholder="https://docs.google.com/forms/..." className="h-14 rounded-2xl bg-slate-50 border-slate-100 pl-12 font-bold text-xs text-primary" />
                                        <ExternalLink className='absolute left-4 top-4.5 text-primary opacity-30' size={20} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>

                        <Button type="submit" className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl glow-primary mt-4" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-3"/> : <ShieldCheck className="mr-3"/>}
                            Simpan & Publikasikan Ujian
                        </Button>
                    </form>
                </Form>
                </DialogContent>
            </Dialog>
        </CardContent>
    </Card>
  );
}
