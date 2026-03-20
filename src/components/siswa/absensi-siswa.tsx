'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { UserCheck, Activity, HeartPulse, FileQuestion, Percent } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type AttendanceRecord } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export function AbsensiSiswa() {
  const { user } = useUser();
  const firestore = useFirestore();

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
        case 'Hadir': return <Badge variant="secondary" className="bg-green-100 text-green-800">Hadir</Badge>;
        case 'Sakit': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Sakit</Badge>;
        case 'Izin': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Izin</Badge>;
        case 'Alpa': return <Badge variant="destructive">Alpa</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
  }
  
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const jsDate = date.seconds ? new Date(date.seconds * 1000) : date;
    return format(jsDate, "d MMMM yyyy", { locale: idLocale });
  }

  return (
    <Card className="shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><UserCheck /> Absensi Saya</CardTitle>
        <CardDescription>Rekapitulasi dan riwayat kehadiran Anda di sekolah.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
            </div>
        ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="bg-green-50 dark:bg-green-900/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">Persentase Hadir</CardTitle><Percent className="h-4 w-4 text-green-600 dark:text-green-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.percentage}%</div></CardContent>
                </Card>
                 <Card className="bg-yellow-50 dark:bg-yellow-900/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Sakit</CardTitle><HeartPulse className="h-4 w-4 text-yellow-600 dark:text-yellow-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{stats.sakit} hari</div></CardContent>
                </Card>
                 <Card className="bg-blue-50 dark:bg-blue-900/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">Izin</CardTitle><FileQuestion className="h-4 w-4 text-blue-600 dark:text-blue-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{stats.izin} hari</div></CardContent>
                </Card>
                 <Card className="bg-red-50 dark:bg-red-900/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-red-800 dark:text-red-300">Alpa</CardTitle><Activity className="h-4 w-4 text-red-600 dark:text-red-400" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-800 dark:text-red-200">{stats.alpa} hari</div></CardContent>
                </Card>
            </div>
        )}

        <h4 className="font-semibold mb-4">Riwayat Absensi</h4>
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Catatan dari Guru</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && <TableRow><TableCell colSpan={3} className="text-center">Memuat riwayat...</TableCell></TableRow>}
                    {!isLoading && records && records.length > 0 ? (
                        records.map(record => (
                            <TableRow key={record.id}>
                                <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                                <TableCell>{getStatusBadge(record.status)}</TableCell>
                                <TableCell className="text-muted-foreground">{record.notes || '-'}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        !isLoading && <TableRow><TableCell colSpan={3} className="text-center">Belum ada riwayat absensi.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
