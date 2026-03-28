
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import type { UserProfile } from '@/lib/data';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

export interface AppUser extends User {
  profile: UserProfile | null;
}

interface UserAuthState {
  user: AppUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState extends UserAuthState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userState, setUserState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (!auth || !firestore) {
      setUserState(prev => ({ ...prev, isUserLoading: false }));
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        
        try {
          const userSnap = await getDoc(userDocRef);
          
          // JIKA USER BARU (PROFIL BELUM ADA)
          if (!userSnap.exists()) {
            // Cek apakah sistem sudah pernah diinisialisasi
            const initRef = doc(firestore, 'app_roles/initialized/init', 'system');
            const initSnap = await getDoc(initRef);
            
            // Pengguna pertama otomatis jadi Admin
            const isFirstUser = !initSnap.exists();
            const role = isFirstUser ? 'admin' : 'siswa';

            await setDoc(userDocRef, {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User Baru',
              role: role,
              createdAt: serverTimestamp(),
            }, { merge: true });

            // Jika dia admin pertama, tandai sistem sudah inisialisasi secara permanen
            if (isFirstUser) {
              await setDoc(initRef, {
                initialized: true,
                initializedBy: firebaseUser.email,
                at: serverTimestamp()
              });
            }
          }
        } catch (e) {
          console.warn("Profile check/creation pending...");
        }

        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          const profileData = docSnap.exists() ? docSnap.data() as UserProfile : null;
          setUserState({
            user: { ...firebaseUser, profile: profileData } as AppUser,
            isUserLoading: false,
            userError: null
          });
        }, (err) => {
          setUserState({
            user: { ...firebaseUser, profile: null } as AppUser,
            isUserLoading: false,
            userError: null
          });
        });

        return () => unsubscribeProfile();
      } else {
        setUserState({ user: null, isUserLoading: false, userError: null });
      }
    }, (err) => {
      setUserState({ user: null, isUserLoading: false, userError: err });
    });

    return () => unsubscribeAuth();
  }, [auth, firestore]);

  const contextValue = useMemo((): FirebaseContextState => {
    return {
      areServicesAvailable: !!(firebaseApp && firestore && auth),
      firebaseApp,
      firestore,
      auth,
      ...userState
    };
  }, [firebaseApp, firestore, auth, userState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) throw new Error('useFirebase must be used within a FirebaseProvider.');
  return context;
};

export const useAuth = () => useContext(FirebaseContext)?.auth || null;
export const useFirestore = () => useContext(FirebaseContext)?.firestore || null;
export const useFirebaseApp = () => useContext(FirebaseContext)?.firebaseApp || null;

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  const memoized = useMemo(factory, deps);
  if (typeof memoized === 'object' && memoized !== null) {
    (memoized as any).__memo = true;
  }
  return memoized;
}

export const useUser = () => {
  const context = useContext(FirebaseContext);
  return { 
    user: context?.user || null, 
    isUserLoading: context?.isUserLoading ?? true, 
    userError: context?.userError || null,
    profile: context?.user?.profile || null
  };
};
