'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, UserCheck, BookOpen, Factory } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type StatisticsSectionProps = {
    studentCount: number;
    teacherCount: number;
    majorCount: number;
    partnerCount: number;
    isLoading: boolean;
};

/**
 * StatisticsSection v2.1 - Ultra Minimalist (Zero Italics)
 */
const StatisticsSection = ({ studentCount, teacherCount, majorCount, partnerCount, isLoading }: StatisticsSectionProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    
    const stats = [
        { label: 'Siswa Aktif', value: studentCount, icon: GraduationCap },
        { label: 'Tenaga Pendidik', value: teacherCount, icon: UserCheck },
        { label: 'Program Studi', value: majorCount, icon: BookOpen },
        { label: 'Mitra Industri', value: partnerCount, icon: Factory },
    ];

  return (
    <div className="space-y-12">
        <div className="mb-8 space-y-1">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">Capaian Akademik</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data statistik operasional sekolah.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {stats.map((stat, index) => (
                <div key={index} className="space-y-3 group">
                    <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <stat.icon size={16} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-primary transition-colors">{stat.label}</p>
                        {!mounted || isLoading ? (
                            <Skeleton className='h-8 w-16 rounded-lg' />
                        ) : (
                            <div className="text-3xl font-black text-slate-900 tracking-tighter">
                                {stat.value > 0 ? stat.value.toLocaleString('id-ID') : '0'}
                                <span className='text-primary text-base ml-0.5'>+</span>
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
