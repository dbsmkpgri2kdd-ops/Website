'use client';

import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type ExtracurricularApplication } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Users, FileText } from 'lucide-react';

export function PembinaanEskul() {
  const firestore = useFirestore();

  const applicationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/extracurricularApplications`);
    return query(ref, orderBy('submissionDate', 'desc'));
  }, [firestore]);

  const { data: applications, isLoading } = useCollection<ExtracurricularApplication>(applicationsQuery);
  
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const jsDate = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return format(jsDate, "d MMM yyyy, HH:mm", { locale: idLocale });
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> Pendaftar Ekstrakurikuler</CardTitle>
            <CardDescription>Berikut adalah daftar siswa yang telah mendaftar kegiatan ekstrakurikuler.</CardDescription>
        </CardHeader>
        <CardContent>
            {applications && applications.length > 0 && (
                <div className='mb-4 bg-primary/10 text-primary-foreground p-3 rounded-lg flex items-center gap-2'>
                    <FileText className='text-primary'/>
                    <p className='text-sm font-medium text-primary'>Total Pendaftar: {applications.length}</p>
                </div>
            )}
            <div className="rounded-lg border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Kegiatan</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">Memuat data pendaftar...</TableCell>
                    </TableRow>
                    )}
                    {applications && applications.length > 0 ? (
                    applications.map((app) => (
                        <TableRow key={app.id}>
                            <TableCell className="font-medium">{app.studentName}</TableCell>
                            <TableCell>{app.studentClass}</TableCell>
                            <TableCell>{app.extracurricularName}</TableCell>
                            <TableCell>{formatDate(app.submissionDate)}</TableCell>
                        </TableRow>
                    ))
                    ) : (
                    !isLoading && <TableRow><TableCell colSpan={4} className="text-center">Belum ada siswa yang mendaftar ekstrakurikuler.</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
