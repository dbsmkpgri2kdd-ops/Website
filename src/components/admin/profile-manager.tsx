'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type School } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Save, Info, Globe, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  name: z.string().min(5, 'Nama sekolah minimal 5 karakter.'),
  shortName: z.string().min(3, 'Nama singkat minimal 3 karakter.'),
  logoUrl: z.string().url('URL logo tidak valid').optional().or(z.literal('')),
  address: z.string().min(10, 'Alamat minimal 10 karakter.'),
  phone: z.string().min(8, 'Nomor telepon minimal 8 karakter.'),
  email: z.string().email('Email tidak valid.'),
  principalName: z.string().min(3, 'Nama kepala sekolah minimal 3 karakter.'),
  principalMessage: z.string().min(20, 'Pesan sambutan minimal 20 karakter.'),
  history: z.string().min(20, 'Sejarah minimal 20 karakter.').optional().or(z.literal('')),
  vision: z.string().min(20, 'Visi minimal 20 karakter.'),
  mission: z.string().min(20, 'Misi minimal 20 karakter (pisahkan dengan baris baru).'),
  instagramUrl: z.string().url('URL Instagram tidak valid').optional().or(z.literal('')),
  tiktokUrl: z.string().url('URL TikTok tidak valid').optional().or(z.literal('')),
  facebookUrl: z.string().url('URL Facebook tidak valid').optional().or(z.literal('')),
  whatsappUrl: z.string().url('URL WhatsApp tidak valid').optional().or(z.literal('')),
  youtubeUrl: z.string().url('URL YouTube tidak valid').optional().or(z.literal('')),
  studentCount: z.coerce.number().int().min(0).optional(),
  teacherCount: z.coerce.number().int().min(0).optional(),
  industryPartnerCount: z.coerce.number().int().min(0).optional(),
});

