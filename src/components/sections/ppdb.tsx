
'use client';

import React, { useState } from 'react';
import { BookOpen, CheckCircle, Search, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PpdbForm from './ppdb-form';
import { type NavLink } from '@/lib/data';

type PpdbSectionProps = {
  setActiveTab?: (tab: NavLink) => void;
};

const PpdbSection = ({ setActiveTab }: PpdbSectionProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <section className="py-24 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center animate-fade-in">
      <div className='space-y-8'>
        <div className='space-y-4'>
            <div className='flex items-center gap-3 text-primary'>
                <Sparkles size={14} className='animate-pulse' />
                <span className="text-[9px] font-black uppercase tracking-[0.5em]">Admission 2025</span>
                <div className='h-px w-16 bg-primary/30'></div>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-tight">GABUNG.<br/><span className='text-primary not-italic'>MASA DEPAN.</span></h2>
            <p className="text-muted-foreground text-lg leading-relaxed font-medium opacity-80">
                Mulai perjalanan karir profesionalmu bersama pusat pendidikan vokasi unggulan. Jadilah tenaga ahli yang siap kerja dan berwawasan industri.
            </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-5 group">
            <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform shadow-xl"><BookOpen size={24}/></div>
            <div>
              <h4 className="font-black uppercase text-sm tracking-tight italic">Beasiswa Industri</h4>
              <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest mt-1 opacity-60">Potongan biaya bagi siswa berprestasi & Kurang Mampu.</p>
            </div>
          </div>
          <div className="flex items-start gap-5 group">
            <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform shadow-xl"><CheckCircle size={24}/></div>
            <div>
              <h4 className="font-black uppercase text-sm tracking-tight italic">Verifikasi Instan</h4>
              <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest mt-1 opacity-60">Proses pendaftaran digital 100% transparan dan cepat.</p>
            </div>
          </div>
        </div>

        <div className='pt-8 border-t border-white/5'>
            <p className='text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4'>Sudah melakukan pendaftaran?</p>
            <Button onClick={() => setActiveTab?.('cek-pendaftaran-ppdb')} variant="outline" className="rounded-xl font-black uppercase text-[10px] tracking-widest h-12 px-8 border-primary/20 text-primary hover:bg-primary/10">
                <Search size={14} className='mr-2' /> Cek Status Pendaftaran
            </Button>
        </div>
      </div>

      <Card className="glass-premium border-white/5 rounded-[3rem] p-4 shadow-3xl overflow-hidden relative">
        <div className='absolute top-0 left-0 w-full h-1 bg-primary'></div>
        <CardContent className="p-8">
          {isSubmitted ? (
            <div className="text-center py-20 animate-reveal flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <CheckCircle size={56} />
              </div>
              <h3 className="text-3xl font-black font-headline uppercase italic tracking-tighter">BERKAS TERKIRIM!</h3>
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-4 max-w-xs mx-auto opacity-60">
                Data Anda telah masuk ke sistem kami. Silakan cek status secara berkala di portal ini.
              </p>
              <Button onClick={() => setActiveTab?.('cek-pendaftaran-ppdb')} className="mt-10 h-14 px-10 rounded-2xl font-black uppercase tracking-widest shadow-xl glow-primary">
                CEK STATUS SAYA
              </Button>
            </div>
          ) : (
            <PpdbForm setIsSubmitted={setIsSubmitted} />
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default PpdbSection;
