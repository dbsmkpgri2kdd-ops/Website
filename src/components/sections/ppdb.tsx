'use client';

import React, { useState } from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import PpdbForm from './ppdb-form';

const PpdbSection = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <section className="py-16 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center animate-fade-in">
      <div>
        <h2 className="text-4xl font-bold mb-6 font-headline">Penerimaan Peserta Didik Baru</h2>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Bergabunglah dengan keluarga besar kami. Kami membuka pendaftaran untuk tahun ajaran baru dengan kuota terbatas. Pastikan putra-putri Anda mendapatkan pendidikan terbaik.
        </p>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400"><BookOpen size={24}/></div>
            <div>
              <h4 className="font-bold">Beasiswa Prestasi</h4>
              <p className="text-sm text-muted-foreground">Tersedia potongan biaya bagi siswa berprestasi akademik dan tahfidz.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400"><CheckCircle size={24}/></div>
            <div>
              <h4 className="font-bold">Proses Seleksi</h4>
              <p className="text-sm text-muted-foreground">Tes potensi akademik, wawancara, dan tes baca tulis Al-Qur'an.</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="p-10 rounded-3xl shadow-2xl">
        <CardContent className="p-0">
          {isSubmitted ? (
            <div className="text-center py-10 animate-fade-in">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} />
              </div>
              <h3 className="text-2xl font-bold mb-2 font-headline">Pendaftaran Terkirim!</h3>
              <p className="text-muted-foreground">Tim admin kami akan menghubungi Anda melalui WhatsApp dalam 1x24 jam.</p>
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
