'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
      <div className="w-24 h-24 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-8">
        <ShieldAlert size={48} />
      </div>
      <h1 className="text-4xl font-black font-headline tracking-tighter mb-4 text-foreground">
        Terjadi Kesalahan Sistem
      </h1>
      <p className="text-muted-foreground max-w-md mb-10 leading-relaxed">
        Aplikasi mengalami kendala teknis saat memuat data. Kami telah mencatat masalah ini untuk segera diperbaiki.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button onClick={() => reset()} size="lg" className="rounded-full font-bold">
          <RefreshCcw className="mr-2 h-4 w-4" /> Coba Muat Ulang
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="outline" size="lg" className="rounded-full font-bold">
          Kembali ke Beranda
        </Button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-10 p-4 bg-muted rounded-xl text-xs text-left max-w-full overflow-auto border">
          {error.message}
        </pre>
      )}
    </div>
  );
}
