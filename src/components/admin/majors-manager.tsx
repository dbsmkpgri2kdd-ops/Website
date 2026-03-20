'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type Major } from '@/lib/data';
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
  DialogDescription,
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
import { PlusCircle, Trash2, Edit, LoaderCircle, Computer, BarChart4, Film, Wrench, Bike, BookOpen } from 'lucide-react';
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const ICONS = [
    { name: 'Computer', component: Computer },
    { name: 'BarChart4', component: BarChart4 },
    { name: 'Film', component: Film },
    { name: 'Wrench', component: Wrench },
    { name: 'Bike', component: Bike },
    { name: 'BookOpen', component: BookOpen },
];

const iconMap: { [key: string]: React.ElementType } = {
  Computer,
  BarChart4,
  Film,
  Wrench,
  Bike,
  BookOpen,
};

const formSchema = z.object({
  name: z.string().min(5, 'Nama jurusan minimal 5 karakter.'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter.'),
  icon: z.string({ required_error: 'Pilih sebuah ikon.' }),
});

export function MajorsManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);

  const majorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const majorsRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/majors`);
    return query(majorsRef, orderBy('name'));
  }, [firestore]);

  const { data: majors, isLoading } = useCollection<Major>(majorsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', description: '', icon: '' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingMajor(null);
      form.reset({ name: '', description: '', icon: '' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingMajor(null);
    form.reset({ name: '', description: '', icon: '' });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (major: Major) => {
    setEditingMajor(major);
    form.reset(major);
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    if (editingMajor) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/majors`, editingMajor.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Berhasil!', description: 'Jurusan telah diperbarui.' });
    } else {
      const majorsRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/majors`);
      addDocumentNonBlocking(majorsRef, values);
      toast({ title: 'Berhasil!', description: 'Jurusan baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus jurusan ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/majors`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Jurusan telah dihapus.' });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen /> Manajemen Jurusan</CardTitle>
            <CardDescription>Kelola daftar kompetensi keahlian yang tersedia di sekolah.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Jurusan
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>{editingMajor ? 'Edit Jurusan' : 'Tambah Jurusan Baru'}</DialogTitle>
                    <DialogDescription>Lengkapi detail kompetensi keahlian. Klik simpan jika sudah selesai.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Jurusan</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ikon</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih ikon untuk jurusan" />
                                    </SelectTrigger>
                                </FormControl>
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
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Deskripsi Singkat</FormLabel>
                            <FormControl><Textarea rows={3} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <LoaderCircle className="animate-spin mr-2"/>}
                        Simpan Jurusan
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
                    <TableHead>Nama Jurusan</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">Memuat jurusan...</TableCell>
                    </TableRow>
                    )}
                    {majors && majors.length > 0 ? (
                    majors.map((major) => {
                        const IconComp = iconMap[major.icon];
                        return (
                            <TableRow key={major.id}>
                                <TableCell>{IconComp && <IconComp className="h-5 w-5" />}</TableCell>
                                <TableCell className="font-medium">{major.name}</TableCell>
                                <TableCell className="max-w-sm truncate">{major.description}</TableCell>
                                <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(major)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(major.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })
                    ) : (
                    !isLoading && <TableRow><TableCell colSpan={4} className="text-center">Belum ada jurusan. Mulai tambahkan!</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}

    
