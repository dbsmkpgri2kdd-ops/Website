'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert, X } from 'lucide-react';

/**
 * Global Firestore Permission Error Listener.
 * Menampilkan overlay error informatif tanpa menghentikan aplikasi.
 * Kebijakan: Zero Italics & Ultra-Minimalist.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (err: FirestorePermissionError) => {
      setError(err);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  if (!error) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[100] md:left-auto md:bottom-24 md:w-96 animate-reveal">
      <Alert variant="destructive" className="shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-2 bg-destructive/95 text-destructive-foreground backdrop-blur-md rounded-[2rem] p-6">
        <div className="flex items-center justify-between w-full mb-4">
          <div className='flex items-center gap-3'>
            <ShieldAlert className="h-5 w-5 text-white" />
            <AlertTitle className='font-black text-[10px] uppercase tracking-[0.2em] text-white'>
              Firebase Security Notice
            </AlertTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 p-0 hover:bg-white/20 text-white rounded-full transition-all" 
            onClick={() => setError(null)}
          >
            <X size={16} />
          </Button>
        </div>
        <AlertDescription className="mt-2 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-white/90">
            Sistem mendeteksi kendala akses pada database. Ini umum terjadi saat sinkronisasi data awal atau izin akses dibatasi.
          </p>
          <div className="bg-black/20 p-4 rounded-xl overflow-hidden border border-white/10">
            <p className="text-[9px] font-mono break-all opacity-80 line-clamp-3">
              Operation: {error.request.method.toUpperCase()}<br/>
              Path: {error.request.path}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full h-11 text-[10px] font-black uppercase tracking-[0.2em] border-white/30 text-white hover:bg-white/10 rounded-xl transition-all"
            onClick={() => setError(null)}
          >
            ABAIKAN & LANJUTKAN
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
