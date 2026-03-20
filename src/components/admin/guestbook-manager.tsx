'use client';

import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, deleteDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type GuestbookEntry } from '@/lib/data';
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
import { Trash2, MessageSquare, Download, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export function GuestbookManager() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const guestbookQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, `schools/${SCHOOL_DATA_ID}/guestbookEntries`), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: entries, isLoading } = useCollection<GuestbookEntry>(guestbookQuery);
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Hapus pesan ini dari buku tamu?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/guestbookEntries`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Pesan Dihapus', description: 'Kesan pengunjung telah dihapus.' });
    }
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const jsDate = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return format(jsDate, "d MMM yyyy, HH:mm", { locale: idLocale });
  }

  const handleDownloadCSV = () => {
    if (!entries || entries.length === 0) return;
    
    const headers = ['Nama', 'Asal', 'Pesan', 'Tanggal'];
    const rows = entries.map(e => [
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.origin.replace(/"/g, '""')}"`,
      `"${e.message.replace(/"/g, '""')}"`,
      `"${formatDate(e.createdAt)}"`
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'buku-tamu-sekolah.csv';
    link.click();
  };

  return (
    <Card className="shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><MessageSquare /> Buku Tamu Digital</CardTitle>
              <CardDescription>Daftar kesan dan pesan yang ditinggalkan oleh pengunjung situs web sekolah.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadCSV} disabled={!entries || entries.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Ekspor CSV
            </Button>
        </CardHeader>
        <CardContent className="p-0">
            <div className="rounded-none border-0">
                <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                    <TableHead>Pengunjung</TableHead>
                    <TableHead>Pesan Kesan</TableHead>
                    <TableHead>Waktu Kirim</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center py-10">Memuat pesan...</TableCell>
                    </TableRow>
                    )}
                    {entries && entries.length > 0 ? (
                    entries.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell className="font-semibold">
                              {entry.name}
                              <p className="text-xs text-muted-foreground font-normal">Asal: {entry.origin}</p>
                            </TableCell>
                            <TableCell className="max-w-md">
                              <p className="text-sm line-clamp-2 italic">"{entry.message}"</p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar size={12} /> {formatDate(entry.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} className="hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    !isLoading && <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Belum ada pesan masuk di buku tamu.</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
