'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type QuickLink } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, Link as LinkIcon, Globe, Laptop, AppWindow as AppIcon, BookOpen, GraduationCap, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter.'),
  description: z.string().min(5, 'Deskripsi minimal 5 karakter.'),
  url: z.string().url('URL tidak valid.'),
  icon: z.string({ required_error: 'Pilih ikon.' }),
  audience: z.enum(['all', 'public', 'guru', 'siswa'], { required_error: 'Pilih audiens.' }),
});

const ICONS = [
  { name: 'Globe', component: Globe },
  { name: 'Laptop', component: Laptop },
  { name: 'AppIcon', component: AppIcon },
  { name: 'BookOpen', component: BookOpen },
  { name: 'GraduationCap', component: GraduationCap },
  { name: 'Users', component: Users },
];

const iconMap: { [key: string]: any } = {
  Globe, Laptop, AppIcon, BookOpen, GraduationCap, Users
};

export function QuickLinksManager() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuickLink | null>(null);

  const linksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/quickLinks`);
    return query(ref, orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: links, isLoading } = useCollection<QuickLink>(linksQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '', url: '', icon: 'Globe', audience: 'all' },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingItem(null);
      form.reset({ title: '', description: '', url: '', icon: 'Globe', audience: 'all' });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingItem(null);
    form.reset();
    setIsDialogOpen(true);
  };
  
  const handleEdit = (item: QuickLink) => {
    setEditingItem(item);
    form.reset(item);
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    if (editingItem) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/quickLinks`, editingItem.id);
      updateDocumentNonBlocking(docRef, values);
      toast({ title: 'Berhasil!', description: 'Tautan aplikasi telah diperbarui.' });
    } else {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/quickLinks`);
      addDocumentNonBlocking(ref, { ...values, createdAt: serverTimestamp() });
      toast({ title: 'Berhasil!', description: 'Tautan aplikasi baru telah ditambahkan.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus tautan ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/quickLinks`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Tautan telah dihapus.' });
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><LinkIcon /> Manajemen Tautan Aplikasi</CardTitle>
            <CardDescription>Kelola aplikasi eksternal atau fitur baru untuk ditampilkan di dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleAddNew} className="w-full mb-4">
                <PlusCircle className="mr-2" /> Tambah Tautan Baru
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{editingItem ? 'Edit Tautan' : 'Tambah Tautan Baru'}</DialogTitle>
                    <DialogDescription>Lengkapi detail aplikasi/tautan di bawah ini.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Nama Aplikasi / Fitur</FormLabel><FormControl><Input {...field} placeholder="e.g. E-Learning" /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="url" render={({ field }) => (
                        <FormItem><FormLabel>URL Link</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="icon" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Ikon</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Pilih ikon" /></SelectTrigger></FormControl>
                                  <SelectContent>
                                      {ICONS.map(icon => (
                                          <SelectItem key={icon.name} value={icon.name}>
                                              <div className="flex items-center gap-2"><icon.component size={16}/> {icon.name}</div>
                                          </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                              <FormMessage />
                          </FormItem>
                      )}/>
                      <FormField control={form.control} name="audience" render={({ field }) => (
                          <FormItem>
                              <FormLabel>Target Audiens</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Pilih target" /></SelectTrigger></FormControl>
                                  <SelectContent>
                                      <SelectItem value="all">Semua</SelectItem>
                                      <SelectItem value="public">Publik</SelectItem>
                                      <SelectItem value="guru">Hanya Guru</SelectItem>
                                      <SelectItem value="siswa">Hanya Siswa</SelectItem>
                                  </SelectContent>
                              </Select>
                              <FormMessage />
                          </FormItem>
                      )}/>
                    </div>
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Deskripsi Singkat</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
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
                    <TableHead>Nama</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center">Memuat data...</TableCell>
                    </TableRow>
                    )}
                    {links && links.length > 0 ? (
                    links.map((item) => {
                        const Icon = iconMap[item.icon] || Globe;
                        return (
                          <TableRow key={item.id}>
                              <TableCell className="font-medium flex items-center gap-2">
                                <Icon size={16} className="text-primary"/>
                                {item.title}
                              </TableCell>
                              <TableCell><Badge variant="outline" className="capitalize">{item.audience}</Badge></TableCell>
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
                    !isLoading && <TableRow><TableCell colSpan={3} className="text-center">Belum ada tautan ditambahkan.</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
