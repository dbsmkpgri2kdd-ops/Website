'use client';

import { collection, query, doc, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, deleteDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
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
import { Trash2, UserPlus, FileText, Download, CheckCircle2, XCircle, Clock, LoaderCircle, User, Calendar, Phone, School as SchoolIcon, Venus, Mars } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

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

  const handleUpdateStatus = (id: string, status: StudentApplication['status']) => {
    if (!firestore) return;
    const docRef = doc(firestore, `schools/${SCHOOL_DATA_ID}/studentApplications`, id);
    updateDocumentNonBlocking(docRef, { status });
    toast({ title: 'Status Diperbarui', description: `Pendaftar ditandai sebagai ${status}.` });
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const jsDate = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return format(jsDate, "d MMM yyyy, HH:mm", { locale: idLocale });
  }

  const getStatusBadge = (status: StudentApplication['status']) => {
    switch(status) {
        case 'DITERIMA': return <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 rounded-lg font-black text-[8px] tracking-widest"><CheckCircle2 size={10} className='mr-1' /> DITERIMA</Badge>;
        case 'CADANGAN': return <Badge className="bg-amber-500/10 text-amber-500 border-none px-3 py-1 rounded-lg font-black text-[8px] tracking-widest"><Clock size={10} className='mr-1' /> CADANGAN</Badge>;
        case 'DITOLAK': return <Badge className="bg-red-500/10 text-red-500 border-none px-3 py-1 rounded-lg font-black text-[8px] tracking-widest"><XCircle size={10} className='mr-1' /> DITOLAK</Badge>;
        default: return <Badge className="bg-blue-500/10 text-blue-500 border-none px-3 py-1 rounded-lg font-black text-[8px] tracking-widest">PENDING</Badge>;
    }
  };

  const handleDownloadCSV = () => {
    if (!applications || applications.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Tidak ada data',
        description: 'Tidak ada data pendaftar untuk diunduh.',
      });
      return;
    }

    const headers = ['Nama Siswa', 'Sekolah Asal', 'Jurusan Pilihan', 'No. WhatsApp Ortu', 'Status', 'Tanggal Daftar'];
    const rows = applications.map(app =>
      [
        `"${app.studentName.replace(/"/g, '""')}"`,
        `"${(app.originSchool || '-').replace(/"/g, '""')}"`,
        `"${app.chosenMajor.replace(/"/g, '""')}"`,
        `'${app.parentPhone}`,
        `"${app.status || 'PENDING'}"`,
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
    <Card className="shadow-2xl border-none rounded-[2rem] bg-white/5 backdrop-blur-md overflow-hidden">
        <CardHeader className="p-8 border-b border-white/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <CardTitle className="text-xl font-black italic uppercase flex items-center gap-3">
                        <UserPlus size={24} className="text-primary" /> Manajemen Pendaftaran PPDB
                    </CardTitle>
                    <CardDescription className="text-[10px] mt-1 uppercase font-bold tracking-widest opacity-60">Monitoring calon siswa baru tahun ajaran 2025/2026.</CardDescription>
                </div>
                <Button onClick={handleDownloadCSV} variant="outline" className="rounded-xl font-black uppercase tracking-widest text-[9px] h-12 px-6 border-white/10 hover:bg-white/5" disabled={isLoading || !applications || applications.length === 0}>
                    <Download className="mr-2 h-4 w-4" /> Unduh Laporan (CSV)
                </Button>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <Table>
                <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/5">
                        <TableHead className="px-8 font-black uppercase tracking-widest text-[9px] opacity-40">Identitas Siswa</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[9px] opacity-40">Pilihan Jurusan</TableHead>
                        <TableHead className="font-black uppercase tracking-widest text-[9px] opacity-40">Status</TableHead>
                        <TableHead className="text-right px-8 font-black uppercase tracking-widest text-[9px] opacity-40">Aksi & Kontrol</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center py-20"><LoaderCircle className="animate-spin mx-auto text-primary" /></TableCell>
                    </TableRow>
                    )}
                    {applications && applications.length > 0 ? (
                    applications.map((app) => (
                        <TableRow key={app.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <TableCell className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-lg uppercase">{app.studentName.charAt(0)}</div>
                                    <div>
                                        <p className="font-black uppercase italic text-sm tracking-tight">{app.studentName}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Asal: {app.originSchool || '-'}</p>
                                        <p className="text-[9px] font-bold text-primary uppercase tracking-widest">{app.parentPhone}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <p className="font-bold text-xs uppercase tracking-tight">{app.chosenMajor}</p>
                                <p className="text-[9px] font-medium opacity-40 mt-1 uppercase">{formatDate(app.submissionDate)}</p>
                            </TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell className="text-right px-8">
                                <div className="flex justify-end gap-3">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary">
                                                <FileText size={16} />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-3xl">
                                            <DialogHeader className="p-8 bg-primary/5 border-b border-white/5">
                                                <DialogTitle className="font-black uppercase italic tracking-tighter text-2xl">Detail Pendaftar</DialogTitle>
                                                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-primary">Informasi Lengkap Calon Siswa</DialogDescription>
                                            </DialogHeader>
                                            <div className="p-8 space-y-6">
                                                <div className="flex items-center gap-4 bg-primary/5 p-6 rounded-[2rem]">
                                                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl font-black">
                                                        {app.studentName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black uppercase italic tracking-tight">{app.studentName}</h4>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{app.chosenMajor}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-1">
                                                        <p className="text-[8px] font-black text-primary uppercase tracking-widest">Jenis Kelamin</p>
                                                        <p className="text-sm font-bold flex items-center gap-2">
                                                            {app.gender === 'Laki-laki' ? <Mars size={14}/> : <Venus size={14}/>}
                                                            {app.gender || '-'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[8px] font-black text-primary uppercase tracking-widest">Sekolah Asal</p>
                                                        <p className="text-sm font-bold flex items-center gap-2">
                                                            <SchoolIcon size={14}/>
                                                            {app.originSchool || '-'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[8px] font-black text-primary uppercase tracking-widest">Tempat, Tgl Lahir</p>
                                                        <p className="text-sm font-bold flex items-center gap-2">
                                                            <Calendar size={14}/>
                                                            {app.birthDate || '-'}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[8px] font-black text-primary uppercase tracking-widest">WhatsApp Ortu</p>
                                                        <p className="text-sm font-bold flex items-center gap-2 text-primary">
                                                            <Phone size={14}/>
                                                            {app.parentPhone}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="pt-4 border-t border-white/5">
                                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em]">Waktu Pendaftaran: {formatDate(app.submissionDate)}</p>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <Select onValueChange={(val) => handleUpdateStatus(app.id, val as any)} defaultValue={app.status || 'PENDING'}>
                                        <SelectTrigger className="h-9 w-32 rounded-xl bg-white/5 border-white/10 text-[9px] font-black uppercase tracking-widest">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card/95 backdrop-blur-3xl border-white/10">
                                            <SelectItem value="PENDING" className="text-[9px] font-black uppercase py-2">PENDING</SelectItem>
                                            <SelectItem value="DITERIMA" className="text-[9px] font-black uppercase py-2 text-emerald-500">DITERIMA</SelectItem>
                                            <SelectItem value="CADANGAN" className="text-[9px] font-black uppercase py-2 text-amber-500">CADANGAN</SelectItem>
                                            <SelectItem value="DITOLAK" className="text-[9px] font-black uppercase py-2 text-red-500">DITOLAK</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-destructive opacity-40 hover:opacity-100 transition-opacity" onClick={() => handleDelete(app.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    !isLoading && <TableRow><TableCell colSpan={4} className="text-center py-20 opacity-20"><UserPlus size={48} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-widest">Belum ada calon siswa yang mendaftar</p></TableCell></TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
