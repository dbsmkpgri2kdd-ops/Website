'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type Extracurricular } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, Activity, Music, Palette, Dumbbell, Cpu } from 'lucide-react';
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const ICONS = [
    { name: 'Activity', component: Activity },
    { name: 'Music', component: Music },
    { name: 'Palette', component: Palette },
    { name: 'Dumbbell', component: Dumbbell },
    { name: 'Cpu', component: Cpu },
];

const iconMap: { [key: string]: React.ElementType } = {
  Activity,
  Music,
  Palette,
  Dumbbell,
  Cpu,
};

const formSchema = z.object({
  name: z.string().min(3, 'Nama ekstrakurikuler minimal 3 karakter.'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter.'),
  icon: z.string({ required_error: 'Pilih sebuah ikon.' }),
  schedule: z.string().min(5, 'Jadwal harus diisi.'),
});

export function ExtracurricularsManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Extracurricular | null>(null);

  const dataQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/extracurriculars`);
    return query(ref, orderBy('name'));
  }, [firestore]);

  const { data: extracurriculars, isLoading } = useCollection<Extracurricular>(dataQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', description: '', icon: '', schedule: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingItem(null);
      form.reset({ name: '', description: '', icon: '', schedule: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingItem(null);
    form.reset({ name: '', description: '', icon: '', schedule: '' });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (item: Extracurricular) => {
    setEditingItem(item);
    form.reset(item);
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    if (editingItem) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/extracurriculars`, editingItem.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Berhasil!', description: 'Ekstrakurikuler telah diperbarui.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/extracurriculars`);
      addDocumentNonBlocking(ref, values);
      toast({ title: 'Berhasil!', description: 'Ekstrakurikuler baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/extracurriculars`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Ekstrakurikuler telah dihapus.' });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity /> Manajemen Ekstrakurikuler</CardTitle>
            <CardDescription>Kelola daftar kegiatan ekstrakurikuler yang ada di sekolah.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Ekstrakurikuler
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler Baru'}</DialogTitle>
                    <DialogDescription>Lengkapi detail ekstrakurikuler. Klik simpan jika sudah selesai.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nama Ekstrakurikuler</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="schedule" render={({ field }) => (
                        <FormItem><FormLabel>Jadwal</FormLabel><FormControl><Input {...field} placeholder="e.g. Setiap Sabtu, 10:00 - 12:00" /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="icon" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ikon</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih ikon" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {ICONS.map(icon => (
                                        <SelectItem key={icon.name} value={icon.name}>
                                            <div className="flex items-center gap-2">
                                                <icon.component className="h-4 w-4" />
                                                <span>{icon.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Deskripsi Singkat</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
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
                    <TableHead>Ikon</TableHead>
                    <TableHead>Nama Kegiatan</TableHead>
                    <TableHead>Jadwal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">Memuat data...</TableCell>
                    </TableRow>
                    )}
                    {extracurriculars && extracurriculars.length > 0 ? (
                    extracurriculars.map((item) => {
                        const IconComp = iconMap[item.icon];
                        return (
                            <TableRow key={item.id}>
                                <TableCell>{IconComp && <IconComp className="h-5 w-5" />}</TableCell>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">{item.schedule}</TableCell>
                                <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })
                    ) : (
                    !isLoading && <TableRow><TableCell colSpan={4} className="text-center">Belum ada data. Mulai tambahkan!</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}

    
