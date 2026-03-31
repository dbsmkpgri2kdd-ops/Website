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
import { LoaderCircle, Save, ShieldAlert, Layout, Database, Settings2, MapPin, Link as LinkIcon, Search, CheckCircle2, XCircle } from 'lucide-react';
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
    session: z.string().min(1, 'Sesi mapping wajib.'),
    address: z.string().optional(),
    phone: z.string().optional(),
    parentName: z.string().optional(),
    parentPhone: z.string().optional(),
    bkTeacher: z.string().optional(),
    homeroomTeacher: z.string().optional(),
    guardianTeacher: z.string().optional(),
    studentAffairs: z.string().optional(),
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
      csvMappings: {
        nis: 'NIS',
        name: 'Nama',
        class: 'Kelas',
        session: 'Sesi',
        address: 'Alamat',
        phone: 'No HP',
        parentName: 'Orang Tua',
        parentPhone: 'HP Orang Tua',
        bkTeacher: 'Guru BK',
        homeroomTeacher: 'Wali Kelas',
        guardianTeacher: 'Guru Wali',
        studentAffairs: 'Kesiswaan'
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
        primaryColor: schoolData.primaryColor || '221.2 83.2% 53.3%',
        accentColor: schoolData.accentColor || '47.9 95.8% 53.1%',
        csvMappings: {
            ...form.getValues('csvMappings'),
            ...(schoolData.csvMappings as any)
        },
        layoutSettings: {
            ...form.getValues('layoutSettings'),
            ...(schoolData.layoutSettings as any)
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
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length === 0) throw new Error("File kosong");
      
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !schoolDocRef) return;
    setDocumentNonBlocking(schoolDocRef, values, { merge: true });
    toast({ title: 'Konfigurasi Disimpan', description: 'Pengaturan sistem telah diperbarui.' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoaderCircle className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-reveal pb-20">
      <Alert className="bg-primary/5 border-primary/20">
        <ShieldAlert className="h-4 w-4 text-primary" />
        <AlertTitle className='font-bold text-xs uppercase tracking-widest text-slate-900'>Kustomisasi Identitas & Data</AlertTitle>
        <AlertDescription className='text-[11px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed mt-1'>
          Atur identitas visual, lokasi geofencing absensi, dan integrasi data profil siswa sekolah Anda secara real-time.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-8">
            
            <div className="space-y-8">
              <Card className="shadow-2xl border-slate-100 rounded-[3rem] bg-white overflow-hidden">
                <CardHeader className='p-8 border-b border-slate-100'>
                  <div className="flex items-center gap-3">
                    <div className='p-2.5 bg-primary text-white rounded-2xl shadow-xl glow-primary'><Database size={20} /></div>
                    <CardTitle className='text-xl font-headline font-black uppercase italic tracking-tighter text-slate-900'>Database Siswa</CardTitle>
                  </div>
                  <CardDescription className='text-[10px] font-bold uppercase tracking-widest mt-1'>Sinkronisasi profil otomatis via Google Sheets.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <FormField
                    control={form.control}
                    name="studentDatabaseUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Link CSV Database</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} placeholder="https://docs.google.com/spreadsheets/.../pub?output=csv" className='h-12 rounded-xl bg-slate-50 border-slate-100 focus:border-primary'/>
                          </FormControl>
                          <Button type="button" onClick={testCsvConnection} variant="outline" className="h-12 rounded-xl px-6 border-slate-200" disabled={isTestingCsv}>
                            {isTestingCsv ? <LoaderCircle className='animate-spin' /> : <Search size={18} />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {csvPreview.length > 0 && (
                    <div className="mt-4 space-y-6 animate-reveal">
                      <div className='bg-primary/5 p-6 rounded-[2rem] border border-primary/10'>
                        <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-2 mb-6">
                          <Settings2 size={12} /> Pemetaan Kolom CSV
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { name: 'nis', label: 'Kolom NIS' },
                            { name: 'name', label: 'Kolom Nama' },
                            { name: 'class', label: 'Kolom Kelas' },
                            { name: 'session', label: 'Kolom Sesi' },
                            { name: 'address', label: 'Kolom Alamat' },
                            { name: 'phone', label: 'Kolom No HP' },
                            { name: 'parentName', label: 'Kolom Orang Tua' },
                            { name: 'parentPhone', label: 'Kolom HP Ortu' },
                            { name: 'bkTeacher', label: 'Kolom Guru BK' },
                            { name: 'homeroomTeacher', label: 'Kolom Wali Kelas' },
                            { name: 'guardianTeacher', label: 'Kolom Guru Wali' },
                            { name: 'studentAffairs', label: 'Kolom Kesiswaan' },
                          ].map((mapping) => (
                            <FormField
                              key={mapping.name}
                              control={form.control}
                              name={`csvMappings.${mapping.name}` as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[9px] font-black uppercase text-slate-400">{mapping.label}</FormLabel>
                                  <FormControl><Input {...field} className='h-9 text-[10px] font-bold rounded-lg bg-white border-slate-100' placeholder="Nama Header CSV" /></FormControl>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-2">
                            <CheckCircle2 size={12} /> Preview Data Terbaca
                          </h4>
                          <Button variant="ghost" size="sm" onClick={() => setCsvPreview([])} className="h-6 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary">Tutup Preview</Button>
                        </div>
                        <div className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/50 shadow-inner">
                          <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                <TableRow className="h-10 border-slate-100 bg-slate-100/50">
                                    {csvHeaders.slice(0, 6).map(h => (
                                    <TableHead key={h} className="text-[9px] font-black px-4 uppercase text-slate-500">{h}</TableHead>
                                    ))}
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {csvPreview.map((row, i) => (
                                    <TableRow key={i} className="h-10 border-slate-100">
                                    {csvHeaders.slice(0, 6).map(h => (
                                        <TableCell key={h} className="text-[10px] font-bold px-4 truncate max-w-[120px] text-slate-600">{row[h] || '-'}</TableCell>
                                    ))}
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {csvError && (
                    <Alert variant="destructive" className="rounded-2xl p-4 bg-destructive/5 border-destructive/20">
                      <XCircle size={16} className="mt-0.5" />
                      <AlertDescription className="text-[10px] font-black uppercase tracking-widest">{csvError}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-2xl border-slate-100 rounded-[3rem] bg-white overflow-hidden">
                <CardHeader className='p-8 border-b border-slate-100'>
                  <div className="flex items-center gap-3">
                    <div className='p-2.5 bg-accent text-accent-foreground rounded-2xl shadow-xl glow-accent'><LinkIcon size={20} /></div>
                    <CardTitle className='text-xl font-headline font-black uppercase italic tracking-tighter text-slate-900'>Rekap Absensi</CardTitle>
                  </div>
                  <CardDescription className='text-[10px] font-bold uppercase tracking-widest mt-1'>Koneksi Webhook Google Apps Script.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <FormField
                    control={form.control}
                    name="attendanceWebhookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Google Apps Script URL</FormLabel>
                        <FormControl><Input {...field} placeholder="https://script.google.com/macros/s/.../exec" className='h-12 rounded-xl bg-slate-50 border-slate-100'/></FormControl>
                        <FormDescription className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2">Seluruh data absensi harian akan dikirim secara real-time ke spreadsheet eksternal Anda.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-2xl border-slate-100 rounded-[3rem] bg-white overflow-hidden">
                <CardHeader className='p-8 border-b border-slate-100'>
                  <div className="flex items-center gap-3">
                    <div className='p-2.5 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20'><MapPin size={20} /></div>
                    <CardTitle className='text-xl font-headline font-black uppercase italic tracking-tighter text-slate-900'>Geofencing</CardTitle>
                  </div>
                  <CardDescription className='text-[10px] font-bold uppercase tracking-widest mt-1'>Validasi lokasi absensi berbasis radius.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Latitude</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="any" placeholder="-5.4000" className='h-12 rounded-xl bg-slate-50 border-slate-100 font-mono'/>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Longitude</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="any" placeholder="105.1000" className='h-12 rounded-xl bg-slate-50 border-slate-100 font-mono'/>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className='flex gap-3 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10'>
                    <ShieldAlert size={16} className='text-amber-600 shrink-0 mt-0.5' />
                    <p className='text-[9px] text-amber-700 font-bold uppercase tracking-widest leading-relaxed'>Siswa wajib berada dalam radius 30 meter dari titik ini untuk melakukan absensi biometrik secara valid.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-2xl border-slate-100 rounded-[3rem] bg-white overflow-hidden h-fit sticky top-24">
              <CardHeader className='p-8 border-b border-slate-100'>
                <div className="flex items-center gap-3">
                  <div className='p-2.5 bg-primary text-white rounded-2xl shadow-xl glow-primary'><Layout size={20} /></div>
                  <CardTitle className='text-xl font-headline font-black uppercase italic tracking-tighter text-slate-900'>Layout Beranda</CardTitle>
                </div>
                <CardDescription className='text-[10px] font-bold uppercase tracking-widest mt-1'>Kontrol visibilitas modul halaman depan.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <div className="grid gap-3">
                  {[
                    { name: 'showHero', label: 'Impact Hero Banner', desc: 'Banner utama visual atas' },
                    { name: 'showPartners', label: 'Industry Slider', desc: 'Logo mitra industri strategis' },
                    { name: 'showStats', label: 'School Statistics', desc: 'Pencapaian angka sekolah' },
                    { name: 'showMajors', label: 'Academic Programs', desc: 'Blok informasi jurusan' },
                    { name: 'showNews', label: 'Activity Updates', desc: 'Berita dan pengumuman resmi' },
                    { name: 'showShowcase', label: 'Student Portfolio', desc: 'Pameran karya inovasi siswa' },
                    { name: 'showCta', label: 'Call to Action', desc: 'Banner pendaftaran siswa baru' },
                  ].map((item) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={`layoutSettings.${item.name}` as any}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-100 p-5 hover:bg-slate-50 transition-all group">
                          <div className="space-y-0.5">
                            <FormLabel className="text-xs font-black uppercase tracking-tight text-slate-900 group-hover:text-primary transition-colors">{item.label}</FormLabel>
                            <FormDescription className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</FormDescription>
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
            <Button type="submit" size="lg" className="font-black px-12 h-16 rounded-[2rem] shadow-3xl glow-primary hover:scale-[1.05] transition-all uppercase tracking-widest bg-accent text-accent-foreground border-none">
              {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-3 h-5 w-5" /> : <Save className="mr-3 h-5 w-5" />}
              Simpan Konfigurasi Sistem
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
