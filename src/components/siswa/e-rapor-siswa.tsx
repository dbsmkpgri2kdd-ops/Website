'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { BookMarked, Download } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type ERapor, type Grade } from '@/lib/data';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';

export function ERaporSiswa() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedRaporId, setSelectedRaporId] = useState<string>('');

  const raportsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, `schools/${SCHOOL_DATA_ID}/eRapors`),
      where('studentId', '==', user.uid),
      orderBy('schoolYear', 'desc'),
      orderBy('semester', 'desc')
    );
  }, [firestore, user]);

  const { data: rapors, isLoading: areRaporsLoading } = useCollection<ERapor>(raportsQuery);

  const gradesQuery = useMemoFirebase(() => {
    if (!firestore || !selectedRaporId) return null;
    return query(
      collection(firestore, `schools/${SCHOOL_DATA_ID}/eRapors/${selectedRaporId}/grades`),
      orderBy('subjectName', 'asc')
    );
  }, [firestore, selectedRaporId]);
  
  const { data: grades, isLoading: areGradesLoading } = useCollection<Grade>(gradesQuery);

  useEffect(() => {
    if (rapors && rapors.length > 0 && !selectedRaporId) {
      setSelectedRaporId(rapors[0].id);
    }
  }, [rapors, selectedRaporId]);

  const selectedRapor = rapors?.find(r => r.id === selectedRaporId);

  const handlePrint = () => {
    window.print();
  }

  return (
    <Card className="shadow-lg rounded-2xl print:shadow-none print:border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BookMarked /> E-Rapor Saya</CardTitle>
        <CardDescription>Lihat laporan hasil belajar Anda di sini. Pilih semester untuk melihat detail nilai.</CardDescription>
      </CardHeader>
      <CardContent>
        {areRaporsLoading ? (
            <Skeleton className='h-10 w-full max-w-sm' />
        ) : (
            rapors && rapors.length > 0 ? (
                <div className="max-w-sm mb-6 print:hidden">
                     <Select value={selectedRaporId} onValueChange={setSelectedRaporId}>
                        <SelectTrigger>
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
                 <p className="text-muted-foreground text-center py-8">Belum ada data e-rapor yang diinput oleh wali kelas Anda.</p>
            )
        )}
        
        {(areGradesLoading && selectedRaporId) && (
            <div className="space-y-2 mt-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-40 w-full" />
            </div>
        )}
        
        {selectedRapor && (
            <div className="printable-area">
                <div className="text-center mb-6 hidden print:block">
                    <h2 className="text-xl font-bold">LAPORAN HASIL BELAJAR</h2>
                    <h3 className="text-lg font-semibold">T.A {selectedRapor.schoolYear} - SEMESTER {selectedRapor.semester.toUpperCase()}</h3>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-6">
                    <p><span className="font-semibold">Nama Siswa:</span> {selectedRapor.studentName}</p>
                    <p><span className="font-semibold">Kelas:</span> {selectedRapor.className}</p>
                    <p><span className="font-semibold">Tahun Ajaran:</span> {selectedRapor.schoolYear}</p>
                    <p><span className="font-semibold">Semester:</span> {selectedRapor.semester}</p>
                </div>
                 <div className="rounded-lg border mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40px]">No</TableHead>
                                <TableHead>Mata Pelajaran</TableHead>
                                <TableHead className="text-center w-[80px]">Nilai</TableHead>
                                <TableHead>Deskripsi/Capaian Kompetensi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!areGradesLoading && grades && grades.map((grade, index) => (
                                <TableRow key={grade.id}>
                                    <TableCell className="text-center">{index + 1}</TableCell>
                                    <TableCell className="font-medium">{grade.subjectName}</TableCell>
                                    <TableCell className="text-center font-bold text-lg">{grade.score}</TableCell>
                                    <TableCell className="text-muted-foreground">{grade.description}</TableCell>
                                </TableRow>
                            ))}
                             {areGradesLoading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Memuat nilai...</TableCell>
                                </TableRow>
                             )}
                              {!areGradesLoading && (!grades || grades.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Data nilai untuk semester ini belum lengkap.</TableCell>
                                </TableRow>
                             )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )}
      </CardContent>
      {selectedRapor && (
         <CardFooter className="print:hidden">
            <Button onClick={handlePrint}><Download className="mr-2"/> Cetak/Simpan PDF</Button>
         </CardFooter>
      )}
    </Card>
  );
}
