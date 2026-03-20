'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type GuestbookEntry } from '@/lib/data';
import { collection, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { LoaderCircle, Send, User, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  name: z.string().min(2, "Nama harus diisi, minimal 2 karakter."),
  origin: z.string().min(3, "Asal/instansi harus diisi."),
  message: z.string().min(10, "Pesan minimal 10 karakter.").max(500, "Pesan maksimal 500 karakter."),
});

const GuestbookSection = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const guestbookQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/guestbookEntries`);
    return query(ref, orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: entries, isLoading } = useCollection<GuestbookEntry>(guestbookQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", origin: "", message: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    
    const guestbookRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/guestbookEntries`);
    addDocumentNonBlocking(guestbookRef, { ...values, createdAt: serverTimestamp() });
    
    toast({ title: 'Terima Kasih!', description: 'Pesan Anda telah berhasil dikirim.' });
    form.reset();
    setIsSubmitted(true);
  }

  const formatDate = (date: any) => {
    if (!date) return 'Baru saja';
    const jsDate = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return format(jsDate, "d MMMM yyyy, HH:mm", { locale: idLocale });
  };

  return (
    <section className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-headline text-primary">Buku Tamu Digital</h2>
        <p className="text-lg text-muted-foreground mt-2">Tinggalkan jejak dan sampaikan kesan Anda tentang sekolah kami.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-16 items-start">
        <Card className="rounded-3xl shadow-2xl">
          <CardContent className="p-8">
            {isSubmitted ? (
                <div className="text-center py-10 animate-fade-in flex flex-col items-center justify-center h-full">
                  <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={48} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 font-headline">Pesan Terkirim!</h3>
                  <p className="text-muted-foreground mb-6">Terima kasih atas partisipasi Anda.</p>
                  <Button onClick={() => setIsSubmitted(false)}>Tulis Pesan Lagi</Button>
                </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <h3 className="text-2xl font-bold font-headline">Tulis Pesan Anda</h3>
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Anda</FormLabel>
                      <FormControl><Input placeholder="Contoh: Jane Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="origin" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asal Kota / Instansi</FormLabel>
                      <FormControl><Input placeholder="Contoh: Jakarta / Universitas Indonesia" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pesan Anda</FormLabel>
                      <FormControl><Textarea rows={5} placeholder="Tuliskan kesan dan pesan Anda di sini..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full font-bold" size="lg" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : <Send />}
                    Kirim Pesan
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <div>
          <h3 className="text-2xl font-bold font-headline mb-6">Pesan dari Pengunjung</h3>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {isLoading && Array.from({length: 3}).map((_, i) => (
                <Card key={i} className="p-4 rounded-xl"><div className="h-20 bg-muted rounded-lg animate-pulse"></div></Card>
              ))}
              {entries?.map((entry) => (
                <Card key={entry.id} className="p-6 rounded-2xl shadow-lg">
                  <div className="flex items-start gap-4">
                    <Avatar className='mt-1'>
                      <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='flex justify-between items-center'>
                        <div>
                           <p className="font-bold">{entry.name}</p>
                           <p className="text-xs text-muted-foreground">dari {entry.origin}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
                      </div>
                      <p className="text-foreground/90 mt-3 border-t pt-3">{entry.message}</p>
                    </div>
                  </div>
                </Card>
              ))}
              {!isLoading && entries?.length === 0 && (
                <p className="text-muted-foreground text-center py-10">Jadilah yang pertama meninggalkan pesan!</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </section>
  );
};

export default GuestbookSection;
