'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, BookOpen, GraduationCap, Factory } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type StatisticsSectionProps = {
    studentCount: number;
    teacherCount: number;
    majorCount: number;
    partnerCount: number;
    isLoading: boolean;
};

const StatisticsSection = ({ studentCount, teacherCount, majorCount, partnerCount, isLoading }: StatisticsSectionProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    
    const stats = [
        {
            title: 'Siswa Aktif',
            value: studentCount,
            icon: GraduationCap,
            color: 'text-primary',
            bg: 'bg-blue-50',
            border: 'border-blue-100'
        },
        {
            title: 'Tenaga Pendidik',
            value: teacherCount,
            icon: UserCheck,
            color: 'text-accent',
            bg: 'bg-accent/5',
            border: 'border-accent/10'
        },
        {
            title: 'Program Studi',
            value: majorCount,
            icon: BookOpen,
            color: 'text-primary',
            bg: 'bg-blue-50',
            border: 'border-blue-100'
        },
        {
            title: 'Mitra Industri',
            value: partnerCount,
            icon: Factory,
            color: 'text-accent',
            bg: 'bg-accent/5',
            border: 'border-accent/10'
        },
    ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center sm:items-start p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm group hover:border-primary/20 hover:shadow-xl transition-all duration-500">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} ${stat.border} border flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm`}>
                    <stat.icon size={28} />
                </div>
                <div className="space-y-1 text-center sm:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.title}</p>
                    {isLoading || !mounted ? (
                        <Skeleton className='h-10 w-24' />
                    ) : (
                        <div className="text-4xl font-black text-slate-900 tracking-tighter" suppressHydrationWarning>
                          {stat.value > 0 ? stat.value.toLocaleString('id-ID') : '0'}
                        </div>
                    )}
                </div>
            </div>
        ))}
    </div>
  );
};

export default StatisticsSection;