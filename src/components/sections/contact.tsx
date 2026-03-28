
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Phone, Mail, Send, LoaderCircle, CheckCircle } from 'lucide-react';
import { type School, SCHOOL_DATA_ID } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter."),
  email: z.string().email("Email tidak valid."),
  subject: z.string().min(5, "Subjek minimal 5 karakter."),
  message: z.string().min(10, "Pesan minimal 10 karakter."),
});

type ContactSectionProps = {
    schoolData: School | null;
    isSchoolDataLoading: boolean;
};

const ContactSection = ({ schoolData, isSchoolDataLoading }: ContactSectionProps) => {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", email: "", subject: "", message: "" },
    });

    const contactInfo = [
        { label: 'Alamat', value: schoolData?.address, icon: MapPin, isLoading: isSchoolDataLoading },
        { label: 'Telepon', value: schoolData?.phone, icon: Phone, isLoading: isSchoolDataLoading },
        { label: 'Email', value: schoolData?.email, icon: Mail, isLoading: isSchoolDataLoading },
    ];

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore) return;
        
        const messagesRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/contactMessages`);
        addDocumentNonBlocking(messagesRef, {
            ...values,
            createdAt: serverTimestamp(),
        });

        toast({ title: 'Pesan Terkirim', description: 'Terima kasih, kami akan segera menghubungi Anda.' });
        setIsSubmitted(true);
        form.reset();
    }

  return (
    <section className="py-16 max-w-7xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">Hubungi Kami</h2>
        <p className="text-base md:text-lg text-muted-foreground mt-2">Kami siap membantu Anda. Jangan ragu untuk menghubungi kami.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Info Cards */}
        <div className="space-y-6">
            {contactInfo.map((info) => (
                <Card key={info.label} className="rounded-2xl shadow-md p-6 border-primary/5 hover:border-primary/20 transition-all">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                            <info.icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg font-headline leading-tight">{info.label}</h4>
                            <div className="text-sm text-muted-foreground mt-1 leading-relaxed break-words">
                                {info.isLoading ? <Skeleton className='h-4 w-full' /> : (info.value || '-')}
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
            
            {/* Map Embed */}
            <div className="h-64 rounded-2xl overflow-hidden shadow-md border bg-muted">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15844.414414141414!2d105.1!3d-5.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMjQnMDAuMCJTIDEwNcKwMDYnMDAuMCJF!5e0!3m2!1sen!2sid!4v1700000000000" 
                    width="100%" height="100%" style={{border:0}} allowFullScreen loading="lazy" title="Lokasi Sekolah"
                ></iframe>
            </div>
        </div>

        {/* Contact Form */}
        <Card className="lg:col-span-2 rounded-3xl shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b p-8">
                <CardTitle className="text-2xl font-bold font-headline">Kirim Pesan Langsung</CardTitle>
                <p className="text-muted-foreground text-sm">Ada pertanyaan atau saran? Sampaikan melalui formulir di bawah ini.</p>
            </CardHeader>
            <CardContent className="p-8">
                {isSubmitted ? (
                    <div className="text-center py-12 animate-fade-in">
                        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={48} />
                        </div>
                        <h3 className="text-2xl font-bold font-headline mb-2">Terima Kasih!</h3>
                        <p className="text-muted-foreground mb-8">Pesan Anda telah kami terima dan akan segera ditindaklanjuti.</p>
                        <Button onClick={() => setIsSubmitted(false)} variant="outline" className="rounded-full">Kirim Pesan Lainnya</Button>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input placeholder="John Doe" {...field} className="h-12 rounded-xl"/></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Alamat Email</FormLabel><FormControl><Input type="email" placeholder="nama@email.com" {...field} className="h-12 rounded-xl"/></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="subject" render={({ field }) => (
                                <FormItem><FormLabel>Subjek / Perihal</FormLabel><FormControl><Input placeholder="Tanya Pendaftaran, Kerja Sama, dll" {...field} className="h-12 rounded-xl"/></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="message" render={({ field }) => (
                                <FormItem><FormLabel>Isi Pesan</FormLabel><FormControl><Textarea rows={6} placeholder="Tuliskan pesan Anda secara detail..." {...field} className="rounded-2xl"/></FormControl><FormMessage /></FormItem>
                            )} />
                            <Button type="submit" size="lg" className="w-full h-14 rounded-2xl font-bold shadow-lg shadow-primary/20" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-2" /> : <Send className="mr-2" />}
                                Kirim Pesan Sekarang
                            </Button>
                        </form>
                    </Form>
                )}
            </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ContactSection;
