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
import { LoaderCircle, Search, BadgeCheck, XCircle, FileQuestion } from 'lucide-react';
import { SCHOOL_DATA_ID, type GraduationStatus } from '@/lib/data';
import { Badge } from '../ui/badge';

const formSchema = z.object({
  identifier: z.string().min(5, "Nomor identitas minimal 5 karakter."),
});

const CheckGraduationSection = () => {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<GraduationStatus | 'not_found' | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { identifier: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal terhubung ke server.' });
      return;
    }
    
    setIsLoading(true);
    setSearchResult(null);

    try {
      const statusRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/graduationStatuses`);
      const q = query(statusRef, where('studentIdentifier', '==', values.identifier), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setSearchResult('not_found');
      } else {
        const docData = querySnapshot.docs[0].data() as GraduationStatus;
        setSearchResult(docData);
      }
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Terjadi kesalahan saat mencari data.' });
    } finally {
      setIsLoading(false);
    }
  }

  const ResultCard = () => {
    if (isLoading) {
      return (
        <Card className="w-full max-w-lg mt-8 text-center p-8 animate-pulse">
            <LoaderCircle className="h-12 w-12 mx-auto text-primary/50 animate-spin" />
        </Card>
      )
    }

    if (!searchResult) return null;

    if (searchResult === 'not_found') {
        return (
            <Card className="w-full max-w-lg mt-8 text-center p-8 bg-destructive/10 border-destructive animate-fade-in">
                <XCircle className="h-12 w-12 mx-auto text-destructive mb-4"/>
                <h3 className="text-xl font-bold text-destructive">Data Tidak Ditemukan</h3>
                <p className="text-destructive/80">Pastikan nomor identitas yang Anda masukkan sudah benar.</p>
            </Card>
        )
    }
    
    const isLulus = searchResult.status === 'LULUS';

    return (
        <Card className={`w-full max-w-lg mt-8 text-center p-8 animate-fade-in ${isLulus ? 'bg-primary/10 border-primary' : 'bg-yellow-500/10 border-yellow-500'}`}>
            {isLulus ? (
                <BadgeCheck className="h-12 w-12 mx-auto text-primary mb-4" />
            ) : (
                <FileQuestion className="h-12 w-12 mx-auto text-yellow-600 mb-4" />
            )}
            <CardHeader className="p-0">
                <CardTitle className="text-2xl font-bold font-headline">{searchResult.studentName}</CardTitle>
                <CardDescription>Nomor Induk: {searchResult.studentIdentifier}</CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4">
                 <p className="text-lg">Dinyatakan:</p>
                 <Badge variant={isLulus ? 'default' : 'secondary'} className="text-2xl font-bold px-6 py-2 mt-1">{searchResult.status}</Badge>
                 {searchResult.notes && <p className="text-sm mt-4 text-muted-foreground italic">"{searchResult.notes}"</p>}
            </CardContent>
        </Card>
    )
  }

  return (
    <section className="py-16 max-w-4xl mx-auto px-6 animate-fade-in flex flex-col items-center justify-center text-center min-h-[70vh]">
      <h2 className="text-4xl font-bold font-headline text-primary">Cek Status Kelulusan</h2>
      <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
        Masukkan Nomor Induk Siswa Nasional (NISN) atau nomor pendaftaran Anda untuk melihat status kelulusan.
      </p>

      <Card className="w-full max-w-lg mt-8 p-8">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="sr-only">Nomor Identitas</FormLabel>
                        <FormControl>
                            <Input placeholder="Masukkan NISN atau No. Pendaftaran..." {...field} className="text-center text-lg h-12"/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? <LoaderCircle className="animate-spin" /> : <Search />}
                    Cari Status
                </Button>
            </form>
        </Form>
      </Card>

      <ResultCard />
    </section>
  );
};

export default CheckGraduationSection;
