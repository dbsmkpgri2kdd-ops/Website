'use client';

import { useState, useEffect } from 'react';
import { Users, UserCheck, BookOpen, GraduationCap, Factory, Sparkles } from 'lucide-react';
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
            bg: 'bg-primary/5',
            border: 'border-primary/10'
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
            bg: 'bg-primary/5',
            border: 'border-primary/10'
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
    <div className="space-y-16">
        <div className="text-center space-y-3">
            <div className='flex items-center gap-3 text-primary justify-center'>
                <div className='h-px w-8 bg-primary/20'></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Data Capaian</span>
                <div className='h-px w-8 bg-primary/20'></div>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase italic">Statistik <span className='text-primary not-italic'>Kampus.</span></h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center sm:items-start p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm group hover:border-primary/20 hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} opacity-20 -mr-12 -mt-12 rounded-full transition-all group-hover:scale-150`}></div>
                    <div className={`w-16 h-16 rounded-2xl ${stat.bg} ${stat.color} ${stat.border} border-2 flex items-center justify-center mb-8 transition-transform group-hover:scale-110 shadow-inner`}>
                        <stat.icon size={32} />
                    </div>
                    <div className="space-y-2 text-center sm:text-left relative z-10">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-primary transition-colors">{stat.title}</p>
                        {isLoading || !mounted ? (
                            <Skeleton className='h-12 w-24 rounded-xl' />
                        ) : (
                            <div className="text-5xl font-black text-slate-900 tracking-tighter font-headline" suppressHydrationWarning>
                            {stat.value > 0 ? stat.value.toLocaleString('id-ID') : '0'}
                            <span className='text-primary text-xl ml-1'>+</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default StatisticsSection;
