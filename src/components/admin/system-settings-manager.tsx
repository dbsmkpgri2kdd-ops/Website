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
import { LoaderCircle, Save, ShieldAlert, MonitorDot, Palmtree, Hammer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  isMaintenanceMode: z.boolean().default(false),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
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
      primaryColor: '210 100% 50%',
      accentColor: '45 66% 52%',
    },
  });

  useEffect(() => {
    if (schoolData) {
      form.reset({
        isMaintenanceMode: schoolData.isMaintenanceMode || false,
        primaryColor: schoolData.primaryColor || '210 100% 50%',
        accentColor: schoolData.accentColor || '45 66% 52%',
      });
    }
  }, [schoolData, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !schoolDocRef) return;
    setDocumentNonBlocking(schoolDocRef, values, { merge: true });
    toast({ title: 'Pengaturan Disimpan', description: 'Konfigurasi sistem telah diperbarui.' });
  }

  if (isLoading) return <LoaderCircle className="animate-spin mx-auto mt-10" />;

  return (
    <div className="space-y-8 animate-fade-in">
      <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Perhatian Keamanan</AlertTitle>
        <AlertDescription>
          Pengaturan di bawah ini berdampak langsung pada seluruh fungsionalitas dan tampilan website publik. Gunakan dengan bijak.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Maintenance Settings */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Hammer className="text-primary" />
                  <CardTitle>Alat Pemeliharaan</CardTitle>
                </div>
                <CardDescription>Aktifkan mode khusus untuk perbaikan sistem.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="isMaintenanceMode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 shadow-sm bg-muted/20">
                      <div className="space-y-0.5">
                        <FormLabel>Mode Perbaikan</FormLabel>
                        <FormDescription className="text-xs">Tampilkan halaman 'Under Construction' ke publik.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Design & UI Tools */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MonitorDot className="text-primary" />
                  <CardTitle>Desain & Branding</CardTitle>
                </div>
                <CardDescription>Kelola elemen visual website.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warna Utama (HSL Format)</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. 210 100% 50%" /></FormControl>
                      <FormDescription className="text-[10px]">Gunakan format HSL tanpa 'hsl()'.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accentColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warna Aksen (HSL Format)</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g. 45 66% 52%" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" className="font-bold min-w-[200px] shadow-lg shadow-primary/20">
              {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-2" /> : <Save className="mr-2" />}
              Terapkan Pengaturan
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}