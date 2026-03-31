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
        <div className='space-y-4'>
            <div className='flex items-center gap-2 text-primary'>
                <Sparkles size={14} className='animate-pulse text-accent' />
                <span className="text-xs font-bold uppercase tracking-widest">PPDB Online 2025</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">Mulai Masa Depan Anda di Sini.</h2>
            <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                Pusat pendidikan vokasi unggulan yang fokus pada penyiapan lulusan siap kerja, kompeten, dan memiliki karakter industri yang kuat.
            </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-primary rounded-xl shrink-0 border border-blue-100"><BookOpen size={20}/></div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Kurikulum Industri</h4>
              <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">Materi pembelajaran yang disinkronkan dengan kebutuhan pasar kerja saat ini.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-primary rounded-xl shrink-0 border border-blue-100"><CheckCircle size={20}/></div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Fasilitas Modern</h4>
              <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">Laboratorium dan bengkel kerja berstandar nasional untuk praktik nyata.</p>
            </div>
          </div>
        </div>

        <div className='pt-8 border-t border-border'>
            <p className='text-xs font-bold text-muted-foreground mb-4'>Sudah melakukan pendaftaran online sebelumnya?</p>
            <Button onClick={() => setActiveTab?.('cek-pendaftaran-ppdb')} variant="outline" className="rounded-lg h-11 px-6 font-bold text-xs border-primary/20 text-primary hover:bg-primary/5">
                <Search size={14} className='mr-2' /> Cek Status Pendaftaran
            </Button>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-border bg-white shadow-2xl overflow-hidden border-t-8 border-t-accent">
        <CardContent className="p-8 md:p-10">
          {isSubmitted ? (
            <div className="text-center py-16 animate-reveal flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Berkas Terkirim!</h3>
              <p className="text-muted-foreground text-sm font-medium mt-3 max-w-xs mx-auto leading-relaxed">
                Data pendaftaran Anda telah berhasil kami terima. Panitia akan segera melakukan verifikasi berkas.
              </p>
              <Button onClick={() => setActiveTab?.('cek-pendaftaran-ppdb')} className="mt-8 h-12 px-8 rounded-lg font-bold">
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