'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID, type Schedule } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarClock } from 'lucide-react';

const DAYS_OF_WEEK = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function JadwalPelajaran() {
  const firestore = useFirestore();
  const [selectedClass, setSelectedClass] = useState<string>('');

  const schedulesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const ref = collection(firestore, `schools/${SCHOOL_DATA_ID}/schedules`);
    return query(ref, orderBy('timeSlot', 'asc'));
  }, [firestore]);

  const { data: schedules, isLoading } = useCollection<Schedule>(schedulesQuery);

  const classNames = useMemo(() => {
    if (!schedules) return [];
    const classSet = new Set(schedules.map(s => s.className));
    return Array.from(classSet).sort();
  }, [schedules]);
  
  const filteredAndGroupedSchedule = useMemo(() => {
    if (!schedules || !selectedClass) return {};
    
    const filtered = schedules.filter(s => s.className === selectedClass);
    
    const grouped = filtered.reduce((acc, item) => {
        const day = item.dayOfWeek;
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(item);
        return acc;
    }, {} as Record<string, Schedule[]>);

    return grouped;
  }, [schedules, selectedClass]);

  useEffect(() => {
      if (classNames.length > 0 && !selectedClass) {
          setSelectedClass(classNames[0]);
      }
  }, [classNames, selectedClass]);


  return (
    <Card className="shadow-lg rounded-2xl">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarClock /> Jadwal Pelajaran</CardTitle>
            <CardDescription>Pilih kelas Anda untuk melihat jadwal pelajaran.</CardDescription>
        </CardHeader>
        <CardContent className='p-6'>
            <div className="max-w-md mx-auto mb-8">
                <Select onValueChange={setSelectedClass} value={selectedClass} disabled={isLoading || classNames.length === 0}>
                    <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Memuat kelas..." : "Pilih kelas"} />
                    </SelectTrigger>
                    <SelectContent>
                        {classNames.map(name => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
      
            {isLoading && <Skeleton className="h-96 w-full" />}
            
            {!isLoading && !selectedClass && classNames.length > 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <p>Silakan pilih kelas untuk menampilkan jadwal pelajaran.</p>
                </div>
            )}

            {!isLoading && selectedClass && (
                <div className="space-y-8">
                    {DAYS_OF_WEEK.map(day => {
                        const daySchedules = filteredAndGroupedSchedule[day];
                        if (!daySchedules || daySchedules.length === 0) return null;

                        return (
                            <div key={day}>
                                <h3 className="text-xl font-bold font-headline text-primary mb-4">{day}</h3>
                                <div className="rounded-lg border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[150px]">Jam</TableHead>
                                                <TableHead>Mata Pelajaran</TableHead>
                                                <TableHead>Guru</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {daySchedules.map(item => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.timeSlot}</TableCell>
                                                    <TableCell>{item.subjectName}</TableCell>
                                                    <TableCell>{item.teacherName}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
             {!isLoading && selectedClass && Object.keys(filteredAndGroupedSchedule).length === 0 && (
                 <div className="text-center py-20 text-muted-foreground">
                    <p>Jadwal untuk kelas {selectedClass} belum ditambahkan.</p>
                </div>
             )}
             {!isLoading && classNames.length === 0 && (
                 <div className="text-center py-20 text-muted-foreground">
                    <p>Data jadwal pelajaran belum tersedia.</p>
                </div>
             )}
        </CardContent>
    </Card>
  );
};
