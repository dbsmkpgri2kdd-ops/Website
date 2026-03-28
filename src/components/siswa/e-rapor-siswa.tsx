
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { BookMarked, Download, Printer, LoaderCircle } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type ERapor, type Grade } from '@/lib/data';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

/**
 * Komponen E-Rapor Digital untuk Siswa.
 * Memungkinkan siswa melihat nilai per semester dan mencetaknya.
 */
export function ERaporSiswa() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedRaporId, setSelectedRaporId] = useState<string>('');

  // Ambil daftar rapor yang tersedia untuk siswa ini
  const raportsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, `schools/${SCHOOL_DATA_ID}/eRapors`),
      where('studentId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: rapors, isLoading: areRaporsLoading } = useCollection<ERapor>(raportsQuery);

  // Ambil nilai (grades) untuk rapor yang dipilih
  const gradesQuery = useMemoFirebase(() => {
    if (!firestore || !selectedRaporId) return null;
    return collection(firestore, `schools/${SCHOOL_DATA_ID}/eRapors/${selectedRaporId}/grades`);
  }, [firestore, selectedRaporId]);
  
  const { data: grades, isLoading: areGradesLoading } = useCollection<Grade>(gradesQuery);

  useEffect(() => {
    if (rapors && rapors.length > 0 && !selectedRaporId) {
      setSelectedRaporId(rapors[0].id);
    }
  }, [rapors, selectedRaporId]);

  const selectedRapor = rapors?.find(r => r.id === selectedRaporId);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
        window.print();
    }
  }

  return (
    <Card className="shadow-lg rounded-2xl print:shadow-none print:border-none">
      <CardHeader className="print:hidden">
        <CardTitle className="flex items-center gap-2"><BookMarked /> E-Rapor Saya</CardTitle>
        <CardDescription>Pilih semester untuk melihat detail nilai hasil belajar Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        {areRaporsLoading ? (
            <Skeleton className='h-10 w-full max-w-sm' />
        ) : (
            rapors && rapors.length > 0 ? (
                <div className="max-w-sm mb-6 print:hidden">
                     <Select value={selectedRaporId} onValueChange={setSelectedRaporId}>
                        <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="Pilih Rapor" />
                        </SelectTrigger>
                        <SelectContent>
                            {rapors.map(rapor => (
                                <SelectItem key={rapor.id} value={rapor.id}>
                                    T.A {rapor.schoolYear} - Semester {rapor.semester}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ) : (
                 <p className="text-muted-foreground text-center py-8">Belum ada data e-rapor yang diinput oleh sekolah.</p>
            )
        )}
        
        {(areGradesLoading && selectedRaporId) && (
            <div className="space-y-4 mt-4 print:hidden">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-60 w-full rounded-xl" />
            </div>
        )}
        
        {selectedRapor && (
            <div className="printable-area animate-fade-in">
                {/* Header Rapor Khusus Cetak */}
                <div className="text-center mb-8 hidden print:block border-b-2 border-primary pb-4">
                    <h2 className="text-2xl font-black font-headline text-primary">LAPORAN HASIL BELAJAR DIGITAL</h2>
                    <h3 className="text-lg font-bold">SMKS PGRI 2 KEDONDONG</h3>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Tahun Pelajaran {selectedRapor.schoolYear} - Semester {selectedRapor.semester}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-8 bg-muted/20 p-6 rounded-2xl border border-primary/5">
                    <div className="space-y-1">
                        <p><span className="text-muted-foreground">Nama Siswa:</span><br/><span className="font-black text-base">{selectedRapor.studentName}</span></p>
                        <p><span className="text-muted-foreground">Kelas:</span><br/><span className="font-bold">{selectedRapor.className}</span></p>
                    </div>
                    <div className="space-y-1 md:text-right">
                        <p><span className="text-muted-foreground">Tahun Ajaran:</span><br/><span className="font-bold">{selectedRapor.schoolYear}</span></p>
                        <p><span className="text-muted-foreground">Semester:</span><br/><span className="font-bold">{selectedRapor.semester}</span></p>
                    </div>
                </div>

                 <div className="rounded-2xl border overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-primary/5">
                            <TableRow>
                                <TableHead className="w-[50px] text-center font-bold">No</TableHead>
                                <TableHead className="font-bold">Mata Pelajaran</TableHead>
                                <TableHead className="text-center w-[100px] font-bold">Nilai</TableHead>
                                <TableHead className="font-bold">Capaian Kompetensi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!areGradesLoading && grades && grades.map((grade, index) => (
                                <TableRow key={grade.id} className="hover:bg-muted/30">
                                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                    <TableCell className="font-bold text-primary">{grade.subjectName}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={cn(
                                            "text-lg font-black h-10 w-10 p-0 flex items-center justify-center rounded-lg shadow-sm",
                                            grade.score >= 75 ? "bg-green-500" : "bg-amber-500"
                                        )}>
                                            {grade.score}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs leading-relaxed text-foreground/80 italic">{grade.description}</TableCell>
                                </TableRow>
                            ))}
                             {areGradesLoading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10"><LoaderCircle className="animate-spin mx-auto text-primary" /></TableCell>
                                </TableRow>
                             )}
                              {!areGradesLoading && (!grades || grades.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Data nilai belum tersedia untuk semester ini.</TableCell>
                                </TableRow>
                             )}
                        </TableBody>
                    </Table>
                </div>

                {/* Kolom Tanda Tangan Khusus Cetak */}
                <div className="mt-12 hidden print:grid grid-cols-2 gap-20">
                    <div className="text-center space-y-16">
                        <p className="text-sm font-bold">Orang Tua/Wali</p>
                        <p className="text-sm font-bold border-t border-black pt-2 mx-10">( .............................. )</p>
                    </div>
                    <div className="text-center space-y-16">
                        <p className="text-sm font-bold">Wali Kelas</p>
                        <p className="text-sm font-bold border-t border-black pt-2 mx-10">( .............................. )</p>
                    </div>
                </div>
            </div>
        )}
      </CardContent>
      {selectedRapor && (
         <CardFooter className="print:hidden gap-3 border-t bg-muted/10 p-6">
            <Button onClick={handlePrint} size="lg" className="rounded-xl font-bold shadow-lg shadow-primary/20">
                <Printer className="mr-2 h-5 w-5"/> Cetak Rapor
            </Button>
            <Button variant="outline" size="lg" onClick={handlePrint} className="rounded-xl font-bold">
                <Download className="mr-2 h-5 w-5"/> Simpan PDF
            </Button>
         </CardFooter>
      )}
    </Card>
  );
}
