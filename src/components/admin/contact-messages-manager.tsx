
'use client';

import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, deleteDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type ContactMessage } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Mail, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';

export function ContactMessagesManager() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, `schools/${SCHOOL_DATA_ID}/contactMessages`), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: messages, isLoading } = useCollection<ContactMessage>(messagesQuery);
  
  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (confirm('Hapus pesan ini dari database?')) {
      const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/contactMessages`, id);
      deleteDocumentNonBlocking(docRef);
      toast({ variant: 'destructive', title: 'Pesan Dihapus' });
    }
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const jsDate = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return format(jsDate, "d MMM yyyy, HH:mm", { locale: idLocale });
  }

  return (
    <Card className="shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="flex items-center gap-2"><Mail /> Pesan Masuk Pengunjung</CardTitle>
            <CardDescription>Daftar pesan dari formulir kontak di halaman depan.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <div className="rounded-none border-0">
                <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                    <TableHead>Pengirim</TableHead>
                    <TableHead>Subjek</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center py-10">Memuat pesan...</TableCell>
                    </TableRow>
                    )}
                    {messages && messages.length > 0 ? (
                    messages.map((msg) => (
                        <TableRow key={msg.id} className="hover:bg-muted/30">
                            <TableCell className="font-semibold">
                              {msg.name}
                              <p className="text-[10px] text-muted-foreground font-normal">{msg.email}</p>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{msg.subject}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{formatDate(msg.createdAt)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 text-primary">
                                                <FileText size={16} />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px] rounded-2xl">
                                            <DialogHeader>
                                                <DialogTitle className="font-headline text-2xl">Detail Pesan</DialogTitle>
                                                <DialogDescription>Diterima pada {formatDate(msg.createdAt)}</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-6 pt-4">
                                                <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl">
                                                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{msg.name}</p>
                                                        <p className="text-xs text-muted-foreground">{msg.email}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-xs font-black uppercase tracking-widest text-primary">Subjek</p>
                                                    <p className="font-bold">{msg.subject}</p>
                                                </div>
                                                <div className="space-y-2 border-t pt-4">
                                                    <p className="text-xs font-black uppercase tracking-widest text-primary">Isi Pesan</p>
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{msg.message}</p>
                                                </div>
                                                <div className="flex justify-end pt-4">
                                                    <Button variant="outline" className="rounded-xl" asChild>
                                                        <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}>Balas via Email</a>
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(msg.id)} className="h-8 w-8 hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    !isLoading && <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Tidak ada pesan masuk.</TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
