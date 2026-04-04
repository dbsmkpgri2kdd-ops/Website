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
  attendanceRadius: z.coerce.number().min(1, 'Radius minimal 1 meter').max(1000, 'Radius maksimal 1000 meter').default(30),
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
    status: z.string().optional(),
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
      latitude: -5.4656994,
      longitude: 104.9996424,
      attendanceRadius: 30,
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
        latitude: schoolData.latitude || -5.4656994,
        longitude: schoolData.longitude || 104.9996424,
        attendanceRadius: schoolData.attendanceRadius || 30,
        primaryColor: schoolData.primaryColor || '221 100% 50%',
        accentColor: schoolData.accentColor || '45 100% 50%',
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
      const rows = text.split(/\r?\n/).filter(l => l.trim() !== '');
      if (rows.length < 2) throw new Error("File CSV kosong atau tidak valid.");
      
      const headers = rows[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      setCsvHeaders(headers);
      
      const data = rows.slice(1, 6).map(row => {
        const values = row.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        return headers.reduce((obj: any, header, i) => {
          obj[header] = values[i] || '';
          return obj;
        }, {});
      });

      setCsvPreview(data);
      toast({ title: 'Data Terbaca', description: 'Koneksi ke database CSV berhasil.' });
    } catch (e: any) {
      setCsvError(e.message || "Gagal mengambil data. Pastikan link CSV dipublikasikan ke web.");
      toast({ variant: 'destructive', title: 'Koneksi Gagal', description: 'Periksa URL Google Sheets Anda.' });
    } finally {
      setIsTestingCsv(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !schoolDocRef) return;
    setDocumentNonBlocking(schoolDocRef, values, { merge: true });
    toast({ title: 'Pengaturan Disimpan', description: 'Konfigurasi sistem telah diperbarui secara global.' });
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
        <AlertTitle className='font-bold text-xs uppercase tracking-widest text-slate-900'>Konfigurasi Sistem Utama</AlertTitle>
        <AlertDescription className='text-[11px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed mt-1'>
          Kelola integrasi database eksternal, radius absensi biometrik, dan visibilitas modul beranda.
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
                    <CardTitle className='text-xl font-headline font-black uppercase italic tracking-tighter text-slate-900'>Database Civitas</CardTitle>
                  </div>
                  <CardDescription className='text-[10px] font-bold uppercase tracking-widest mt-1'>Sinkronisasi profil siswa via Google Sheets.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <FormField
                    control={form.control}
                    name="studentDatabaseUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">URL CSV Google Sheets</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input {...field} placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv" className='h-12 rounded-xl bg-slate-50 border-slate-100 focus:border-primary'/>
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
                          <Settings2 size={12} /> Mapping Kolom CSV
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { name: 'nis', label: 'Nama Kolom NIS' },
                            { name: 'name', label: 'Nama Kolom Nama' },
                            { name: 'class', label: 'Nama Kolom Kelas' },
                            { name: 'session', label: 'Nama Kolom Sesi' },
                            { name: 'address', label: 'Alamat' },
                            { name: 'phone', label: 'No HP' },
                            { name: 'parentName', label: 'Nama Ortu' },
                            { name: 'parentPhone', label: 'HP Ortu' },
                            { name: 'bkTeacher', label: 'Guru BK' },
                            { name: 'homeroomTeacher', label: 'Wali Kelas' },
                            { name: 'guardianTeacher', label: 'Guru Wali' },
                            { name: 'studentAffairs', label: 'Kesiswaan' },
                          ].map((mapping) => (
                            <FormField
                              key={mapping.name}
                              control={form.control}
                              name={`csvMappings.${mapping.name}` as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[9px] font-black uppercase text-slate-400">{mapping.label}</FormLabel>
                                  <FormControl>
                                    <Input {...field} className='h-9 text-[10px] font-bold rounded-lg bg-white border-slate-100' placeholder="Header di CSV" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-2">
                            <CheckCircle2 size={12} /> Preview Data
                          </h4>
                          <Button variant="ghost" size="sm" onClick={() => setCsvPreview([])} className="h-6 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary">Tutup</Button>
                        </div>
                        <div className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/50 shadow-inner">
                          <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                <TableRow className="h-10 border-slate-100 bg-slate-100/50">
                                    {csvHeaders.slice(0, 4).map(h => (
                                    <TableHead key={h} className="text-[9px] font-black px-4 uppercase text-slate-500">{h}</TableHead>
                                    ))}
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {csvPreview.map((row, i) => (
                                    <TableRow key={i} className="h-10 border-slate-100">
                                    {csvHeaders.slice(0, 4).map(h => (
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
                    <div className='p-2.5 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20'><MapPin size={20} /></div>
                    <CardTitle className='text-xl font-headline font-black uppercase italic tracking-tighter text-slate-900'>Geofencing Absensi</CardTitle>
                  </div>
                  <CardDescription className='text-[10px] font-bold uppercase tracking-widest mt-1'>Titik pusat radius kehadiran.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Latitude</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="any" className='h-12 rounded-xl bg-slate-50 border-slate-100 font-mono'/>
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
                            <Input {...field} type="number" step="any" className='h-12 rounded-xl bg-slate-50 border-slate-100 font-mono'/>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="attendanceRadius"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Radius (Meter)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" max="1000" className='h-12 rounded-xl bg-slate-50 border-slate-100 font-mono'/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className='bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 flex gap-3'>
                    <ShieldAlert size={16} className='text-amber-600 shrink-0 mt-0.5' />
                    <p className='text-[9px] text-amber-700 font-bold uppercase tracking-widest leading-relaxed'>Absensi biometrik hanya dapat dilakukan jika siswa berada dalam radius maksimal {form.watch('attendanceRadius') || 30} meter dari koordinat ini.</p>
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
                <CardDescription className='text-[10px] font-bold uppercase tracking-widest mt-1'>Kontrol visibilitas bagian halaman depan.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <div className="grid gap-3">
                  {[
                    { name: 'showHero', label: 'Impact Hero Banner', desc: 'Area visual utama di bagian atas' },
                    { name: 'showPartners', label: 'Industry Slider', desc: 'Daftar logo mitra industri' },
                    { name: 'showStats', label: 'School Statistics', desc: 'Angka capaian dan statistik' },
                    { name: 'showMajors', label: 'Academic Programs', desc: 'Informasi jurusan unggulan' },
                    { name: 'showNews', label: 'Activity Updates', desc: 'Berita dan pengumuman terbaru' },
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
              Simpan Pengaturan Sistem
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}