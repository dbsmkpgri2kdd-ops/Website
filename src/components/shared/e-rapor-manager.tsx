'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy, writeBatch, serverTimestamp, where, getDocs } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type ERapor, type Grade, type UserProfile } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, BookMarked, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '../ui/textarea';

const gradeSchema = z.object({
    subjectName: z.string().min(3, 'Nama mapel harus diisi.'),
    score: z.coerce.number().min(0, 'Nilai min 0').max(100, 'Nilai max 100'),
    description: z.string().min(10, 'Deskripsi minimal 10 karakter.'),
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
    return query(collection(firestore, 'users'), where('role', '==', 'siswa'), orderBy('displayName'));
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
    form.reset({ studentId: '', className: '', schoolYear: '', semester: undefined, grades: [{ subjectName: '', score: 0, description: '' }] });
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
        toast({ variant: 'destructive', title: 'Error', description: 'Data siswa tidak ditemukan.' });
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
            
            // For simplicity in this context, we delete old grades and add new ones.
            // A more robust solution might match by ID.
            const oldGradesSnapshot = await getDocs(collection(raporRef, 'grades'));
            oldGradesSnapshot.forEach(doc => batch.delete(doc.ref));

            values.grades.forEach(grade => {
                const newGradeRef = doc(collection(raporRef, 'grades'));
                batch.set(newGradeRef, grade);
            });
            
            await batch.commit();
            toast({ title: 'Berhasil!', description: 'Data e-rapor telah diperbarui.' });
        } else {
            const newRaporRef = doc(collection(firestore, `schools/${SCHOOL_DATA_ID}/eRapors`));
            batch.set(newRaporRef, { ...raporData, createdAt: serverTimestamp() });
            
            values.grades.forEach(grade => {
                const newGradeRef = doc(collection(newRaporRef, 'grades'));
                batch.set(newGradeRef, grade);
            });

            await batch.commit();
            toast({ title: 'Berhasil!', description: 'E-rapor baru telah ditambahkan.' });
        }
        setIsDialogOpen(false);
    } catch (error) {
        console.error("Error writing e-rapor: ", error);
        toast({ variant: 'destructive', title: 'Gagal!', description: 'Terjadi kesalahan saat menyimpan data.' });
    }
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus data rapor ini? Ini akan menghapus semua nilai di dalamnya.')) {
      // Note: This doesn't delete subcollections in client-side code.
      // A Cloud Function is required for robust cascading deletes.
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/eRapors`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Data e-rapor telah dihapus. (Nilai mungkin masih ada, perlu penghapusan manual via backend).' });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookMarked /> Manajemen E-Rapor</CardTitle>
            <CardDescription>Kelola data nilai dan laporan hasil belajar siswa.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Data Rapor
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{editingRapor ? 'Edit E-Rapor' : 'Tambah E-Rapor Baru'}</DialogTitle>
                    <DialogDescription>Isi detail rapor dan nilai siswa.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="studentId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pilih Siswa</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!editingRapor}>
                                        <FormControl><SelectTrigger><SelectValue placeholder={areStudentsLoading ? "Memuat..." : "Pilih siswa"} /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {students?.map(s => <SelectItem key={s.id} value={s.id}>{s.displayName || s.email}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="className" render={({ field }) => (<FormItem><FormLabel>Kelas</FormLabel><FormControl><Input {...field} placeholder="e.g. XII TKJ 1" /></FormControl><FormMessage /></FormItem>)}/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField control={form.control} name="schoolYear" render={({ field }) => (<FormItem><FormLabel>Tahun Ajaran</FormLabel><FormControl><Input {...field} placeholder="e.g. 2023/2024" /></FormControl><FormMessage /></FormItem>)}/>
                             <FormField control={form.control} name="semester" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Semester</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih semester" /></SelectTrigger></FormControl>
                                        <SelectContent><SelectItem value="Ganjil">Ganjil</SelectItem><SelectItem value="Genap">Genap</SelectItem></SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        <div className="space-y-4 pt-4 border-t">
                            <h4 className="text-lg font-semibold">Input Nilai</h4>
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end p-3 border rounded-lg">
                                    <FormField control={form.control} name={`grades.${index}.subjectName`} render={({ field }) => (<FormItem className="col-span-2"><FormLabel>Mata Pelajaran</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name={`grades.${index}.score`} render={({ field }) => (<FormItem><FormLabel>Nilai</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name={`grades.${index}.description`} render={({ field }) => (<FormItem className="col-span-3"><FormLabel>Deskripsi</FormLabel><FormControl><Textarea rows={1} {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 size={16}/></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ subjectName: '', score: 0, description: '' })}>
                                <PlusCircle className="mr-2" /> Tambah Mapel
                            </Button>
                        </div>
                        <DialogFooter className="sticky bottom-0 bg-background py-4">
                            <DialogClose asChild><Button type="button" variant="ghost">Batal</Button></DialogClose>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <LoaderCircle className="animate-spin mr-2"/>} Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
                </DialogContent>
            </Dialog>
            <div className="rounded-lg border">
                <Table>
                <TableHeader><TableRow><TableHead>Nama Siswa</TableHead><TableHead>Kelas</TableHead><TableHead>Semester</TableHead><TableHead>Tahun Ajaran</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                    {areRaporsLoading && ( <TableRow><TableCell colSpan={5} className="text-center">Memuat data rapor...</TableCell></TableRow>)}
                    {rapors && rapors.length > 0 ? (
                    rapors.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.studentName}</TableCell>
                            <TableCell>{item.className}</TableCell>
                            <TableCell>{item.semester}</TableCell>
                            <TableCell>{item.schoolYear}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : ( !areRaporsLoading && <TableRow><TableCell colSpan={5} className="text-center">Belum ada data rapor.</TableCell></TableRow> )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
