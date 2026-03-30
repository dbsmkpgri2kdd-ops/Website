
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Camera, ShieldCheck, ShieldAlert, Wifi, Zap, 
  User, Clock, AlertTriangle, MonitorPlay, MonitorCheck,
  Smartphone, Globe
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { SCHOOL_DATA_ID } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface ActiveSession {
  id: string;
  studentName: string;
  lastHeartbeat: any;
  violationCount: number;
  isCameraActive: boolean;
  minutesRemaining: number;
  isAppMode: boolean;
  status: 'ACTIVE' | 'COMPLETED';
}

type ProctoringCenterProps = {
  examId: string;
  examTitle: string;
  onBack: () => void;
};

/**
 * Antarmuka Pengawasan Ujian (Proctoring Center) untuk Guru.
 * Memantau status kehadiran, kamera, dan tingkat kecurangan peserta secara real-time.
 */
export function ProctoringCenter({ examId, examTitle, onBack }: ProctoringCenterProps) {
  const firestore = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, `schools/${SCHOOL_DATA_ID}/activeExamSessions`),
      where('status', '==', 'ACTIVE'),
      orderBy('lastHeartbeat', 'desc')
    );
  }, [firestore]);

  const { data: sessions, isLoading } = useCollection<ActiveSession>(sessionsQuery);

  const stats = useMemo(() => {
    if (!sessions) return { total: 0, cam: 0, violations: 0, appMode: 0 };
    return {
      total: sessions.length,
      cam: sessions.filter(s => s.isCameraActive).length,
      violations: sessions.reduce((acc, s) => acc + (s.violationCount || 0), 0),
      appMode: sessions.filter(s => s.isAppMode).length
    };
  }, [sessions]);

  return (
    <div className="space-y-8 animate-reveal pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10" onClick={onBack}>
                <ArrowLeft size={24} />
            </Button>
            <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter font-headline">Proctoring <span className="text-primary">Center</span></h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mt-1">Monitoring Integritas: {examTitle}</p>
            </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_emerald]"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Server Connection Stable</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/5 border-white/5 rounded-3xl p-6 shadow-2xl">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-2">Siswa Aktif</p>
            <div className="text-3xl font-black italic font-headline">{stats.total} <span className="text-primary text-sm not-italic opacity-40">/ SISWA</span></div>
        </Card>
        <Card className="bg-white/5 border-white/5 rounded-3xl p-6 shadow-2xl">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-2">Aplikasi Terinstal</p>
            <div className="text-3xl font-black italic font-headline text-emerald-500">{stats.appMode} <span className="text-emerald-500/40 text-sm not-italic">APK</span></div>
        </Card>
        <Card className="bg-white/5 border-white/5 rounded-3xl p-6 shadow-2xl">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-2">Peringatan Keamanan</p>
            <div className="text-3xl font-black italic font-headline text-red-500">{stats.violations} <AlertTriangle size={20} className='inline ml-1 animate-pulse' /></div>
        </Card>
        <Card className="bg-white/5 border-white/5 rounded-3xl p-6 shadow-2xl">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-2">Kamera Pengawas</p>
            <div className="text-3xl font-black italic font-headline text-amber-500">{stats.cam} <span className="text-amber-500/40 text-sm not-italic">FEED</span></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading && Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-64 rounded-[2.5rem]" />)}
        
        {sessions?.map((session) => (
            <Card key={session.id} className={cn(
                "rounded-[2.5rem] shadow-3xl border-2 transition-all duration-500 overflow-hidden bg-white/5",
                session.violationCount > 0 ? "border-red-500/40" : "border-white/5"
            )}>
                <div className="relative aspect-video bg-black group">
                    {session.isCameraActive ? (
                        <div className="w-full h-full flex items-center justify-center text-primary/20 italic font-black text-xs">
                            <MonitorPlay size={40} className="mb-2 opacity-20" />
                            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">LIVE BIOMETRIC</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-red-500/40 bg-red-500/5">
                            <ShieldAlert size={40} className="mb-2" />
                            <span className="text-[8px] font-black uppercase tracking-widest">CAMERA DISABLED</span>
                        </div>
                    )}
                    
                    <div className="absolute top-4 right-4">
                        {session.isAppMode ? (
                            <div className="bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg" title="Running in Android App Mode">
                                <Smartphone size={14} />
                            </div>
                        ) : (
                            <div className="bg-blue-500 text-white p-1.5 rounded-lg shadow-lg" title="Running in Browser Mode">
                                <Globe size={14} />
                            </div>
                        )}
                    </div>
                </div>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase">{session.studentName?.charAt(0)}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black uppercase tracking-tight truncate italic font-headline">{session.studentName}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                                <div className="flex items-center gap-1">
                                    <Wifi size={10} className="text-emerald-500"/>
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase">Stable</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={10} className="text-muted-foreground"/>
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase">{session.minutesRemaining || 0}m left</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Security Logs</p>
                            <p className={cn("text-xs font-black", session.violationCount > 0 ? "text-red-500" : "text-emerald-500")}>
                                {session.violationCount || 0} VIOLATIONS
                            </p>
                        </div>
                        {session.violationCount > 0 && <AlertTriangle size={16} className="text-red-500 animate-pulse" />}
                    </div>
                </CardContent>
            </Card>
        ))}

        {!isLoading && (!sessions || sessions.length === 0) && (
            <div className="col-span-full py-32 border-2 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center space-y-6 text-center opacity-40">
                <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center">
                    <MonitorCheck size={40} className="text-muted-foreground" />
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">No Active Sessions</h3>
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] mt-1 max-w-xs">Data akan muncul otomatis saat siswa mulai mengerjakan ujian terjadwal.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
