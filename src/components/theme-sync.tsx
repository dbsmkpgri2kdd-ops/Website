'use client';

import { useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type School } from '@/lib/data';

/**
 * Sinkronisasi Tema Global v3.5.
 * Menerapkan variabel CSS berdasarkan warna yang dipilih admin secara dinamis.
 * Dipadukan dengan sistem Light/Dark mode dari next-themes.
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

    // Terapkan Warna Primer & Aksen jika tersedia di database
    if (schoolData.primaryColor) {
      // Pastikan format HSL valid untuk Tailwind
      root.style.setProperty('--primary', schoolData.primaryColor);
      root.style.setProperty('--ring', schoolData.primaryColor);
    }

    if (schoolData.accentColor) {
      root.style.setProperty('--accent', schoolData.accentColor);
    }

    // Border radius standar formal modern
    root.style.setProperty('--radius', '0.75rem');

  }, [schoolData]);

  return null;
}