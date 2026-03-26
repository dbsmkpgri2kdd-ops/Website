
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from '@/firebase';
import type { UserProfile } from '@/lib/data';

export interface AppUser extends User {
  profile: UserProfile | null;
}

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Jika Firebase belum siap (unconfigured), hentikan loading dengan status null
    if (!auth || !firestore) {
      setIsLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          const profile = docSnap.exists() ? docSnap.data() as UserProfile : null;
          setUser({ ...firebaseUser, profile } as AppUser);
          setIsLoading(false);
        }, (err) => {
          console.warn("User profile sync pending or inaccessible:", err.message);
          setUser({ ...firebaseUser, profile: null } as AppUser);
          setIsLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        setUser(null);
        setIsLoading(false);
      }
    }, (err) => {
      setError(err);
      setIsLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  return { user, isLoading, error };
}