export function ProfileManager() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const schoolDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'schools', SCHOOL_DATA_ID);
  }, [firestore]);

  const { data: schoolData, isLoading } = useDoc<School>(schoolDocRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '', shortName: '', logoUrl: '', address: '', phone: '', email: '',
      principalName: '', principalMessage: '', history: '', vision: '', mission: '',
      instagramUrl: '', tiktokUrl: '', facebookUrl: '', whatsappUrl: '', youtubeUrl: '',
      studentCount: 0, teacherCount: 0, industryPartnerCount: 0,
    },
  });

  useEffect(() => {
    if (schoolData) {
      form.reset({
        ...schoolData,
        mission: schoolData.mission?.join('\n') || '',
        logoUrl: schoolData.logoUrl || '',
        history: schoolData.history || '',
        instagramUrl: schoolData.instagramUrl || '',
        tiktokUrl: schoolData.tiktokUrl || '',
        facebookUrl: schoolData.facebookUrl || '',
        whatsappUrl: schoolData.whatsappUrl || '',
        youtubeUrl: schoolData.youtubeUrl || '',
        studentCount: schoolData.studentCount || 0,
        teacherCount: schoolData.teacherCount || 0,
        industryPartnerCount: schoolData.industryPartnerCount || 0,
      });
    }
  }, [schoolData, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !schoolDocRef) return;
    
    const dataToUpdate = {
        ...values,
        logoUrl: values.logoUrl || '',
        history: values.history || '',
        instagramUrl: values.instagramUrl || '',
        tiktokUrl: values.tiktokUrl || '',
        facebookUrl: values.facebookUrl || '',
        whatsappUrl: values.whatsappUrl || '',
        youtubeUrl: values.youtubeUrl || '',
        mission: values.mission.split('\n').filter(m => m.trim() !== ''),
        studentCount: values.studentCount || 0,
        teacherCount: values.teacherCount || 0,
        industryPartnerCount: values.industryPartnerCount || 0,
    };

    setDocumentNonBlocking(schoolDocRef, dataToUpdate, { merge: true });
    toast({ title: 'Profil Diperbarui', description: 'Informasi sekolah telah berhasil disimpan.' });
  }
  
  if (isLoading) {
    return (
        <Card className="shadow-lg rounded-2xl">
            <CardHeader><Skeleton className='h-8 w-1/3' /></CardHeader>
            <CardContent className="space-y-4">
                {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className='h-12 w-full' />)}
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b">
            <CardTitle>Identitas & Profil Sekolah</CardTitle>
            <CardDescription>Kelola informasi inti yang tampil di seluruh bagian website sekolah.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Tabs defaultValue="umum" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
                  <TabsTrigger value="umum" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 px-6"><Info className="mr-2 h-4 w-4" /> Informasi Umum</TabsTrigger>
                  <TabsTrigger value="akademik" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 px-6"><BarChart3 className="mr-2 h-4 w-4" /> Visi, Misi & Statistik</TabsTrigger>
                  <TabsTrigger value="sosmed" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 px-6"><Globe className="mr-2 h-4 w-4" /> Media Sosial</TabsTrigger>
                </TabsList>

                <div className="p-6 space-y-6">
                  <TabsContent value="umum" className="space-y-4 mt-0">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem><FormLabel>Nama Lengkap Sekolah</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="shortName" render={({ field }) => (
                          <FormItem><FormLabel>Nama Singkat / Akronim</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="logoUrl" render={({ field }) => (
                        <FormItem><FormLabel>URL Logo Sekolah (Google Drive didukung)</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Alamat Lengkap</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem><FormLabel>Nomor Telepon</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem><FormLabel>Email Resmi</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="border-t pt-4">
                      <FormField control={form.control} name="principalName" render={({ field }) => (
                          <FormItem><FormLabel>Nama Kepala Sekolah</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="principalMessage" render={({ field }) => (
                          <FormItem className="mt-4"><FormLabel>Sambutan Kepala Sekolah</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  </TabsContent>

                  <TabsContent value="akademik" className="space-y-4 mt-0">
                    <FormField control={form.control} name="vision" render={({ field }) => (
                        <FormItem><FormLabel>Visi Sekolah</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="mission" render={({ field }) => (
                        <FormItem><FormLabel>Misi Sekolah (Satu misi per baris)</FormLabel><FormControl><Textarea {...field} rows={6} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="history" render={({ field }) => (
                        <FormItem><FormLabel>Sejarah Singkat Sekolah</FormLabel><FormControl><Textarea {...field} rows={6} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-3 gap-4 border-t pt-4">
                      <FormField control={form.control} name="studentCount" render={({ field }) => (
                          <FormItem><FormLabel>Total Siswa</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="teacherCount" render={({ field }) => (
                          <FormItem><FormLabel>Total Guru</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="industryPartnerCount" render={({ field }) => (
                          <FormItem><FormLabel>Mitra Industri</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  </TabsContent>

                  <TabsContent value="sosmed" className="space-y-4 mt-0">
                    <FormField control={form.control} name="facebookUrl" render={({ field }) => (
                        <FormItem><FormLabel>Facebook URL</FormLabel><FormControl><Input {...field} placeholder="https://facebook.com/..." /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="instagramUrl" render={({ field }) => (
                        <FormItem><FormLabel>Instagram URL</FormLabel><FormControl><Input {...field} placeholder="https://instagram.com/..." /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="tiktokUrl" render={({ field }) => (
                        <FormItem><FormLabel>TikTok URL</FormLabel><FormControl><Input {...field} placeholder="https://tiktok.com/@..." /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="youtubeUrl" render={({ field }) => (
                        <FormItem><FormLabel>YouTube Channel URL</FormLabel><FormControl><Input {...field} placeholder="https://youtube.com/..." /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="whatsappUrl" render={({ field }) => (
                        <FormItem><FormLabel>WhatsApp Channel/Contact URL</FormLabel><FormControl><Input {...field} placeholder="https://wa.me/..." /></FormControl><FormMessage /></FormItem>
                    )} />
                  </TabsContent>
                </div>
              </Tabs>

              <div className="p-6 bg-muted/30 border-t flex justify-end">
                <Button type="submit" size="lg" className="font-bold shadow-lg" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-2"/> : <Save className="mr-2 h-5 w-5" />}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
    </Card>
  );
}
