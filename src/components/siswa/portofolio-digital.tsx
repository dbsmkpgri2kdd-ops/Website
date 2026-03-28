
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, doc, orderBy, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { type PortfolioItem } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, LoaderCircle, FolderKanban, ExternalLink, Globe, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { convertGoogleDriveLink } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';

const formSchema = z.object({
  title: z.string().min(3, 'Judul karya minimal 3 karakter.'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter.'),
  imageUrl: z.string().url('URL gambar tidak valid.'),
  projectUrl: z.string().url('URL proyek tidak valid.').optional().or(z.literal('')),
  isPublic: z.boolean().default(false),
});

export function PortofolioDigital() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const portfolioQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    const ref = collection(firestore, `users/${user.uid}/portfolio`);
    return query(ref, orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: portfolioItems, isLoading } = useCollection<PortfolioItem>(portfolioQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '', imageUrl: '', projectUrl: '', isPublic: false },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingItem(null);
      form.reset({ title: '', description: '', imageUrl: '', projectUrl: '', isPublic: false });
    }
  }, [isDialogOpen, form]);

  const handleAddNew = () => {
    setEditingItem(null);
    form.reset();
    setIsDialogOpen(true);
  };
  
  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    form.reset(item);
    setIsDialogOpen(true);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) return;
    
    const studentData = {
        studentName: user.profile?.displayName || user.email?.split('@')[0],
        studentClass: 'Siswa Aktif',
    };

    const dataToSave = { ...values, ...studentData };

    if (editingItem) {
      const docRef = doc(firestore, `users/${user.uid}/portfolio`, editingItem.id);
      updateDocumentNonBlocking(docRef, dataToSave);
      toast({ title: 'Karya Diperbarui', description: 'Portofolio digital Anda telah diperbarui.' });
    } else {
      const ref = collection(firestore, `users/${user.uid}/portfolio`);
      addDocumentNonBlocking(ref, { ...dataToSave, createdAt: serverTimestamp() });
      toast({ title: 'Karya Ditambahkan', description: 'Karya baru telah masuk ke portofolio digital.' });
    }
    
    setIsDialogOpen(false);
  }
  
  const handleDelete = (id: string) => {
    if (!firestore || !user) return;
    if (confirm('Hapus karya ini dari portofolio Anda?')) {
      const docRef = doc(firestore, `users/${user.uid}/portfolio`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Karya Dihapus' });
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
        <Card className="shadow-lg border-none rounded-[2rem] bg-white/5 backdrop-blur-md overflow-hidden border">
            <CardHeader className="p-8 border-b border-white/5">
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-6'>
                  <div>
                    <CardTitle className="text-2xl font-black italic uppercase flex items-center gap-3">
                      <FolderKanban size={28} className="text-primary"/> Portofolio Digital
                    </CardTitle>
                    <CardDescription className="text-[10px] mt-1 uppercase font-bold tracking-widest opacity-60">Galeri karya terbaik dan proyek inovasi Anda.</CardDescription>
                  </div>
                  <Button onClick={handleAddNew} size="lg" className="rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-3xl glow-primary h-14 px-8">
                      <PlusCircle className="mr-2 h-5 w-5" /> Unggah Karya Baru
                  </Button>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[625px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
                    <DialogHeader className="p-8 bg-primary/5 border-b border-white/5">
                        <DialogTitle className="font-black uppercase italic tracking-tighter text-2xl">Editor Karya v3.0</DialogTitle>
                        <DialogDescription className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Detail Proyek Digital Siswa</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Judul Proyek</FormLabel><FormControl><Input {...field} placeholder="e.g. Aplikasi Monitoring Absensi" className="h-12 rounded-xl bg-white/5 border-white/10" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField control={form.control} name="imageUrl" render={({ field }) => (
                              <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">URL Banner Proyek</FormLabel><FormControl><Input {...field} placeholder="https://..." className="h-12 rounded-xl bg-white/5 border-white/10" /></FormControl><FormMessage /></FormItem>
                          )}/>
                          <FormField control={form.control} name="projectUrl" render={({ field }) => (
                              <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Tautan Demo (Live)</FormLabel><FormControl><Input {...field} placeholder="https://..." className="h-12 rounded-xl bg-white/5 border-white/10" /></FormControl><FormMessage /></FormItem>
                          )}/>
                        </div>
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Deskripsi Solusi</FormLabel><FormControl><Textarea rows={4} {...field} placeholder="Jelaskan masalah yang diselesaikan dan teknologi yang digunakan..." className="rounded-2xl bg-white/5 border-white/10" /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="isPublic" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-primary/20 p-5 bg-primary/5 shadow-inner">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-sm font-black uppercase flex items-center gap-2"><Globe size={16} className="text-primary"/> Pameran Publik (Showcase)</FormLabel>
                                    <FormDescription className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Izinkan admin untuk menampilkan karya ini di halaman utama website.</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}/>
                         <div className="pt-6 flex justify-end gap-4 border-t border-white/5">
                            <DialogClose asChild><Button variant="ghost" className="rounded-xl uppercase font-black text-[9px] tracking-widest">Batal</Button></DialogClose>
                            <Button type="submit" className="rounded-xl font-black uppercase text-[10px] tracking-widest shadow-3xl glow-primary px-10 h-14" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-3 h-5 w-5"/> : <FolderKanban className='mr-3 h-5 w-5' />}
                                Publikasikan Karya
                            </Button>
                        </div>
                        </form>
                    </Form>
                    </DialogContent>
                </Dialog>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {isLoading && Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="rounded-[2.5rem] h-[400px] w-full" />)}
                    {portfolioItems && portfolioItems.map((item) => (
                        <Card key={item.id} className="rounded-[2.5rem] shadow-2xl border-white/5 bg-white/5 overflow-hidden flex flex-col group hover:border-primary/20 transition-all duration-700 hover:scale-[1.02]">
                            <div className="relative aspect-video bg-muted overflow-hidden">
                                 <Image src={convertGoogleDriveLink(item.imageUrl)} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80 group-hover:opacity-100" unoptimized/>
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                 
                                 <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-500">
                                    <Button size="icon" variant="secondary" className="h-10 w-10 rounded-xl shadow-3xl bg-card/80 backdrop-blur-xl border-white/5" onClick={() => handleEdit(item)}><Edit size={18}/></Button>
                                    <Button size="icon" variant="destructive" className="h-10 w-10 rounded-xl shadow-3xl" onClick={() => handleDelete(item.id)}><Trash2 size={18}/></Button>
                                 </div>
                                 
                                 {item.isPublic && (
                                    <Badge className="absolute bottom-4 left-4 bg-primary text-white border-none text-[8px] font-black uppercase tracking-[0.3em] shadow-3xl px-4 py-1.5 rounded-full">
                                      <Sparkles size={10} className="mr-2 animate-pulse"/> SHOWCASE AKTIF
                                    </Badge>
                                 )}
                            </div>
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="font-black uppercase italic tracking-tight text-xl group-hover:text-primary transition-colors">{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="px-8 pb-8 flex-grow">
                                 <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed font-medium uppercase tracking-wider opacity-60">{item.description}</p>
                            </CardContent>
                            {item.projectUrl && (
                              <CardFooter className="p-8 pt-0">
                                  <Button asChild variant="outline" size="sm" className="w-full rounded-xl border-white/10 hover:bg-primary hover:text-white hover:border-primary font-black uppercase tracking-[0.3em] text-[9px] h-12 shadow-inner transition-all">
                                      <a href={item.projectUrl} target='_blank' rel='noopener noreferrer'><ExternalLink size={14} className='mr-2'/> Kunjungi Proyek Digital</a>
                                  </Button>
                              </CardFooter>
                            )}
                        </Card>
                    ))}
                     {!isLoading && portfolioItems?.length === 0 && (
                        <div className="col-span-full text-center py-32 border-2 border-dashed border-white/5 rounded-[4rem] bg-white/[0.01]">
                          <FolderKanban size={48} className="mx-auto mb-6 text-muted-foreground opacity-10" />
                          <div className='space-y-2'>
                            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 italic">Belum Ada Karya Yang Terdaftar</p>
                            <p className='text-[9px] font-bold text-muted-foreground/20 uppercase tracking-widest'>Mulai bangun rekam jejak digital profesional Anda hari ini.</p>
                          </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
