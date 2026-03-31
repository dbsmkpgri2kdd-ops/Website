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
    <section className="py-20 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center animate-fade-in">
      <div className='space-y-8'>
        <div className='space-y-4 text-center md:text-left'>
            <div className='flex items-center gap-2 text-primary justify-center md:justify-start'>
                <Sparkles size={14} className='animate-pulse text-accent' />
                <span className="text-xs font-bold uppercase tracking-widest">PPDB Online 2025</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight uppercase italic">Mulai Masa Depan <br/><span className='text-primary not-italic'>Anda di Sini.</span></h2>
            <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                Pusat pendidikan vokasi unggulan yang fokus pada penyiapan lulusan siap kerja, kompeten, dan memiliki karakter industri yang kuat.
            </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all">
            <div className="p-3 bg-primary/5 text-primary rounded-xl shrink-0 border border-primary/10"><BookOpen size={20}/></div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight">Kurikulum Industri</h4>
              <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">Materi pembelajaran yang disinkronkan dengan kebutuhan pasar kerja saat ini.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all">
            <div className="p-3 bg-primary/5 text-primary rounded-xl shrink-0 border border-primary/10"><CheckCircle size={20}/></div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight">Fasilitas Modern</h4>
              <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">Laboratorium dan bengkel kerja berstandar nasional untuk praktik nyata.</p>
            </div>
          </div>
        </div>

        <div className='pt-8 border-t border-slate-100 text-center md:text-left'>
            <p className='text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4'>Sudah melakukan pendaftaran online sebelumnya?</p>
            <Button onClick={() => setActiveTab?.('cek-pendaftaran-ppdb')} variant="outline" className="rounded-xl h-12 px-8 font-black text-[10px] uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5">
                <Search size={14} className='mr-2' /> Cek Status Pendaftaran
            </Button>
        </div>
      </div>

      <Card className="rounded-[3rem] border-slate-100 bg-white shadow-3xl overflow-hidden border-2 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-accent shadow-lg shadow-accent/20"></div>
        <CardContent className="p-10 md:p-14">
          {isSubmitted ? (
            <div className="text-center py-16 animate-reveal flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-primary/5 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner relative">
                <div className='absolute inset-0 bg-primary/10 rounded-[2rem] animate-ping opacity-20'></div>
                <CheckCircle size={48} className='relative z-10' />
              </div>
              <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Berkas Terkirim!</h3>
              <p className="text-muted-foreground text-sm font-medium mt-4 max-w-xs mx-auto leading-relaxed">
                Data pendaftaran Anda telah berhasil kami terima. Panitia akan segera melakukan verifikasi berkas secara menyeluruh.
              </p>
              <Button onClick={() => setActiveTab?.('cek-pendaftaran-ppdb')} className="mt-10 h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl glow-primary">
                Cek Status Sekarang
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