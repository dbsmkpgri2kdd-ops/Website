'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert, X } from 'lucide-react';

/**
 * Pendengar error global untuk Firestore Permission.
 * Menampilkan overlay error yang informatif tanpa menghentikan (crash) seluruh aplikasi.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (err: FirestorePermissionError) => {
      // Set error ke state untuk ditampilkan di UI
      setError(err);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  if (!error) return null;

  // Render overlay error yang bisa ditutup (bukan throw error)
  return (
    <div className="fixed bottom-20 left-4 right-4 z-[100] md:left-auto md:bottom-24 md:w-96 animate-in slide-in-from-left-10 duration-500">
      <Alert variant="destructive" className="shadow-2xl border-2 bg-destructive/95 text-destructive-foreground backdrop-blur-md rounded-2xl p-5">
        <ShieldAlert className="h-5 w-5 text-white" />
        <div className="flex items-center justify-between w-full">
          <AlertTitle className='font-black text-xs uppercase tracking-widest text-white'>
            Firebase Permission Notice
          </AlertTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 p-0 hover:bg-white/20 text-white rounded-full" 
            onClick={() => setError(null)}
          >
            <X size={14} />
          </Button>
        </div>
        <AlertDescription className="mt-3">
          <p className="text-[10px] leading-tight opacity-90 mb-3">
            Sistem mendeteksi kendala akses pada database. Ini umum terjadi saat database masih kosong atau sedang sinkronisasi.
          </p>
          <div className="bg-black/20 p-3 rounded-xl overflow-hidden">
            <p className="text-[9px] font-mono break-all opacity-80 line-clamp-4">
              Path: {error.request.path}<br/>
              Method: {error.request.method}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4 w-full h-8 text-[10px] font-bold border-white/30 text-white hover:bg-white/10 rounded-lg"
            onClick={() => setError(null)}
          >
            Abaikan & Lanjutkan
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
