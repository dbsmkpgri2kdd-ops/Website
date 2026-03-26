
'use client';

import { useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { SCHOOL_DATA_ID, type School } from '@/lib/data';

export function ThemeSync() {
  const firestore = useFirestore();
  const schoolRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'schools', SCHOOL_DATA_ID) : null, 
  [firestore]);
  
  const { data: schoolData } = useDoc<School>(schoolRef);

  useEffect(() => {
    if (schoolData?.primaryColor) {
      document.documentElement.style.setProperty('--primary', schoolData.primaryColor);
    }
    if (schoolData?.accentColor) {
      document.documentElement.style.setProperty('--accent', schoolData.accentColor);
    }
  }, [schoolData]);

  return null;
}
