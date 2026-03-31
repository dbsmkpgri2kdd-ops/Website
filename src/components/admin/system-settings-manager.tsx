
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
import { LoaderCircle, Save, ShieldAlert, Layout, Palette, Hammer, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  isMaintenanceMode: z.boolean().default(false),
  studentDatabaseUrl: z.string().url('URL CSV tidak valid.').optional().or(z.literal('')),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  layoutSettings: z.object({
    showHero: z.boolean().default(true),
    showPartners: z.boolean().default(true),
    showStats: z.boolean().default(true),
    showMajors: z.boolean().default(true),
    showNews: z.boolean().default(true),
    showCta: z.boolean().default(true),
    showShowcase: z.boolean().default(true),
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
      studentDatabaseUrl: '',
      primaryColor: '221 83% 53%',
      accentColor: '262 83% 58%',
      layoutSettings: {
        showHero: true,
        showPartners: true,
        showStats: true,
        showMajors: true,
        showNews: true,
        showCta: true,
        showShowcase: true,
      }
    },
  });

  useEffect(() => {
    if (schoolData) {
      form.reset({
        isMaintenanceMode: schoolData.isMaintenanceMode || false,
        studentDatabaseUrl: schoolData.studentDatabaseUrl || '',
        primaryColor: schoolData.primaryColor || '221 83% 53%',
        accentColor: schoolData.accentColor || '262 83% 58%',
        layoutSettings: {
            ...form.getValues('layoutSettings'),
            ...schoolData.layoutSettings
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
      <Alert className="bg-primary/5 border-primary/20">
        <ShieldAlert className="h-4 w-4 text-primary" />
        <AlertTitle className='font-black uppercase tracking-widest text-[10px]'>Brand Customization</AlertTitle>
        <AlertDescription className='text-xs font-medium'>
          Atur identitas visual sekolah Anda. Perubahan warna akan langsung berdampak pada seluruh elemen website.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-8">
            
            <div className="space-y-8">
              {/* Data & Core Settings */}
              <Card className="shadow-2xl border-none rounded-[2rem]">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className='p-2 bg-blue-500/10 text-blue-500 rounded-xl'><Database size={20} /></div>
                    <CardTitle className='text-xl font-headline font-black uppercase italic'>Data Integration</CardTitle>
                  </div>
                  <CardDescription>Integrasikan database eksternal untuk sinkronisasi profil otomatis.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="studentDatabaseUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Link CSV Database Siswa</FormLabel>
                        <FormControl><Input {...field} placeholder="https://docs.google.com/spreadsheets/.../pub?output=csv" className='h-12 rounded-xl'/></FormControl>
                        <FormDescription className="text-[9px]">Sistem akan mencari kolom 'NIS', 'Nama', dan 'Kelas' pada file ini.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Appearance Settings */}
              <Card className="shadow-2xl border-none rounded-[2rem]">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className='p-2 bg-primary/10 text-primary rounded-xl'><Palette size={20} /></div>
                    <CardTitle className='text-xl font-headline font-black uppercase italic'>Corporate Branding</CardTitle>
                  </div>
                  <CardDescription>Ubah warna tema utama (format HSL).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Primary Color (HSL)</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. 221 83% 53%" className='h-12 rounded-xl'/></FormControl>
                        <FormDescription className="text-[9px]">Default: 221 83% 53% (Royal Blue)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accentColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accent Color (HSL)</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. 262 83% 58%" className='h-12 rounded-xl'/></FormControl>
                        <FormDescription className="text-[9px]">Default: 262 83% 58% (Electric Purple)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Maintenance Tools */}
              <Card className="shadow-2xl border-none rounded-[2rem]">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className='p-2 bg-destructive/10 text-destructive rounded-xl'><Hammer size={20} /></div>
                    <CardTitle className='text-xl font-headline font-black uppercase italic'>System Access</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="isMaintenanceMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-2xl border p-5 shadow-sm bg-muted/20">
                        <div className="space-y-0.5">
                          <FormLabel className='font-bold uppercase text-xs tracking-tight'>Maintenance Mode</FormLabel>
                          <FormDescription className="text-[10px]">Aktifkan untuk mengunci akses publik sementara.</FormDescription>
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
            <Card className="shadow-2xl border-none rounded-[2.5rem]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className='p-2 bg-primary/10 text-primary rounded-xl'><Layout size={20} /></div>
                  <CardTitle className='text-xl font-headline font-black uppercase italic'>Homepage Layout</CardTitle>
                </div>
                <CardDescription>Kontrol bagian mana saja yang ingin Anda tampilkan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {[
                    { name: 'showHero', label: 'Impact Hero Banner', desc: 'Area utama fullscreen di atas' },
                    { name: 'showPartners', label: 'Industry Slider', desc: 'Daftar logo mitra industri' },
                    { name: 'showStats', label: 'School Statistics', desc: 'Angka pencapaian sekolah' },
                    { name: 'showMajors', label: 'Academic Programs', desc: 'Blok informasi jurusan' },
                    { name: 'showNews', label: 'Activity Updates', desc: 'Berita dan pengumuman' },
                    { name: 'showShowcase', label: 'Student Portfolio', desc: 'Karya publik terbaik siswa' },
                    { name: 'showCta', label: 'Call to Action', desc: 'Banner pendaftaran besar' },
                  ].map((item) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={`layoutSettings.${item.name}` as any}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 hover:bg-muted/10 transition-colors">
                          <div className="space-y-0.5">
                            <FormLabel className="text-xs font-black uppercase tracking-tight">{item.label}</FormLabel>
                            <FormDescription className="text-[9px]">{item.desc}</FormDescription>
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
            <Button type="submit" size="lg" className="font-black px-12 h-16 rounded-3xl shadow-3xl glow-primary hover:scale-105 transition-all uppercase tracking-widest">
              {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />}
              Save All Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
