
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { SCHOOL_DATA_ID, type Major } from "@/lib/data";
import { LoaderCircle } from "lucide-react";

const formSchema = z.object({
  studentName: z.string().min(2, "Nama harus diisi, minimal 2 karakter."),
  gender: z.string({ required_error: "Pilih jenis kelamin." }),
  birthDate: z.string().min(5, "Tempat & tanggal lahir harus diisi."),
  originSchool: z.string().min(3, "Sekolah asal harus diisi."),
  chosenMajor: z.string({ required_error: "Pilih jurusan yang diminati." }),
  parentPhone: z.string().min(10, "Nomor WhatsApp tidak valid.").regex(/^\d+$/, "Hanya masukkan angka."),
});

type PpdbFormProps = {
  setIsSubmitted: (isSubmitted: boolean) => void;
};

export default function PpdbForm({ setIsSubmitted }: PpdbFormProps) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const majorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const majorsRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/majors`);
    return query(majorsRef, orderBy('name'));
  }, [firestore]);

  const { data: majors, isLoading: areMajorsLoading } = useCollection<Major>(majorsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      parentPhone: "",
      birthDate: "",
      originSchool: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Tidak dapat terhubung ke database. Coba lagi nanti."
        });
        return;
    }

    const applicationsRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/studentApplications`);
    
    addDocumentNonBlocking(applicationsRef, {
      schoolId: SCHOOL_DATA_ID,
      ...values,
      status: 'PENDING',
      submissionDate: serverTimestamp()
    });

    toast({
      title: "Pendaftaran Dikirim",
      description: "Terima kasih, data Anda sedang kami proses.",
    });

    setIsSubmitted(true);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <h3 className="text-2xl font-black font-headline tracking-tighter uppercase italic text-primary">Formulir Pendaftaran</h3>
        
        <FormField
          control={form.control}
          name="studentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Nama Calon Siswa</FormLabel>
              <FormControl>
                <Input placeholder="Nama Lengkap Sesuai Ijazah" {...field} className="h-12 rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Jenis Kelamin</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                            <SelectItem value="Perempuan">Perempuan</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Tempat, Tgl Lahir</FormLabel>
                    <FormControl>
                        <Input placeholder="Jakarta, 01-01-2010" {...field} className="h-12 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <FormField
          control={form.control}
          name="originSchool"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Sekolah Asal (SMP/MTs)</FormLabel>
              <FormControl>
                <Input placeholder="Nama Sekolah Sebelumnya" {...field} className="h-12 rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chosenMajor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Pilihan Jurusan</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={areMajorsLoading || !majors}>
                <FormControl>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder={areMajorsLoading ? "Memuat jurusan..." : "Pilih kompetensi keahlian"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {majors?.map((major) => (
                    <SelectItem key={major.id} value={major.name}>{major.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">No. WhatsApp Orang Tua</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Contoh: 081234567890" {...field} className="h-12 rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full font-black text-xs h-14 rounded-2xl shadow-3xl glow-primary uppercase tracking-[0.3em] mt-4" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-2" /> : null}
          Kirim Pendaftaran
        </Button>
      </form>
    </Form>
  );
}
