'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, useFirestore } from '@/firebase';
import { SCHOOL_DATA_ID } from '@/lib/data';
import { collection, serverTimestamp } from 'firebase/firestore';
import { LoaderCircle, Send, CheckCircle } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, "Nama lengkap harus diisi."),
  graduationYear: z.string().min(4, "Tahun lulus harus diisi.").max(4, "Format tahun tidak valid."),
  status: z.string({ required_error: "Pilih status Anda saat ini." }),
  currentActivityDetail: z.string().min(3, "Detail aktivitas harus diisi."),
  suggestions: z.string().optional(),
});

const TracerStudySection = () => {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      graduationYear: "",
      currentActivityDetail: "",
      suggestions: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    const tracerStudyRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/tracerStudyResponses`);
    addDocumentNonBlocking(tracerStudyRef, {
      ...values,
      submissionDate: serverTimestamp(),
    });
    
    toast({ title: 'Data Terkirim!', description: 'Terima kasih atas partisipasi Anda dalam tracer study ini.' });
    form.reset();
    setIsSubmitted(true);
  }

  const status = form.watch('status');

  const getActivityDetailLabel = () => {
    switch (status) {
      case 'Bekerja':
        return 'Nama Perusahaan & Jabatan';
      case 'Kuliah':
        return 'Nama Perguruan Tinggi & Jurusan';
      case 'Wirausaha':
        return 'Nama & Bidang Usaha';
      case 'Lainnya':
        return 'Jelaskan Aktivitas Anda';
      default:
        return 'Detail Aktivitas';
    }
  };

  return (
    <section className="py-16 max-w-4xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-headline text-primary">Tracer Study Alumni</h2>
        <p className="text-lg text-muted-foreground mt-2">Bantu kami melacak jejak alumni untuk kemajuan sekolah.</p>
      </div>

      <Card className="p-10 rounded-3xl shadow-2xl">
        <CardContent className="p-0">
          {isSubmitted ? (
            <div className="text-center py-10 animate-fade-in flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} />
              </div>
              <h3 className="text-2xl font-bold mb-2 font-headline">Terima Kasih!</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Data Anda telah berhasil kami terima. Kontribusi Anda sangat berarti untuk pengembangan sekolah.</p>
              <Button onClick={() => setIsSubmitted(false)}>Isi Form Lagi</Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <p className="text-muted-foreground">Mohon kesediaan para alumni untuk mengisi formulir berikut dengan data yang sebenarnya. Data Anda akan kami jaga kerahasiaannya.</p>
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="graduationYear" render={({ field }) => (
                  <FormItem><FormLabel>Tahun Lulus</FormLabel><FormControl><Input type="number" placeholder="e.g. 2021" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Saat Ini</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Bekerja">Bekerja</SelectItem>
                        <SelectItem value="Kuliah">Kuliah</SelectItem>
                        <SelectItem value="Wirausaha">Wirausaha</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                {status && (
                  <FormField control={form.control} name="currentActivityDetail" render={({ field }) => (
                    <FormItem><FormLabel>{getActivityDetailLabel()}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                )}
                <FormField control={form.control} name="suggestions" render={({ field }) => (
                  <FormItem><FormLabel>Saran & Masukan untuk Sekolah (Opsional)</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full font-bold" size="lg" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-2" /> : <Send className="mr-2" />}
                  Kirim Data
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default TracerStudySection;
