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
import { addDocumentNonBlocking, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { SCHOOL_DATA_ID, type Major } from "@/lib/data";


const formSchema = z.object({
  studentName: z.string().min(2, "Nama harus diisi, minimal 2 karakter."),
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
    toast({
      title: "Pendaftaran Diproses",
      description: "Data Anda sedang dikirim.",
    });

    const applicationsRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/studentApplications`);
    
    addDocumentNonBlocking(applicationsRef, {
      schoolId: SCHOOL_DATA_ID,
      studentName: values.studentName,
      chosenMajor: values.chosenMajor,
      parentPhone: values.parentPhone,
      submissionDate: serverTimestamp()
    });

    setIsSubmitted(true);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h3 className="text-2xl font-bold font-headline">Formulir Pendaftaran</h3>
        <FormField
          control={form.control}
          name="studentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Calon Siswa</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Budi Santoso" {...field} />
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
              <FormLabel>Pilihan Jurusan</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={areMajorsLoading || !majors}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={areMajorsLoading ? "Memuat jurusan..." : "Pilih jurusan yang diminati"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {majors?.map((major) => (
                    <SelectItem key={major.id} value={major.name}>{major.name}</SelectItem>
                  ))}
                  {!areMajorsLoading && majors?.length === 0 && (
                    <SelectItem value="not-available" disabled>Admin belum menambahkan jurusan</SelectItem>
                  )}
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
              <FormLabel>Nomor WhatsApp Orang Tua</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Contoh: 081234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full font-bold" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Mengirim..." : "Kirim Pendaftaran"}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Data Anda aman dan hanya digunakan untuk keperluan pendaftaran.
        </p>
      </form>
    </Form>
  );
}
