'use client';

import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, deleteDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type ExtracurricularApplication } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Users, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export function ExtracurricularApplicationsManager() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const applicationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/extracurricularApplications`);
    return query(ref, orderBy('submissionDate', 'desc'));
  }, [firestore]);

  const { data: applications, isLoading } = useCollection<ExtracurricularApplication>(applicationsQuery);
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus pendaftaran ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/extracurricularApplications`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Data pendaftar telah dihapus.' });
    }
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const jsDate = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return format(jsDate, "d MMM yyyy, HH:mm", { locale: idLocale });
  }

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> Pendaftar Ekstrakurikuler</CardTitle>
            <CardDescription>Kelola daftar siswa yang mendaftar kegiatan ekstrakurikuler.</CardDescription>
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
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">Memuat data pendaftar...</TableCell>
                    </TableRow>
                    )}
                    {applications && applications.length > 0 ? (
                    applications.map((app) => (
                        <TableRow key={app.id}>
                            <TableCell className="font-medium">{app.studentName}</TableCell>
                            <TableCell>{app.studentClass}</TableCell>
                            <TableCell>{app.extracurricularName}</TableCell>
                            <TableCell>{formatDate(app.submissionDate)}</TableCell>
                            <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    !isLoading && <TableRow><TableCell colSpan={5} className="text-center">Belum ada siswa yang mendaftar ekstrakurikuler.</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
