'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { LoaderCircle, Search, XCircle, Clock, Sparkles, Phone, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SCHOOL_DATA_ID, type StudentApplication } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  phone: z.string().min(10, "Nomor WhatsApp minimal 10 digit.").regex(/^\d+$/, "Hanya masukkan angka."),
});

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
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Database offline', description: 'Sinkronisasi cloud sedang berlangsung.' });
        return;
    }
    
    setIsLoading(true);
    setResult(null);

    try {
      const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/studentApplications`);
      const q = query(ref, where('parentPhone', '==', values.phone), limit(1));
      const snap = await getDocs(q);

      if (snap.empty) {
        setResult('not_found');
      } else {
        setResult({ ...snap.docs[0].data(), id: snap.docs[0].id } as StudentApplication);
      }
    } catch (error) {
      console.error("PPDB Check Error:", error);
      toast({ variant: 'destructive', title: 'Kesalahan sistem', description: 'Gagal memuat status pendaftaran.' });
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusConfig = (status: StudentApplication['status']) => {
    switch(status) {
        case 'DITERIMA': return { 
            icon: CheckCircle2, 
            color: 'text-emerald-500', 
            bg: 'bg-emerald-500/10', 
            border: 'border-emerald-500/20',
            label: 'Selamat! Anda lolos seleksi',
            desc: 'Silakan segera datang ke sekolah untuk melakukan verifikasi berkas asli dan proses daftar ulang administratif.'
        };
        case 'DITOLAK': return { 
            icon: XCircle, 
            color: 'text-red-500', 
            bg: 'bg-red-500/10', 
            border: 'border-red-500/20',
            label: 'Belum berhasil lolos',
            desc: 'Terima kasih atas minat Anda. Tetap semangat dan jangan menyerah, masih banyak jalan menuju kesuksesan.'
        };
        case 'CADANGAN': return { 
            icon: Clock, 
            color: 'text-amber-500', 
            bg: 'bg-amber-500/10', 
            border: 'border-amber-500/20',
            label: 'Status: Daftar cadangan',
            desc: 'Nama Anda masuk dalam antrean cadangan. Kami akan menghubungi jika terdapat kuota tambahan yang tersedia.'
        };
        default: return { 
            icon: Clock, 
            color: 'text-blue-500', 
            bg: 'bg-blue-500/10', 
            border: 'border-blue-500/20',
            label: 'Dalam proses verifikasi',
            desc: 'Data Anda telah diterima. Tim panitia sedang melakukan pengecekan berkas dan validasi data secara menyeluruh.'
        };
    }
  };

  return (
    <section className="py-24 max-w-4xl mx-auto px-6 animate-reveal flex flex-col items-center justify-center min-h-[80vh]">
      <div className='mb-12 space-y-4 text-center'>
        <div className='inline-flex items-center gap-3 px-4 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary shadow-xl'>
            <ShieldCheck size={14} className='animate-pulse' />
            <span className='text-[9px] font-black uppercase tracking-[0.3em]'>Secure admission portal</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-foreground leading-none">Lacak pendaftaran</h2>
        <p className="text-muted-foreground text-sm font-medium max-w-xl mx-auto leading-relaxed opacity-60">
            Gunakan nomor WhatsApp orang tua yang terdaftar untuk memantau progres seleksi calon siswa baru secara real-time.
        </p>
      </div>

      <Card className="w-full max-w-lg glass-premium border-white/5 rounded-[3rem] p-1 shadow-3xl overflow-hidden">
        <CardContent className="p-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">WhatsApp orang tua</FormLabel>
                            <FormControl>
                                <div className='relative'>
                                    <Input placeholder="0812XXXXXXXX" {...field} className="text-center text-lg h-16 rounded-[1.5rem] bg-white/5 border-white/10 font-bold tracking-widest pr-12" />
                                    <Phone className='absolute right-5 top-5 text-muted-foreground opacity-20' size={24} />
                                </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" size="lg" className="w-full h-16 rounded-[1.5rem] font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all" disabled={isLoading}>
                        {isLoading ? <LoaderCircle className="animate-spin mr-2" /> : <Search className='mr-3' />}
                        Lihat hasil seleksi
                    </Button>
                </form>
            </Form>
        </CardContent>
      </Card>

      {result === 'not_found' && (
        <div className="mt-12 p-10 rounded-[2.5rem] bg-red-500/5 border-2 border-dashed border-red-500/20 text-red-500 animate-reveal w-full max-w-lg text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-bold">Data tidak ditemukan</h3>
            <p className="text-xs font-medium mt-2 opacity-60 leading-relaxed">
                Nomor tersebut tidak ditemukan dalam sistem kami. Pastikan nomor yang diinput sesuai saat melakukan pendaftaran online.
            </p>
        </div>
      )}

      {result && result !== 'not_found' && (
        <div className="mt-12 w-full max-w-xl animate-reveal">
            {(() => {
                const config = getStatusConfig(result.status);
                const StatusIcon = config.icon;
                return (
                    <Card className={cn("rounded-[3rem] shadow-3xl overflow-hidden border-2 transition-all duration-1000", config.border, config.bg)}>
                        <div className="p-10 space-y-8">
                            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                                <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl shrink-0", config.bg, config.color)}>
                                    <StatusIcon size={40} className='animate-pulse' />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-40">Calon siswa terdaftar</p>
                                    <h3 className="text-3xl font-black uppercase tracking-tighter font-headline leading-none">{result.studentName}</h3>
                                    <Badge variant="outline" className="text-[9px] font-bold px-3 py-1 border-white/10 mt-2">{result.chosenMajor}</Badge>
                                </div>
                            </div>
                            
                            <div className="pt-8 border-t border-white/10 space-y-6">
                                <div className='space-y-2'>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-center">Keputusan panitia seleksi:</p>
                                    <div className={cn("text-5xl font-black uppercase tracking-tighter font-headline text-center drop-shadow-2xl", config.color)}>
                                        {result.status}
                                    </div>
                                </div>

                                <div className='bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-3'>
                                    <div className='flex items-center gap-2 text-primary'>
                                        <Sparkles size={14} />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">{config.label}</p>
                                    </div>
                                    <p className="text-xs font-medium leading-relaxed opacity-80">
                                        {config.desc}
                                    </p>
                                </div>

                                <div className='flex justify-center'>
                                    <Button variant="link" className='text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors'>
                                        Hubungi panitia PPDB <ArrowRight size={12} className='ml-2' />
                                    </Button>
                                </div>
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
