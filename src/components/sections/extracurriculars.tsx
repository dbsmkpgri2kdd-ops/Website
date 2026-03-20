'use client';

import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Music, Palette, Dumbbell, Cpu, Calendar, LoaderCircle, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type Extracurricular } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';

const iconMap: { [key: string]: React.ElementType } = {
  Activity,
  Music,
  Palette,
  Dumbbell,
  Cpu,
};

const formSchema = z.object({
  studentName: z.string().min(2, "Nama harus diisi, minimal 2 karakter."),
  studentClass: z.string().min(3, "Kelas harus diisi."),
});

const ExtracurricularsSection = () => {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedEskul, setSelectedEskul] = useState<Extracurricular | null>(null);

  const dataQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/extracurriculars`);
    return query(ref, orderBy('name'));
  }, [firestore]);

  const { data: extracurriculars, isLoading } = useCollection<Extracurricular>(dataQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { studentName: "", studentClass: "" },
  });

  const handleRegisterClick = (eskul: Extracurricular) => {
    setSelectedEskul(eskul);
    setIsSubmitted(false);
    form.reset();
    setIsDialogOpen(true);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !selectedEskul) return;

    const registrationRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/extracurricularApplications`);
    addDocumentNonBlocking(registrationRef, {
      ...values,
      extracurricularName: selectedEskul.name,
      submissionDate: serverTimestamp(),
    });
    
    toast({ title: 'Pendaftaran Berhasil!', description: `Anda telah terdaftar di ${selectedEskul.name}.` });
    setIsSubmitted(true);
  }
  
  return (
    <>
      <section className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-headline text-primary">Ekstrakurikuler</h2>
          <p className="text-lg text-muted-foreground mt-2">Kembangkan bakat dan minatmu di luar jam pelajaran.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {isLoading && Array.from({length: 4}).map((_, i) => (
              <Card key={i} className="rounded-2xl shadow-lg flex flex-col sm:flex-row items-center p-6 gap-6">
                  <Skeleton className="w-16 h-16 rounded-xl" />
                  <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                  </div>
              </Card>
          ))}
          {extracurriculars?.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Card key={item.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex flex-col items-start p-6 gap-6">
                <div className="flex flex-col sm:flex-row items-start gap-6 w-full">
                    {Icon && (
                    <div className="p-4 bg-primary/10 text-primary rounded-xl">
                        <Icon size={32} />
                    </div>
                    )}
                    <div className="text-left flex-1">
                        <CardTitle className="text-xl font-bold mb-2 font-headline">{item.name}</CardTitle>
                        <CardDescription className='mb-3'>{item.description}</CardDescription>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>{item.schedule}</span>
                        </div>
                    </div>
                </div>
                <Button onClick={() => handleRegisterClick(item)} className="w-full sm:w-auto mt-4 sm:mt-0 ml-auto">Daftar Sekarang</Button>
              </Card>
            );
          })}
          {!isLoading && extracurriculars?.length === 0 && (
              <p className="text-muted-foreground text-center md:col-span-2">Data ekstrakurikuler belum ditambahkan oleh admin.</p>
          )}
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-headline">Daftar Ekstrakurikuler</DialogTitle>
            <DialogDescription>
              Isi formulir di bawah ini untuk mendaftar di kegiatan <span className="font-bold text-primary">{selectedEskul?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          {isSubmitted ? (
             <div className="text-center py-10 animate-fade-in flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={48} />
                </div>
                <h3 className="text-2xl font-bold mb-2 font-headline">Pendaftaran Berhasil!</h3>
                <p className="text-muted-foreground mb-6">Terima kasih telah mendaftar. Sampai jumpa di kegiatan!</p>
                <Button onClick={() => setIsDialogOpen(false)}>Tutup</Button>
             </div>
          ) : (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField control={form.control} name="studentName" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl><Input placeholder="Contoh: Budi Santoso" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="studentClass" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Kelas</FormLabel>
                        <FormControl><Input placeholder="Contoh: X TKJ 1" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <Button type="submit" className="w-full font-bold" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-2"/> : null}
                        Kirim Pendaftaran
                    </Button>
                </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExtracurricularsSection;
