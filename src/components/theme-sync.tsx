'use client';

import { useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type School } from '@/lib/data';

/**
 * Sinkronisasi Tema Global v3.8.
 * Menerapkan variabel CSS berdasarkan warna yang dipilih admin secara dinamis.
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

    // Terapkan Warna Primer & Aksen jika tersedia di database (hanya jika valid)
    if (schoolData.primaryColor && schoolData.primaryColor.split(' ').length >= 3) {
      root.style.setProperty('--primary', schoolData.primaryColor);
      root.style.setProperty('--ring', schoolData.primaryColor);
    }

    if (schoolData.accentColor && schoolData.accentColor.split(' ').length >= 3) {
      root.style.setProperty('--accent', schoolData.accentColor);
    }

  }, [schoolData]);

  return null;
}