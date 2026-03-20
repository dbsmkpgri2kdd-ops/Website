'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
      <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8">
        <FileQuestion size={48} />
      </div>
      <h1 className="text-4xl font-black font-headline tracking-tighter mb-4 text-foreground">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-muted-foreground max-w-md mb-10 leading-relaxed">
        Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan. Pastikan alamat URL sudah benar.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button onClick={() => router.push('/')} size="lg" className="rounded-full font-bold">
          <Home className="mr-2 h-4 w-4" /> Kembali ke Beranda
        </Button>
        <Button onClick={() => router.back()} variant="outline" size="lg" className="rounded-full font-bold">
          Kembali Sebelumnya
        </Button>
      </div>
    </div>
  );
}
