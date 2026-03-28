
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy, writeBatch, serverTimestamp, where, getDocs } from 'firebase/firestore';
import { useCollection, useFirestore, deleteDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type ERapor, type Grade, type UserProfile } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, BookMarked, User as UserIcon, GraduationCap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

const gradeSchema = z.object({
    subjectName: z.string().min(2, 'Nama mapel minimal 2 karakter.'),
    score: z.coerce.number().min(0, 'Nilai min 0').max(100, 'Nilai max 100'),
    description: z.string().min(5, 'Deskripsi minimal 5 karakter.'),
});

const formSchema = z.object({
  studentId: z.string({ required_error: 'Siswa harus dipilih.' }),
  className: z.string().min(3, 'Kelas harus diisi.'),
  schoolYear: z.string().min(9, 'Tahun ajaran tidak valid (e.g. 2023/2024).'),
  semester: z.enum(['Ganjil', 'Genap']),
  grades: z.array(gradeSchema).min(1, 'Minimal ada satu mata pelajaran.'),
});

export function ERaporManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRapor, setEditingRapor] = useState<ERapor | null>(null);

  const raporsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, `schools/${SCHOOL_DATA_ID}/eRapors`), orderBy('createdAt', 'desc'));
  }, [firestore]);
  const { data: rapors, isLoading: areRaporsLoading } = useCollection<ERapor>(raporsQuery);
  
  const studentsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'siswa'), orderBy('email'));
  }, [firestore]);
  const { data: students, isLoading: areStudentsLoading } = useCollection<UserProfile>(studentsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "grades"
  });

  useEffect(() => {
    if (!isDialogOpen) {
      form.reset({ studentId: '', className: '', schoolYear: '', semester: undefined, grades: [] });
      setEditingRapor(null);
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingRapor(null);
    form.reset({ 
      studentId: '', 
      className: '', 
      schoolYear: '2024/2025', 
      semester: 'Ganjil', 
      grades: [{ subjectName: '', score: 0, description: '' }] 
    });
    setIsDialogOpen(true);
  };
  
  const handleEdit = async (rapor: ERapor) => {
    setEditingRapor(rapor);
    if (!firestore) return;
    const gradesRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/eRapors/${rapor.id}/grades`);
    const gradesSnapshot = await getDocs(gradesRef);
    const existingGrades = gradesSnapshot.docs.map(doc => doc.data() as Grade);
    
    form.reset({
        studentId: rapor.studentId,
        className: rapor.className,
        schoolYear: rapor.schoolYear,
        semester: rapor.semester as "Ganjil" | "Genap",
        grades: existingGrades.length > 0 ? existingGrades : [{ subjectName: '', score: 0, description: '' }],
    });
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;

    const selectedStudent = students?.find(s => s.id === values.studentId);
    if (!selectedStudent) {
        toast({ variant: 'destructive', title: 'Data Siswa Gagal Dimuat' });
        return;
    }

    const raporData = {
      studentId: values.studentId,
      studentName: selectedStudent.displayName || selectedStudent.email,
      className: values.className,
      schoolYear: values.schoolYear,
      semester: values.semester,
    };

    try {
        const batch = writeBatch(firestore);
        if (editingRapor) {
            const raporRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/eRapors`, editingRapor.id);
            batch.update(raporRef, raporData);
            
            const oldGradesSnapshot = await getDocs(collection(raporRef, 'grades'));
            oldGradesSnapshot.forEach(doc => batch.delete(doc.ref));

            values.grades.forEach(grade => {
                const newGradeRef = doc(collection(raporRef, 'grades'));
                batch.set(newGradeRef, grade);
            });
            
            await batch.commit();
            toast({ title: 'E-Rapor Diperbarui', description: 'Data nilai telah tersimpan.' });
        } else {
            const newRaporRef = doc(collection(firestore, `schools/${SCHOOL_DATA_ID}/eRapors`));
            batch.set(newRaporRef, { ...raporData, createdAt: serverTimestamp() });
            
            values.grades.forEach(grade => {
                const newGradeRef = doc(collection(newRaporRef, 'grades'));
                batch.set(newGradeRef, grade);
            });

            await batch.commit();
            toast({ title: 'E-Rapor Berhasil Dibuat', description: 'Data nilai baru telah ditambahkan.' });
        }
        setIsDialogOpen(false);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Kesalahan Sistem', description: 'Gagal menulis data ke database.' });
    }
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus data rapor ini? Semua nilai di dalamnya akan terhapus.')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/eRapors`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Data Rapor Dihapus' });
    }
  }

  return (
    <Card className="shadow-lg border-none rounded-[2rem] bg-white/5 backdrop-blur-md overflow-hidden">
        <CardHeader className="p-8 border-b border-white/5">
            <div className='flex items-center justify-between gap-4'>
              <div>
                <CardTitle className="text-xl font-black italic uppercase flex items-center gap-3">
                  <BookMarked size={24} className="text-primary"/> Manajemen E-Rapor
                </CardTitle>
                <CardDescription className="text-[10px] mt-1 uppercase font-bold tracking-widest opacity-60">Laporan hasil belajar digital terpadu.</CardDescription>
              </div>
              <Button onClick={handleAddNew} size="sm" className="rounded-xl font-black uppercase tracking-widest text-[9px] shadow-3xl glow-primary">
                  <PlusCircle className="mr-2 h-4 w-4" /> Tambah Rapor Baru
              </Button>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-5xl rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl">
                <DialogHeader className="p-8 bg-primary/5 border-b border-white/5">
                    <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Editor E-Rapor v4.0</DialogTitle>
                    <DialogDescription className="text-[10px] uppercase font-bold tracking-[0.3em] text-primary">Formulir Input Nilai Akademik</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white/[0.03] p-6 rounded-[2rem] border border-white/5">
                            <FormField control={form.control} name="studentId" render={({ field }) => (
                                <FormItem className="lg:col-span-2">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Pilih Siswa</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingRapor}>
                                        <FormControl><SelectTrigger className="h-12 rounded-xl bg-white/5 border-white/10"><SelectValue placeholder={areStudentsLoading ? "Memuat..." : "Klik untuk memilih"} /></SelectTrigger></FormControl>
                                        <SelectContent className="bg-card/95 backdrop-blur-3xl rounded-xl border-white/10">
                                            {students?.map(s => <SelectItem key={s.id} value={s.id} className="font-bold uppercase text-[10px] tracking-widest py-3">{s.displayName || s.email}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="className" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Kelas</FormLabel><FormControl><Input {...field} placeholder="e.g. XII TKJ 1" className="h-12 rounded-xl bg-white/5 border-white/10" /></FormControl><FormMessage /></FormItem>)}/>
                             <FormField control={form.control} name="schoolYear" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Tahun Ajaran</FormLabel><FormControl><Input {...field} placeholder="2024/2025" className="h-12 rounded-xl bg-white/5 border-white/10" /></FormControl><FormMessage /></FormItem>)}/>
                        </div>

                        <div className="space-y-6 pt-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-black uppercase tracking-[0.2em] italic">Daftar Capaian Nilai</h4>
                              <FormField control={form.control} name="semester" render={({ field }) => (
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Semester:</span>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger className="h-9 w-32 rounded-lg bg-white/5 border-white/10 text-[10px] font-black uppercase"><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent className="bg-card/95 backdrop-blur-3xl rounded-xl border-white/10"><SelectItem value="Ganjil">GANJIL</SelectItem><SelectItem value="Genap">GENAP</SelectItem></SelectContent>
                                    </Select>
                                </div>
                              )}/>
                            </div>
                            
                            <div className="space-y-4">
                              {fields.map((field, index) => (
                                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-primary/20 transition-all">
                                      <FormField control={form.control} name={`grades.${index}.subjectName`} render={({ field }) => (<FormItem className="md:col-span-3"><FormLabel className="text-[9px] font-black uppercase opacity-40">Mata Pelajaran</FormLabel><FormControl><Input {...field} className="h-10 rounded-lg bg-transparent border-white/10" /></FormControl><FormMessage /></FormItem>)}/>
                                      <FormField control={form.control} name={`grades.${index}.score`} render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel className="text-[9px] font-black uppercase opacity-40">Nilai (0-100)</FormLabel><FormControl><Input type="number" {...field} className="h-10 rounded-lg bg-transparent border-white/10 text-center font-black" /></FormControl><FormMessage /></FormItem>)}/>
                                      <FormField control={form.control} name={`grades.${index}.description`} render={({ field }) => (<FormItem className="md:col-span-6"><FormLabel className="text-[9px] font-black uppercase opacity-40">Deskripsi Kompetensi</FormLabel><FormControl><Textarea rows={1} {...field} className="min-h-[40px] rounded-lg bg-transparent border-white/10 text-xs italic" /></FormControl><FormMessage /></FormItem>)}/>
                                      <div className="md:col-span-1 pt-6 flex justify-end">
                                        <Button type="button" variant="ghost" size="icon" className="text-destructive opacity-40 hover:opacity-100 hover:bg-destructive/10 h-10 w-10 rounded-xl" onClick={() => remove(index)}><Trash2 size={16}/></Button>
                                      </div>
                                  </div>
                              ))}
                            </div>
                            
                            <Button type="button" variant="outline" size="sm" className="w-full h-12 rounded-xl border-dashed border-2 border-white/10 font-black uppercase tracking-[0.2em] text-[9px] hover:bg-primary/5 hover:text-primary transition-all" onClick={() => append({ subjectName: '', score: 0, description: '' })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Mata Pelajaran
                            </Button>
                        </div>
                        
                        <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
                            <DialogClose asChild><Button type="button" variant="ghost" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8">Batal</Button></DialogClose>
                            <Button type="submit" className="rounded-xl font-black uppercase text-[10px] tracking-widest shadow-3xl glow-primary px-12 h-14" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-3 h-5 w-5"/> : <BookMarked className="mr-3 h-5 w-5" />} Simpan E-Rapor
                            </Button>
                        </div>
                    </form>
                </Form>
                </DialogContent>
            </Dialog>

            <div className="overflow-x-auto">
                <Table>
                <TableHeader className="bg-white/[0.02]">
                  <TableRow className="border-white/5">
                    <TableHead className="px-8 font-black uppercase tracking-widest text-[9px] opacity-40">Nama Siswa</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[9px] opacity-40">Kelas & Semester</TableHead>
                    <TableHead className="font-black uppercase tracking-widest text-[9px] opacity-40">Tahun Ajaran</TableHead>
                    <TableHead className="text-right px-8 font-black uppercase tracking-widest text-[9px] opacity-40">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {areRaporsLoading && ( <TableRow><TableCell colSpan={4} className="text-center py-20"><LoaderCircle className="animate-spin mx-auto text-primary" /></TableCell></TableRow>)}
                    {rapors && rapors.length > 0 ? (
                    rapors.map((item) => (
                        <TableRow key={item.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <TableCell className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><UserIcon size={16}/></div>
                                <p className="font-black uppercase italic text-sm tracking-tight">{item.studentName}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="font-bold text-xs">{item.className}</p>
                              <Badge variant="outline" className="text-[8px] font-black px-2 py-0 mt-1 border-white/10 uppercase tracking-widest">{item.semester}</Badge>
                            </TableCell>
                            <TableCell><span className="font-mono text-xs opacity-60">{item.schoolYear}</span></TableCell>
                            <TableCell className="text-right px-8">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : ( !areRaporsLoading && <TableRow><TableCell colSpan={4} className="text-center py-20 opacity-20"><GraduationCap size={48} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-widest">Belum ada data rapor tercatat</p></TableCell></TableRow> )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
