
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type School } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Save, ShieldAlert, MonitorDot, Layout, Palette, Hammer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  isMaintenanceMode: z.boolean().default(false),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  layoutSettings: z.object({
    showHero: z.boolean().default(true),
    showPartners: z.boolean().default(true),
    showStats: z.boolean().default(true),
    showMajors: z.boolean().default(true),
    showNews: z.boolean().default(true),
    showCta: z.boolean().default(true),
  }),
});

export function SystemSettingsManager() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const schoolDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'schools', SCHOOL_DATA_ID) : null, [firestore]);
  const { data: schoolData, isLoading } = useDoc<School>(schoolDocRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isMaintenanceMode: false,
      primaryColor: '221 83% 53%',
      accentColor: '262 83% 58%',
      layoutSettings: {
        showHero: true,
        showPartners: true,
        showStats: true,
        showMajors: true,
        showNews: true,
        showCta: true,
      }
    },
  });

  useEffect(() => {
    if (schoolData) {
      form.reset({
        isMaintenanceMode: schoolData.isMaintenanceMode || false,
        primaryColor: schoolData.primaryColor || '221 83% 53%',
        accentColor: schoolData.accentColor || '262 83% 58%',
        layoutSettings: schoolData.layoutSettings || {
          showHero: true,
          showPartners: true,
          showStats: true,
          showMajors: true,
          showNews: true,
          showCta: true,
        }
      });
    }
  }, [schoolData, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !schoolDocRef) return;
    setDocumentNonBlocking(schoolDocRef, values, { merge: true });
    toast({ title: 'Konfigurasi Diterapkan', description: 'Tampilan dan tata letak website telah diperbarui.' });
  }

  if (isLoading) return <div className="flex justify-center py-20"><LoaderCircle className="animate-spin text-primary h-8 w-8" /></div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle className='font-bold'>Mode Pengembang & Kustomisasi</AlertTitle>
        <AlertDescription className='text-xs'>
          Pengaturan ini mengubah identitas visual dan struktur halaman utama. Perubahan warna menggunakan standar HSL CSS.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-8">
            
            <div className="space-y-8">
              {/* Appearance Settings */}
              <Card className="shadow-sm border-primary/10">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Palette className="text-primary h-5 w-5" />
                    <CardTitle className='text-lg'>Identitas Visual (Branding)</CardTitle>
                  </div>
                  <CardDescription>Ubah warna utama website sekolah.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warna Utama (HSL)</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. 221 83% 53%" /></FormControl>
                        <FormDescription className="text-[10px]">Contoh: 221 83% 53% (Biru Profesional)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accentColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warna Aksen (HSL)</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. 262 83% 58%" /></FormControl>
                        <FormDescription className="text-[10px]">Contoh: 262 83% 58% (Ungu Kerajaan)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Maintenance Tools */}
              <Card className="shadow-sm border-destructive/10">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Hammer className="text-destructive h-5 w-5" />
                    <CardTitle className='text-lg'>Pemeliharaan</CardTitle>
                  </div>
                  <CardDescription>Kontrol akses publik ke website.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="isMaintenanceMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 shadow-sm bg-muted/20">
                        <div className="space-y-0.5">
                          <FormLabel>Mode Perbaikan</FormLabel>
                          <FormDescription className="text-xs">Aktifkan untuk menampilkan halaman 'Under Construction'.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Layout Settings */}
            <Card className="shadow-sm border-primary/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Layout className="text-primary h-5 w-5" />
                  <CardTitle className='text-lg'>Tata Letak Beranda</CardTitle>
                </div>
                <CardDescription>Aktifkan atau sembunyikan bagian di halaman depan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {[
                    { name: 'showHero', label: 'Banner Utama (Hero)', desc: 'Bagian paling atas website' },
                    { name: 'showPartners', label: 'Slider Mitra', desc: 'Daftar logo kerjasama industri' },
                    { name: 'showStats', label: 'Statistik Sekolah', desc: 'Jumlah siswa, guru, dan mitra' },
                    { name: 'showMajors', label: 'Blok Jurusan', desc: 'Daftar kompetensi keahlian' },
                    { name: 'showNews', label: 'Berita Terkini', desc: 'Tampilkan artikel terbaru' },
                    { name: 'showCta', label: 'Banner Ajakan Daftar', desc: 'Tombol besar untuk pendaftaran PPDB' },
                  ].map((item) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={`layoutSettings.${item.name}` as any}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-card">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-bold">{item.label}</FormLabel>
                            <FormDescription className="text-[10px]">{item.desc}</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end sticky bottom-8 z-50">
            <Button type="submit" size="lg" className="font-black px-12 h-14 rounded-full shadow-2xl hover:scale-105 transition-all">
              {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />}
              Terapkan Perubahan Visual
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
