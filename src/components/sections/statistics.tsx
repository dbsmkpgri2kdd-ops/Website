'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, BookOpen, Building } from 'lucide-react';
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
            title: 'Jumlah Siswa',
            value: studentCount,
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            title: 'Jumlah Guru',
            value: teacherCount,
            icon: UserCheck,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        },
        {
            title: 'Jumlah Jurusan',
            value: majorCount,
            icon: BookOpen,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        {
            title: 'Mitra Industri',
            value: partnerCount,
            icon: Building,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
    ];

  return (
    <div className="grid grid-cols-2 gap-4 md:gap-6">
        {stats.map((stat, index) => (
            <Card key={index} className="shadow-lg rounded-3xl border-none bg-background/50 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon size={18} />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className='h-8 w-1/2' />
                    ) : (
                        <div className="text-3xl font-black text-foreground">
                          {stat.value > 0 ? stat.value : '0'}
                        </div>
                    )}
                </CardContent>
            </Card>
        ))}
    </div>
  );
};

export default StatisticsSection;
