'use client';

import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, deleteDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type StudentApplication } from '@/lib/data';
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
import { Trash2, UserPlus, FileText, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export function ApplicationsManager() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const applicationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const applicationsRef = collection(firestore, `schools/${SCHOOL_DATA_ID}/studentApplications`);
    return query(applicationsRef, orderBy('submissionDate', 'desc'));
  }, [firestore]);

  const { data: applications, isLoading } = useCollection<StudentApplication>(applicationsQuery);
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus pendaftaran ini? Tindakan ini tidak dapat diurungkan.')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/studentApplications`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Data pendaftar telah dihapus.' });
    }
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const jsDate = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return format(jsDate, "d MMM yyyy, HH:mm", { locale: idLocale });
  }

  const handleDownloadCSV = () => {
    if (!applications || applications.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Tidak ada data',
        description: 'Tidak ada data pendaftar untuk diunduh.',
      });
      return;
    }

    const headers = ['Nama Siswa', 'Jurusan Pilihan', 'No. WhatsApp Ortu', 'Tanggal Daftar'];
    const rows = applications.map(app =>
      [
        `"${app.studentName.replace(/"/g, '""')}"`,
        `"${app.chosenMajor.replace(/"/g, '""')}"`,
        `'${app.parentPhone}`,
        `"${formatDate(app.submissionDate)}"`
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'data-pendaftar-ppdb.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus /> Manajemen Pendaftaran</CardTitle>
            <CardDescription>Kelola daftar calon siswa baru yang telah mendaftar secara online.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap items-center gap-4 mb-4">
                {applications && applications.length > 0 && (
                    <div className='bg-primary/10 text-primary-foreground p-3 rounded-lg flex items-center gap-2'>
                        <FileText className='text-primary'/>
                        <p className='text-sm font-medium text-primary'>Total Pendaftar: {applications.length}</p>
                    </div>
                )}
                 <Button onClick={handleDownloadCSV} variant="outline" disabled={isLoading || !applications || applications.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Unduh Data (CSV)
                </Button>
            </div>
            <div className="rounded-lg border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nama Calon Siswa</TableHead>
                    <TableHead>Jurusan Pilihan</TableHead>
                    <TableHead>No. WhatsApp Ortu</TableHead>
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
                            <TableCell>{app.chosenMajor}</TableCell>
                            <TableCell>{app.parentPhone}</TableCell>
                            <TableCell>{formatDate(app.submissionDate)}</TableCell>
                            <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    !isLoading && <TableRow><TableCell colSpan={5} className="text-center">Belum ada calon siswa yang mendaftar.</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
