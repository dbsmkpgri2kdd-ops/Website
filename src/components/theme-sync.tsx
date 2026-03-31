
'use client';

import { useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type School } from '@/lib/data';

/**
 * Sinkronisasi Tema Global v3.0.
 * Menerapkan variabel CSS berdasarkan template dan warna yang dipilih admin secara dinamis.
 * Fokus pada Clean & Fresh Modern style.
 */
export function ThemeSync() {
  const firestore = useFirestore();
  const schoolRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'schools', SCHOOL_DATA_ID) : null, 
  [firestore]);
  
  const { data: schoolData } = useDoc<School>(schoolRef);

  useEffect(() => {
    if (!schoolData) return;

    const root = document.documentElement;

    // 1. Terapkan Warna Primer & Aksen jika tersedia di database
    if (schoolData.primaryColor) {
      root.style.setProperty('--primary', schoolData.primaryColor);
      root.style.setProperty('--ring', schoolData.primaryColor);
    }

    if (schoolData.accentColor) {
      root.style.setProperty('--accent', schoolData.accentColor);
    }

    // 2. Logika Border Radius Berdasarkan Karakter Sekolah
    // Kami standarisasi pada 0.75rem untuk kesan modern yang ramah
    root.style.setProperty('--radius', '0.75rem');

  }, [schoolData]);

  return null;
}
