
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { LoaderCircle, Search, UserCheck, XCircle, Clock, Sparkles } from 'lucide-react';
import { SCHOOL_DATA_ID, type StudentApplication } from '@/lib/data';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  phone: z.string().min(10, "Nomor WhatsApp minimal 10 digit.").regex(/^\d+$/, "Hanya masukkan angka."),
});

/**
 * Modul Cek Status Pendaftaran PPDB.
 * Memungkinkan calon siswa mengecek status pendaftaran menggunakan nomor WA.
 */
export default function PpdbStatusCheckSection() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<StudentApplication | 'not_found' | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { phone: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;
    
    setIsLoading(true);
    setResult(null);

    try {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/studentApplications`);
      const q = query(ref, where('parentPhone', '==', values.phone), limit(1));
      const snap = await getDocs(q);

      if (snap.empty) {
        setResult('not_found');
      } else {
        setResult(snap.docs[0].data() as StudentApplication);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal mencari data. Coba lagi nanti.' });
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusInfo = (status: StudentApplication['status']) => {
    switch(status) {
        case 'DITERIMA': return { icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
        case 'DITOLAK': return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
        case 'CADANGAN': return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
        default: return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    }
  };

  return (
    <section className="py-24 max-w-4xl mx-auto px-6 animate-reveal flex flex-col items-center justify-center text-center min-h-[70vh]">
      <div className='mb-12 space-y-4'>
        <div className='inline-flex items-center gap-3 px-4 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary shadow-xl'>
            <Search size={14} />
            <span className='text-[9px] font-black uppercase tracking-[0.3em]'>PPDB Transparency Portal</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter uppercase italic">Cek Status <span className='text-primary not-italic'>Pendaftaran.</span></h2>
        <p className="text-muted-foreground text-sm font-medium max-w-xl mx-auto uppercase tracking-widest leading-relaxed">
            Gunakan Nomor WhatsApp Orang Tua yang terdaftar untuk melacak status seleksi calon siswa baru.
        </p>
      </div>

      <Card className="w-full max-w-lg glass-premium border-white/5 rounded-[2.5rem] p-8 shadow-3xl">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60 text-left block ml-2">No. WhatsApp Terdaftar</FormLabel>
                        <FormControl>
                            <Input placeholder="Contoh: 081234567890" {...field} className="text-center text-lg h-14 rounded-2xl bg-white/5 border-white/10" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" size="lg" className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.3em] shadow-3xl glow-primary" disabled={isLoading}>
                    {isLoading ? <LoaderCircle className="animate-spin mr-2" /> : <Search className='mr-2' />}
                    LACAK SEKARANG
                </Button>
            </form>
        </Form>
      </Card>

      {result === 'not_found' && (
        <div className="mt-12 p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 animate-reveal w-full max-w-lg">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-black uppercase tracking-tighter">Data Tidak Ditemukan</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-80">Pastikan nomor WhatsApp yang dimasukkan sudah benar dan sesuai saat mendaftar.</p>
        </div>
      )}

      {result && result !== 'not_found' && (
        <div className="mt-12 w-full max-w-lg animate-reveal">
            {(() => {
                const info = getStatusInfo(result.status);
                const Icon = info.icon;
                return (
                    <Card className={cn("rounded-[3rem] shadow-3xl overflow-hidden border-2", info.border, info.bg)}>
                        <div className="p-10 space-y-6">
                            <div className={cn("w-20 h-20 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl", info.bg, info.color)}>
                                <Icon size={40} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Identitas Calon Siswa</p>
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter font-headline">{result.studentName}</h3>
                                <div className='flex items-center justify-center gap-2 mt-2'>
                                    <Badge variant="outline" className="text-[9px] font-black uppercase px-3 py-1 border-white/10">{result.chosenMajor}</Badge>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-white/10 space-y-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Status Seleksi Saat Ini:</p>
                                <div className={cn("text-4xl font-black italic uppercase tracking-tighter font-headline", info.color)}>
                                    {result.status}
                                </div>
                                <p className="text-[9px] font-medium leading-loose opacity-60 uppercase tracking-[0.2em]">
                                    {result.status === 'DITERIMA' ? 'Selamat! Silakan lakukan pendaftaran ulang di sekolah.' : 
                                     result.status === 'PENDING' ? 'Mohon bersabar, berkas Anda sedang diverifikasi tim panitia.' : 
                                     'Tetap semangat! Hubungi panitia untuk informasi lebih lanjut.'}
                                </p>
                            </div>
                        </div>
                    </Card>
                )
            })()}
        </div>
      )}
    </section>
  );
}
