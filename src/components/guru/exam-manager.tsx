
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
import { PlusCircle, Trash2, Edit, LoaderCircle, ShieldCheck, Key, Link as LinkIcon, Calendar, Camera, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  title: z.string().min(5, 'Judul ujian minimal 5 karakter.'),
  subject: z.string().min(3, 'Nama mata pelajaran harus diisi.'),
  class: z.string().min(2, 'Nama kelas harus diisi.'),
  day: z.string().min(3, 'Hari pelaksanaan harus diisi.'),
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

  const examsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/exams`);
    return query(ref, orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: exams, isLoading } = useCollection<Exam>(examsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
        title: '', subject: '', class: '', day: '', startTime: '', endTime: '', durationMinutes: 60, token: '', url: '', isActive: true, isCameraRequired: false 
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
    form.reset(exam);
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    if (editingExam) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/exams`, editingExam.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Ujian Diperbarui', description: 'Data jadwal ujian telah disimpan.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/exams`);
      addDocumentNonBlocking(ref, { ...values, createdAt: serverTimestamp() });
      toast({ title: 'Ujian Ditambahkan', description: 'Jadwal ujian baru telah aktif.' });
    }
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Hapus jadwal ujian ini secara permanen?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/exams`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Ujian Dihapus' });
    }
  };

  return (
    <Card className="shadow-lg border-none rounded-[2rem] bg-white/5 backdrop-blur-md overflow-hidden border">
        <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black italic uppercase flex items-center gap-3">
                <ShieldCheck size={24} className="text-primary"/> Manajemen Ujian (ExamBro)
              </CardTitle>
              <CardDescription className="text-[10px] mt-1 uppercase font-bold tracking-widest opacity-60">Atur jadwal, soal, dan keamanan ujian online.</CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} size="sm" className="rounded-xl font-black uppercase tracking-widest text-[9px] shadow-3xl glow-primary">
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Ujian Baru
            </Button>
        </CardHeader>
        <CardContent className="p-0">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
                <DialogHeader className="p-8 bg-primary/5 border-b border-white/5">
                    <DialogTitle className="font-black uppercase italic tracking-tighter text-2xl">Editor Ujian v3.0</DialogTitle>
                    <DialogDescription className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Konfigurasi Jadwal & Alokasi Waktu</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
                        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase opacity-60">Judul Ujian</FormLabel><FormControl><Input {...field} placeholder="e.g. Ujian Akhir Semester" className="h-12 rounded-xl" /></FormControl><FormMessage /></FormItem>)}/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="subject" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase opacity-60">Mata Pelajaran</FormLabel><FormControl><Input {...field} placeholder="Matematika" className="h-12 rounded-xl" /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={form.control} name="class" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase opacity-60">Kelas</FormLabel><FormControl><Input {...field} placeholder="XII TKJ 1" className="h-12 rounded-xl" /></FormControl><FormMessage /></FormItem>)}/>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <FormField control={form.control} name="day" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase opacity-60">Hari</FormLabel><FormControl><Input {...field} placeholder="Senin" className="h-12 rounded-xl" /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={form.control} name="startTime" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase opacity-60">Mulai</FormLabel><FormControl><Input {...field} placeholder="07:30" className="h-12 rounded-xl" /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={form.control} name="durationMinutes" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[9px] font-black uppercase opacity-60 flex items-center gap-1"><Clock size={10}/> Durasi (Menit)</FormLabel>
                                    <FormControl><Input type="number" {...field} className="h-12 rounded-xl font-black text-primary" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-primary/5 p-6 rounded-2xl border border-primary/10">
                            <FormField control={form.control} name="token" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase opacity-60">Token Keamanan</FormLabel><FormControl><Input {...field} placeholder="ABCD" className="h-12 rounded-xl font-black uppercase" /></FormControl><FormMessage /></FormItem>)}/>
                            <div className="space-y-4">
                                <FormField control={form.control} name="isActive" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-xl p-1">
                                        <FormLabel className="text-[9px] font-black uppercase opacity-60">Ujian Aktif</FormLabel>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="isCameraRequired" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-xl p-1">
                                        <FormLabel className="text-[9px] font-black uppercase opacity-60 flex items-center gap-2"><Camera size={12}/> Wajib Kamera</FormLabel>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}/>
                            </div>
                        </div>
                        <FormField control={form.control} name="url" render={({ field }) => (<FormItem><FormLabel className="text-[9px] font-black uppercase opacity-60">URL Soal (Google Forms/Lainnya)</FormLabel><FormControl><Input {...field} placeholder="https://..." className="h-12 rounded-xl" /></FormControl><FormMessage /></FormItem>)}/>
                        <Button type="submit" className="w-full h-14 rounded-xl font-black uppercase tracking-[0.2em] shadow-3xl glow-primary" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-3"/> : <ShieldCheck className="mr-3"/>}
                            SIMPAN JADWAL UJIAN
                        </Button>
                    </form>
                </Form>
                </DialogContent>
            </Dialog>

            <div className="overflow-x-auto">
                <Table>
                <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/5">
                        <TableHead className="px-8 font-black uppercase tracking-widest text-[9px] opacity-40">Mata Pelajaran</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[9px] opacity-40">Waktu & Durasi</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[9px] opacity-40">Keamanan</TableHead>
                        <TableHead className="text-right px-8 font-black uppercase tracking-widest text-[9px] opacity-40">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && <TableRow><TableCell colSpan={4} className="text-center py-20"><LoaderCircle className="animate-spin mx-auto text-primary" /></TableCell></TableRow>}
                    {exams?.map((exam) => (
                        <TableRow key={exam.id} className="border-white/5 hover:bg-white/[0.02]">
                            <TableCell className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase">{exam.subject.charAt(0)}</div>
                                    <div>
                                        <p className="font-black uppercase italic text-sm tracking-tight">{exam.subject}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">{exam.title}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <p className="font-bold text-xs uppercase tracking-tight">{exam.day}, {exam.startTime}</p>
                                <div className='flex gap-2 mt-1'>
                                    <Badge variant="outline" className="text-[8px] font-black px-2 border-white/10 uppercase tracking-widest">{exam.class}</Badge>
                                    <Badge variant="secondary" className="text-[8px] font-black px-2 bg-primary/10 text-primary border-none">{exam.durationMinutes} Menit</Badge>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary"><Key size={10}/> {exam.token}</div>
                                    <div className='flex gap-2'>
                                        <Badge variant={exam.isActive ? 'default' : 'secondary'} className="w-fit text-[8px] font-black uppercase">{exam.isActive ? 'AKTIF' : 'NONAKTIF'}</Badge>
                                        {exam.isCameraRequired && <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-none text-[8px] font-black uppercase"><Camera size={10} className='mr-1' /> PROCTORED</Badge>}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-right px-8">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary" onClick={() => handleEdit(exam)}><Edit size={16}/></Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(exam.id)}><Trash2 size={16}/></Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {!isLoading && exams?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-20 opacity-20"><ShieldCheck size={48} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-widest">Belum ada jadwal ujian online</p></TableCell></TableRow>}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
