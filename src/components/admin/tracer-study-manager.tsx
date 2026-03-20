'use client';

import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, deleteDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type TracerStudyResponse } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Trash2, ScanSearch, Download, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export function TracerStudyManager() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const responsesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/tracerStudyResponses`);
    return query(ref, orderBy('submissionDate', 'desc'));
  }, [firestore]);

  const { data: responses, isLoading } = useCollection<TracerStudyResponse>(responsesQuery);
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/tracerStudyResponses`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Dihapus!', description: 'Data tracer study telah dihapus.' });
    }
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const jsDate = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return format(jsDate, "d MMM yyyy, HH:mm", { locale: idLocale });
  }

  const handleDownloadCSV = () => {
    if (!responses || responses.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Tidak ada data',
        description: 'Tidak ada data untuk diunduh.',
      });
      return;
    }

    const headers = ['Nama', 'Tahun Lulus', 'Status', 'Detail Aktivitas', 'Saran/Masukan', 'Tanggal Submit'];
    const rows = responses.map(res =>
      [
        `"${res.name.replace(/"/g, '""')}"`,
        `'${res.graduationYear}`,
        `"${res.status.replace(/"/g, '""')}"`,
        `"${res.currentActivityDetail.replace(/"/g, '""')}"`,
        `"${(res.suggestions || '').replace(/"/g, '""')}"`,
        `"${formatDate(res.submissionDate)}"`
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'data-tracer-study.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><ScanSearch /> Data Tracer Study</CardTitle>
            <CardDescription>Lihat data yang telah dikirimkan oleh alumni melalui formulir tracer study.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="flex flex-wrap items-center gap-4 mb-4">
                {responses && responses.length > 0 && (
                    <div className='bg-primary/10 text-primary-foreground p-3 rounded-lg flex items-center gap-2'>
                        <FileText className='text-primary'/>
                        <p className='text-sm font-medium text-primary'>Total Responden: {responses.length}</p>
                    </div>
                )}
                 <Button onClick={handleDownloadCSV} variant="outline" disabled={isLoading || !responses || responses.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Unduh Data (CSV)
                </Button>
            </div>
            <div className="rounded-lg border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nama Alumni</TableHead>
                    <TableHead>Tahun Lulus</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detail Aktivitas</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">Memuat data...</TableCell>
                    </TableRow>
                    )}
                    {responses && responses.length > 0 ? (
                    responses.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.graduationYear}</TableCell>
                            <TableCell>{item.status}</TableCell>
                            <TableCell className="max-w-xs truncate">{item.currentActivityDetail}</TableCell>
                            <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    !isLoading && <TableRow><TableCell colSpan={5} className="text-center">Belum ada alumni yang mengisi tracer study.</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
