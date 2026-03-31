'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { UserCheck, Activity, HeartPulse, FileQuestion, Percent, ShieldCheck, LoaderCircle } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type AttendanceRecord } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate } from '@/lib/utils';

/**
 * Komponen Rekap Kehadiran Siswa v3.8.
 * Menampilkan statistik dan riwayat presensi digital secara real-time.
 */
export function AbsensiSiswa() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, `schools/${SCHOOL_DATA_ID}/attendance`),
      where('studentId', '==', user.uid),
      orderBy('date', 'desc')
    );
  }, [firestore, user]);

  const { data: records, isLoading } = useCollection<AttendanceRecord>(attendanceQuery);

  const stats = useMemo(() => {
    if (!records) return { sakit: 0, izin: 0, alpa: 0, total: 0, percentage: 0 };
    const sakit = records.filter(r => r.status === 'Sakit').length;
    const izin = records.filter(r => r.status === 'Izin').length;
    const alpa = records.filter(r => r.status === 'Alpa').length;
    const hadir = records.filter(r => r.status === 'Hadir').length;
    const total = records.length;
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 100;
    return { sakit, izin, alpa, total, percentage };
  }, [records]);

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    switch(status) {
        case 'Hadir': return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Hadir</Badge>;
        case 'Sakit': return <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Sakit</Badge>;
        case 'Izin': return <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Izin</Badge>;
        case 'Alpa': return <Badge variant="destructive" className="font-black text-[9px] uppercase tracking-widest px-3 py-1">Alpa</Badge>;
        default: return <Badge variant="outline" className='font-black text-[9px] uppercase tracking-widest'>{status}</Badge>;
    }
  };

  return (
    <Card className="shadow-2xl border-slate-100 rounded-[3rem] bg-white overflow-hidden border-2">
      <CardHeader className="p-8 border-b border-slate-100">
        <div className='flex items-center gap-3'>
            <div className='p-2 bg-primary text-white rounded-xl shadow-xl glow-primary'><UserCheck size={20} /></div>
            <div>
                <CardTitle className="text-xl font-headline font-black uppercase tracking-tighter text-slate-900">Rekap Kehadiran</CardTitle>
                <CardDescription className='text-[10px] font-bold uppercase tracking-widest mt-1'>Monitor persentase kehadiran Anda secara real-time.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className='p-8'>
        {isLoading || !mounted ? (
            <div className="grid grid-cols-2 gap-4 mb-10">
                {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-24 rounded-[1.5rem]" />)}
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-4 mb-10">
                <Card className="bg-primary/5 border-primary/10 rounded-[1.5rem] p-5 shadow-inner">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2"><Percent size={10}/> Persentase</p>
                    <div className="text-3xl font-black text-slate-900 font-headline tracking-tighter">{stats.percentage}%</div>
                </Card>
                 <Card className="bg-amber-500/5 border-amber-500/10 rounded-[1.5rem] p-5 shadow-inner">
                    <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2"><HeartPulse size={10}/> Sakit</p>
                    <div className="text-3xl font-black text-slate-900 font-headline tracking-tighter">{stats.sakit} <span className='text-[10px] uppercase opacity-40'>Hari</span></div>
                </Card>
                 <Card className="bg-blue-500/5 border-blue-500/10 rounded-[1.5rem] p-5 shadow-inner">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2"><FileQuestion size={10}/> Izin</p>
                    <div className="text-3xl font-black text-slate-900 font-headline tracking-tighter">{stats.izin} <span className='text-[10px] uppercase opacity-40'>Hari</span></div>
                </Card>
                 <Card className="bg-red-500/5 border-red-500/10 rounded-[1.5rem] p-5 shadow-inner">
                    <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Activity size={10}/> Alpa</p>
                    <div className="text-3xl font-black text-slate-900 font-headline tracking-tighter">{stats.alpa} <span className='text-[10px] uppercase opacity-40'>Hari</span></div>
                </Card>
            </div>
        )}

        <div className='flex items-center justify-between mb-6'>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Riwayat Presensi</h4>
            <div className='h-px flex-1 bg-slate-100 mx-4'></div>
        </div>

        <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <Table>
                <TableHeader className='bg-slate-50/50'>
                    <TableRow className='border-slate-100 hover:bg-transparent'>
                        <TableHead className='font-black text-[9px] uppercase tracking-widest text-slate-500 px-6'>Tanggal</TableHead>
                        <TableHead className='font-black text-[9px] uppercase tracking-widest text-slate-500'>Status</TableHead>
                        <TableHead className='font-black text-[9px] uppercase tracking-widest text-slate-500 px-6'>Keterangan</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && <TableRow><TableCell colSpan={3} className="text-center py-10"><LoaderCircle className='animate-spin mx-auto text-primary' /></TableCell></TableRow>}
                    {!isLoading && records && records.length > 0 ? (
                        records.map(record => (
                            <TableRow key={record.id} className='border-slate-100 hover:bg-slate-50 transition-colors'>
                                <TableCell className="font-bold text-xs px-6 py-4">
                                    {mounted ? formatDate(record.date) : '...'}
                                </TableCell>
                                <TableCell>{getStatusBadge(record.status)}</TableCell>
                                <TableCell className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-6">{record.notes || '-'}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        !isLoading && <TableRow><TableCell colSpan={3} className="text-center py-16 opacity-20"><ShieldCheck size={40} className='mx-auto mb-2'/><p className='text-[9px] font-black uppercase tracking-widest'>Belum ada riwayat absensi</p></TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}