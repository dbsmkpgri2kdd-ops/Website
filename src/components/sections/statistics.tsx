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
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            title: 'Tenaga Pendidik',
            value: teacherCount,
            icon: UserCheck,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
        {
            title: 'Program Studi',
            value: majorCount,
            icon: BookOpen,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            title: 'Mitra Industri',
            value: partnerCount,
            icon: Factory,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        },
    ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center sm:items-start p-6 rounded-2xl bg-white border border-border shadow-sm group hover:border-primary/30 transition-all">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm`}>
                    <stat.icon size={24} />
                </div>
                <div className="space-y-1 text-center sm:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.title}</p>
                    {isLoading || !mounted ? (
                        <Skeleton className='h-8 w-20' />
                    ) : (
                        <div className="text-3xl font-bold text-slate-900" suppressHydrationWarning>
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