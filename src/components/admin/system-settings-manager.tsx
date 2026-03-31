
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
import { LoaderCircle, Save, ShieldAlert, Layout, Palette, Database, Table as TableIcon, CheckCircle2, XCircle, Search, Settings2, MapPin, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  isMaintenanceMode: z.boolean().default(false),
  studentDatabaseUrl: z.string().url('URL CSV tidak valid.').optional().or(z.literal('')),
  attendanceWebhookUrl: z.string().url('URL Webhook tidak valid.').optional().or(z.literal('')),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  csvMappings: z.object({
    nis: z.string().min(1, 'NIS mapping wajib.'),
    name: z.string().min(1, 'Nama mapping wajib.'),
    class: z.string().min(1, 'Kelas mapping wajib.'),
    nisn: z.string().optional(),
    gender: z.string().optional(),
    birthPlace: z.string().optional(),
    birthDate: z.string().optional(),
    address: z.string().optional(),
  }),
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
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [isTestingCsv, setIsTestingCsv] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);

  const schoolDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'schools', SCHOOL_DATA_ID) : null, [firestore]);
  const { data: schoolData, isLoading } = useDoc<School>(schoolDocRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isMaintenanceMode: false,
      studentDatabaseUrl: '',
      attendanceWebhookUrl: '',
      latitude: -5.4,
      longitude: 105.1,
      primaryColor: '221 83% 53%',
      accentColor: '262 83% 58%',
      csvMappings: {
        nis: 'NIS',
        name: 'NAMA',
        class: 'KELAS',
        nisn: 'NISN',
        gender: 'JK',
        birthPlace: 'TEMPAT LAHIR',
        birthDate: 'TANGGAL LAHIR',
        address: 'ALAMAT'
      },
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
        attendanceWebhookUrl: schoolData.attendanceWebhookUrl || '',
        latitude: schoolData.latitude || -5.4,
        longitude: schoolData.longitude || 105.1,
        primaryColor: schoolData.primaryColor || '221 83% 53%',
        accentColor: schoolData.accentColor || '262 83% 58%',
        csvMappings: {
            ...form.getValues('csvMappings'),
            ...schoolData.csvMappings
        },
        layoutSettings: {
            ...form.getValues('layoutSettings'),
            ...schoolData.layoutSettings
        }
      });
    }
  }, [schoolData, form]);

  const testCsvConnection = async () => {
    const url = form.getValues('studentDatabaseUrl');
    if (!url) return;

    setIsTestingCsv(true);
    setCsvError(null);
    try {
      const response = await fetch(url);
      const text = await response.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      setCsvHeaders(headers);
      
      const data = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        return headers.reduce((obj: any, header, i) => {
          obj[header] = values[i];
          return obj;
        }, {});
      });

      setCsvPreview(data);
      toast({ title: 'Koneksi Berhasil', description: 'Data CSV terbaca dengan benar.' });
    } catch (e) {
      setCsvError("Gagal mengambil data. Pastikan link CSV dipublikasikan ke web.");
      toast({ variant: 'destructive', title: 'Koneksi Gagal', description: 'Periksa kembali URL database Anda.' });
    } finally {
      setIsTestingCsv(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !schoolDocRef) return;
    setDocumentNonBlocking(schoolDocRef, values, { merge: true });
    toast({ title: 'Konfigurasi Disimpan', description: 'Pengaturan sistem telah diperbarui.' });
  }

  if (isLoading) return <div className="flex justify-center py-20"><LoaderCircle className="animate-spin text-primary h-8 w-8" /></div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <Alert className="bg-primary/5 border-primary/20">
        <ShieldAlert className="h-4 w-4 text-primary" />
        <AlertTitle className='font-bold text-xs'>Kustomisasi Identitas & Data</AlertTitle>
        <AlertDescription className='text-xs font-medium'>
          Atur identitas visual, lokasi geofencing absensi, dan integrasi data profil siswa sekolah Anda.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-8">
            
            <div className="space-y-8">
              <Card className="shadow-2xl border-none rounded-[2rem]">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className='p-2 bg-blue-500/10 text-blue-500 rounded-xl'><Database size={20} /></div>
                    <CardTitle className='text-xl font-headline font-bold italic'>Integrasi Database Siswa</CardTitle>
                  </div>
                  <CardDescription>Hubungkan Google Sheets (CSV) untuk sinkronisasi profil otomatis.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="studentDatabaseUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Link CSV Database</FormLabel>
                        <div className="flex gap-2">
                          <FormControl><Input {...field} placeholder="https://docs.google.com/spreadsheets/.../pub?output=csv" className='h-12 rounded-xl'/></FormControl>
                          <Button type="button" onClick={testCsvConnection} variant="outline" className="h-12 rounded-xl px-6" disabled={isTestingCsv}>
                            {isTestingCsv ? <LoaderCircle className='animate-spin' /> : <Search size={18} />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {csvPreview.length > 0 && (
                    <div className="mt-4 space-y-6 animate-reveal">
                      <div className='bg-primary/5 p-6 rounded-2xl border border-primary/10'>
                        <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2 mb-4">
                          <Settings2 size={12} /> Pemetaan Kolom CSV
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { name: 'nis', label: 'Kolom NIS (ID)' },
                            { name: 'name', label: 'Kolom Nama' },
                            { name: 'class', label: 'Kolom Kelas' },
                            { name: 'nisn', label: 'Kolom NISN' },
                            { name: 'gender', label: 'Kolom Jenis Kelamin' },
                            { name: 'birthPlace', label: 'Kolom Tempat Lahir' },
                            { name: 'birthDate', label: 'Kolom Tgl Lahir' },
                            { name: 'address', label: 'Kolom Alamat' },
                          ].map(mapping => (
                            <FormField
                              key={mapping.name}
                              control={form.control}
                              name={`csvMappings.${mapping.name}` as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[9px] font-bold uppercase opacity-60">{mapping.label}</FormLabel>
                                  <FormControl><Input {...field} className='h-9 text-xs rounded-lg' placeholder="Nama Header CSV" /></FormControl>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2">
                            <CheckCircle2 size={12} /> Preview Data Terbaca
                          </h4>
                          <Button variant="ghost" size="sm" onClick={() => setCsvPreview([])} className="h-6 text-[9px] font-bold uppercase">Tutup Preview</Button>
                        </div>
                        <div className="rounded-xl border overflow-hidden bg-muted/20">
                          <Table>
                            <TableHeader>
                              <TableRow className="h-8">
                                {csvHeaders.slice(0, 4).map(h => (
                                  <TableHead key={h} className="text-[9px] font-black px-3">{h}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {csvPreview.map((row, i) => (
                                <TableRow key={i} className="h-8">
                                  {csvHeaders.slice(0, 4).map(h => (
                                    <TableCell key={h} className="text-[10px] px-3 truncate max-w-[100px]">{row[h] || '-'}</TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  )}

                  {csvError && (
                    <Alert variant="destructive" className="rounded-xl p-3 bg-destructive/5">
                      <XCircle size={14} className="mt-0.5" />
                      <AlertDescription className="text-[10px] font-medium">{csvError}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-2xl border-none rounded-[2rem]">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className='p-2 bg-amber-500/10 text-amber-500 rounded-xl'><LinkIcon size={20} /></div>
                    <CardTitle className='text-xl font-headline font-bold italic'>Rekap Absensi (Google Sheets)</CardTitle>
                  </div>
                  <CardDescription>URL Webhook untuk mengirim data absensi ke spreadsheet eksternal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="attendanceWebhookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Google Apps Script URL</FormLabel>
                        <FormControl><Input {...field} placeholder="https://script.google.com/macros/s/.../exec" className='h-12 rounded-xl'/></FormControl>
                        <FormDescription className="text-[10px]">Data absensi harian akan langsung masuk ke Google Sheet Anda.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-2xl border-none rounded-[2rem]">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className='p-2 bg-emerald-500/10 text-emerald-500 rounded-xl'><MapPin size={20} /></div>
                    <CardTitle className='text-xl font-headline font-bold italic'>Geofencing Absensi</CardTitle>
                  </div>
                  <CardDescription>Titik koordinat pusat sekolah untuk validasi absensi (radius 30m).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Latitude</FormLabel>
                          <FormControl><Input {...field} type="number" step="any" placeholder="-5.4000" className='h-12 rounded-xl'/></FormItem>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Longitude</FormLabel>
                          <FormControl><Input {...field} type="number" step="any" placeholder="105.1000" className='h-12 rounded-xl'/></FormItem>
                        </FormItem>
                      )}
                    />
                  </div>
                  <p className='text-[10px] text-muted-foreground font-medium italic'>*Siswa wajib berada dalam jarak 30 meter dari titik ini untuk melakukan absensi biometrik.</p>
                </CardContent>
              </Card>

              <Card className="shadow-2xl border-none rounded-[2rem]">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className='p-2 bg-primary/10 text-primary rounded-xl'><Palette size={20} /></div>
                    <CardTitle className='text-xl font-headline font-bold italic'>Branding & Warna</CardTitle>
                  </div>
                  <CardDescription>Ubah skema warna global website (format HSL).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className='grid grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Warna Utama</FormLabel>
                          <FormControl><Input {...field} placeholder="e.g. 221 83% 53%" className='h-12 rounded-xl'/></FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accentColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Warna Aksen</FormLabel>
                          <FormControl><Input {...field} placeholder="e.g. 262 83% 58%" className='h-12 rounded-xl'/></FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-2xl border-none rounded-[2rem] bg-muted/20">
                <CardContent className='pt-6'>
                  <FormField
                    control={form.control}
                    name="isMaintenanceMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-2xl border p-5 shadow-sm bg-card">
                        <div className="space-y-0.5">
                          <FormLabel className='font-bold text-xs'>Mode Pemeliharaan</FormLabel>
                          <FormDescription className="text-[10px]">Kunci akses publik sementara untuk perbaikan.</FormDescription>
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

            <Card className="shadow-2xl border-none rounded-[2.5rem]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className='p-2 bg-primary/10 text-primary rounded-xl'><Layout size={20} /></div>
                  <CardTitle className='text-xl font-headline font-bold italic'>Tata Letak Beranda</CardTitle>
                </div>
                <CardDescription>Kontrol visibilitas bagian-bagian di halaman depan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {[
                    { name: 'showHero', label: 'Impact Hero Banner', desc: 'Banner utama di bagian atas' },
                    { name: 'showPartners', label: 'Industry Slider', desc: 'Logo mitra industri' },
                    { name: 'showStats', label: 'School Statistics', desc: 'Pencapaian angka sekolah' },
                    { name: 'showMajors', label: 'Academic Programs', desc: 'Blok informasi jurusan' },
                    { name: 'showNews', label: 'Activity Updates', desc: 'Berita dan pengumuman' },
                    { name: 'showShowcase', label: 'Student Portfolio', desc: 'Karya inovasi siswa' },
                    { name: 'showCta', label: 'Call to Action', desc: 'Banner pendaftaran siswa baru' },
                  ].map((item) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={`layoutSettings.${item.name}` as any}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 hover:bg-muted/10 transition-colors">
                          <div className="space-y-0.5">
                            <FormLabel className="text-xs font-bold">{item.label}</FormLabel>
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
            <Button type="submit" size="lg" className="font-bold px-12 h-16 rounded-3xl shadow-3xl glow-primary hover:scale-[1.02] transition-all">
              {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />}
              Simpan Semua Perubahan
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
