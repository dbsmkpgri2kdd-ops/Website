'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, BookOpen, Building, GraduationCap, Factory, ShieldCheck, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type StatisticsSectionProps = {
    studentCount: number;
    teacherCount: number;
    majorCount: number;
    partnerCount: number;
    isLoading: boolean;
};

const StatisticsSection = ({ studentCount, teacherCount, majorCount, partnerCount, isLoading }: StatisticsSectionProps) => {
    
    const stats = [
        {
            title: 'SISWA AKTIF',
            value: studentCount,
            icon: GraduationCap,
            color: 'text-primary',
            bg: 'bg-primary/10'
        },
        {
            title: 'TENAGA PENDIDIK',
            value: teacherCount,
            icon: UserCheck,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        },
        {
            title: 'PROGRAM STUDI',
            value: majorCount,
            icon: BookOpen,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        {
            title: 'JEJAK INDUSTRI',
            value: partnerCount,
            icon: Factory,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10'
        },
    ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
        {stats.map((stat, index) => (
            <div key={index} className="group flex flex-col space-y-6">
                <div className={`w-16 h-16 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-2xl`}>
                    <stat.icon size={28} />
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60">{stat.title}</p>
                    {isLoading ? (
                        <Skeleton className='h-10 w-24' />
                    ) : (
                        <div className="text-5xl font-black text-foreground tracking-tighter italic">
                          {stat.value > 0 ? stat.value : '0'}
                        </div>
                    )}
                </div>
            </div>
        ))}
    </div>
  );
};

export default StatisticsSection;