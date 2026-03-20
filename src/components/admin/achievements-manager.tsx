'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type Achievement } from '@/lib/data';
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, Award, CalendarIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, convertGoogleDriveLink } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';

const formSchema = z.object({
  title: z.string().min(5, 'Judul prestasi minimal 5 karakter.'),
  studentName: z.string().min(3, 'Nama siswa harus diisi.'),
  competitionName: z.string().min(5, 'Nama kompetisi minimal 5 karakter.'),
  level: z.string({ required_error: 'Pilih tingkat kejuaraan.' }),
  dateAchieved: z.date({ required_error: 'Tanggal harus diisi.' }),
  imageUrl: z.string().url('URL gambar tidak valid.'),
  description: z.string().optional(),
});

const ACHIEVEMENT_LEVELS = ["Sekolah", "Kecamatan", "Kabupaten/Kota", "Provinsi", "Nasional", "Internasional"];

export function AchievementsManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

  const achievementsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/achievements`);
    return query(ref, orderBy('dateAchieved', 'desc'));
  }, [firestore]);

  const { data: achievements, isLoading } = useCollection<Achievement>(achievementsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', studentName: '', competitionName: '', imageUrl: '', description: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingAchievement(null);
      form.reset({ title: '', studentName: '', competitionName: '', imageUrl: '', description: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingAchievement(null);
    form.reset({ title: '', studentName: '', competitionName: '', imageUrl: '', description: '' });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    form.reset({
        ...achievement,
        dateAchieved: achievement.dateAchieved.toDate(),
    });
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    const dataToSave = { ...values };

    if (editingAchievement) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/achievements`, editingAchievement.id);
      updateDocumentNonBlocking(docRef, dataToSave);
      toast({ title: 'Berhasil!', description: 'Data prestasi telah diperbarui.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/achievements`);
      addDocumentNonBlocking(ref, dataToSave);
      toast({ title: 'Berhasil!', description: 'Prestasi baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus prestasi ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/achievements`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Data prestasi telah dihapus.' });
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
            <CardTitle className="flex items-center gap-2"><Award /> Manajemen Prestasi</CardTitle>
            <CardDescription>Kelola daftar prestasi yang diraih oleh siswa sekolah.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Prestasi
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingAchievement ? 'Edit Prestasi' : 'Tambah Prestasi Baru'}</DialogTitle>
                    <DialogDescription>Isi detail prestasi yang diraih. Klik simpan jika sudah selesai.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Judul Prestasi</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="studentName" render={({ field }) => (
                        <FormItem><FormLabel>Nama Siswa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="competitionName" render={({ field }) => (
                        <FormItem><FormLabel>Nama Kompetisi/Acara</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="level" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tingkat</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih tingkat kejuaraan" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {ACHIEVEMENT_LEVELS.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                     )}/>
                    <FormField control={form.control} name="dateAchieved" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Tanggal Diraih</FormLabel>
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
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
                        <FormItem><FormLabel>URL Gambar</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
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
                    <TableHead>Prestasi</TableHead>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Tingkat</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">Memuat data prestasi...</TableCell>
                    </TableRow>
                    )}
                    {achievements && achievements.length > 0 ? (
                    achievements.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium max-w-xs truncate">{item.title}</TableCell>
                            <TableCell>{item.studentName}</TableCell>
                            <TableCell>{item.level}</TableCell>
                            <TableCell>{formatDate(item.dateAchieved)}</TableCell>
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
                    !isLoading && <TableRow><TableCell colSpan={5} className="text-center">Belum ada data prestasi. Mulai tambahkan!</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}

    
