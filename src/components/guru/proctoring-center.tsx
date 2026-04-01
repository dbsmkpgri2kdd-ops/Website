'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Camera, ShieldCheck, ShieldAlert, Wifi, Zap, 
  User, Clock, AlertTriangle, MonitorPlay, MonitorCheck,
  Smartphone, Globe, Lock, ImageIcon
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ActiveSession {
  id: string;
  studentName: string;
  examId: string;
  examTitle: string;
  lastHeartbeat: any;
  violationCount: number;
  isCameraActive: boolean;
  lastSnapshot: string | null;
  minutesRemaining: number;
  isAppMode: boolean;
  isLocked: boolean;
  status: 'ACTIVE' | 'COMPLETED';
}

type ProctoringCenterProps = {
  examId?: string | null;
  examTitle?: string;
  onBack?: () => void;
};

/**
 * Antarmuka Pengawasan Ujian (Proctoring Center) v6.0.
 * Mendukung tampilan Live Camera Snapshot untuk audit integritas visual.
 */
export function ProctoringCenter({ examId, examTitle, onBack }: ProctoringCenterProps) {
  const firestore = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const baseQuery = collection(firestore, `schools/${SCHOOL_DATA_ID}/activeExamSessions`);
    
    if (examId) {
        return query(
            baseQuery,
            where('status', '==', 'ACTIVE'),
            where('examId', '==', examId),
            orderBy('lastHeartbeat', 'desc')
        );
    }

    return query(
      baseQuery,
      where('status', '==', 'ACTIVE'),
      orderBy('lastHeartbeat', 'desc')
    );
  }, [firestore, examId]);

  const { data: sessions, isLoading } = useCollection<ActiveSession>(sessionsQuery);

  const stats = useMemo(() => {
    if (!sessions) return { total: 0, cam: 0, violations: 0, appMode: 0, locked: 0 };
    return {
      total: sessions.length,
      cam: sessions.filter(s => s.isCameraActive).length,
      violations: sessions.reduce((acc, s) => acc + (s.violationCount || 0), 0),
      appMode: sessions.filter(s => s.isAppMode).length,
      locked: sessions.filter(s => s.isLocked).length
    };
  }, [sessions]);

  return (
    <div className="space-y-8 animate-reveal pb-20 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            {onBack && (
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 shadow-sm" onClick={onBack}>
                    <ArrowLeft size={24} />
                </Button>
            )}
            <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter font-headline leading-none">Proctoring <span className="text-primary">Center.</span></h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mt-1.5 opacity-60">
                    {examId ? `Monitoring Integritas: ${examTitle}` : 'Monitoring Seluruh Aktivitas Ujian'}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_emerald]"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Gateway Link Stable</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-xl">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-2 opacity-40">Siswa Aktif</p>
            <div className="text-3xl font-black italic font-headline">{stats.total} <span className="text-primary text-xs not-italic opacity-20 uppercase tracking-widest">Siswa</span></div>
        </Card>
        <Card className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-xl">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-2 opacity-40">Mode Aplikasi</p>
            <div className="text-3xl font-black italic font-headline text-emerald-600">{stats.appMode} <span className="text-emerald-600/40 text-xs not-italic uppercase tracking-widest">APK</span></div>
        </Card>
        <Card className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-xl">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-2 opacity-40">Total Pelanggaran</p>
            <div className="text-3xl font-black italic font-headline text-red-600">{stats.violations} <AlertTriangle size={20} className='inline ml-1 animate-pulse' /></div>
        </Card>
        <Card className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-xl">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-2 opacity-40">Sesi Terkunci</p>
            <div className="text-3xl font-black italic font-headline text-red-600">{stats.locked} <Lock size={20} className='inline ml-1' /></div>
        </Card>
        <Card className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-xl">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-2 opacity-40">Video Feed</p>
            <div className="text-3xl font-black italic font-headline text-accent">{stats.cam} <Camera size={20} className='inline ml-1' /></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {isLoading && Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-64 rounded-[3rem]" />)}
        
        {sessions?.map((session) => (
            <Card key={session.id} className={cn(
                "rounded-[3rem] shadow-2xl border-2 transition-all duration-700 overflow-hidden bg-white",
                session.isLocked ? "border-red-600 shadow-red-600/10" : 
                session.violationCount > 0 ? "border-amber-500/40" : "border-slate-100"
            )}>
                <div className="relative aspect-video bg-slate-900 group">
                    {session.isCameraActive && session.lastSnapshot ? (
                        <div className="w-full h-full relative">
                            <Image 
                                src={session.lastSnapshot} 
                                alt={session.studentName} 
                                fill 
                                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                unoptimized
                            />
                            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-white/10">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">LIVE BIOMETRIC</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-red-500/40 bg-red-500/5">
                            {session.isCameraActive ? <LoaderCircle className='animate-spin mb-2' /> : <ShieldAlert size={40} className="mb-2" />}
                            <span className="text-[8px] font-black uppercase tracking-widest">
                                {session.isCameraActive ? 'WAITING FEED...' : 'NO VIDEO FEED'}
                            </span>
                        </div>
                    )}
                    
                    <div className="absolute top-4 right-4 flex gap-2">
                        {session.isLocked && (
                            <div className='bg-red-600 text-white p-1.5 rounded-lg shadow-xl animate-pulse'>
                                <Lock size={14} />
                            </div>
                        )}
                        {session.isAppMode ? (
                            <div className="bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg" title="App Guard Active">
                                <Smartphone size={14} />
                            </div>
                        ) : (
                            <div className="bg-blue-500 text-white p-1.5 rounded-lg shadow-lg" title="Web Guard Mode">
                                <Globe size={14} />
                            </div>
                        )}
                    </div>
                </div>
                <CardContent className="p-8 space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black uppercase shadow-inner border border-primary/10">
                            {session.studentName?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black uppercase tracking-tight truncate italic font-headline text-slate-900">{session.studentName}</p>
                            <p className="text-[8px] font-bold text-primary uppercase tracking-widest truncate">{session.examTitle || 'Ujian Aktif'}</p>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1">
                                    <Wifi size={10} className="text-emerald-500"/>
                                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Online</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={10} className="text-muted-foreground"/>
                                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{session.minutesRemaining || 0}m Left</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border shadow-inner transition-colors",
                        session.isLocked ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"
                    )}>
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Status Keamanan</p>
                            <p className={cn(
                                "text-xs font-black uppercase italic tracking-tighter", 
                                session.isLocked ? "text-red-600" : 
                                session.violationCount > 0 ? "text-amber-600" : "text-emerald-600"
                            )}>
                                {session.isLocked ? "LOCKDOWN ACTIVE" : `${session.violationCount || 0} PELANGGARAN`}
                            </p>
                        </div>
                        {session.violationCount > 0 && <AlertTriangle size={18} className={cn("animate-pulse", session.isLocked ? "text-red-600" : "text-amber-500")} />}
                    </div>
                </CardContent>
            </Card>
        ))}

        {!isLoading && (!sessions || sessions.length === 0) && (
            <div className="col-span-full py-32 border-4 border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center justify-center space-y-6 text-center opacity-40 bg-slate-50/50">
                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-inner">
                    <MonitorCheck size={40} className="text-muted-foreground" />
                </div>
                <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter font-headline">Zero Active Sessions</h3>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] mt-2 max-w-xs">Gateway akan menampilkan data otomatis saat siswa melakukan login ke sesi ujian.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
