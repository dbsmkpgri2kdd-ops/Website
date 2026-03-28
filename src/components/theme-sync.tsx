
'use client';

import { useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type School } from '@/lib/data';

/**
 * Sinkronisasi Tema Global v2.5.
 * Menerapkan variabel CSS berdasarkan template dan warna yang dipilih admin secara dinamis.
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

    // 1. Terapkan Warna Primer & Aksen
    if (schoolData.primaryColor) {
      root.style.setProperty('--primary', schoolData.primaryColor);
      root.style.setProperty('--ring', schoolData.primaryColor);
    }

    if (schoolData.accentColor) {
      root.style.setProperty('--accent', schoolData.accentColor);
    }

    // 2. Terapkan ID Template sebagai Atribut Data
    if (schoolData.selectedTemplate) {
      root.setAttribute('data-template', schoolData.selectedTemplate);
    } else {
      root.setAttribute('data-template', 'obsidian-minimal');
    }

    // 3. Logika Estetika Template Tingkat Lanjut
    const template = schoolData.selectedTemplate || 'obsidian-minimal';
    
    // Default Radius
    let radius = '1rem';
    
    if (template.includes('minimal') || template.includes('zen') || template.includes('slate')) {
      radius = '0.5rem';
    } else if (template.includes('cyber') || template.includes('neon')) {
      radius = '0px';
    } else if (template.includes('fresh') || template.includes('nature') || template.includes('bloom') || template.includes('dreams')) {
      radius = '2.5rem';
    } else if (template.includes('corporate') || template.includes('royal')) {
      radius = '1.25rem';
    }
    
    root.style.setProperty('--radius', radius);

    // 4. Force Dark Theme as Primary requested
    if (!localStorage.getItem('theme')) {
        root.classList.add('dark');
    }

  }, [schoolData]);

  return null;
}
