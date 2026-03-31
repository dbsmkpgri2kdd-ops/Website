
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { SCHOOL_DATA_ID, type UserProfile, type School } from '@/lib/data';

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

// Utility untuk parsing CSV sederhana
const parseCSV = (csv: string) => {
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return headers.reduce((obj: any, header, i) => {
      obj[header] = values[i];
      return obj;
    }, {});
  });
};

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
          
          if (!userSnap.exists()) {
            // Cek inisialisasi sistem untuk admin pertama
            const initRef = doc(firestore, 'app_roles/initialized/init', 'system');
            const initSnap = await getDoc(initRef);
            const isFirstUser = !initSnap.exists();
            const role = isFirstUser ? 'admin' : 'siswa';

            await setDoc(userDocRef, {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User Baru',
              role: role,
              createdAt: serverTimestamp(),
            }, { merge: true });

            if (isFirstUser) {
              await setDoc(initRef, { initialized: true, initializedBy: firebaseUser.email, at: serverTimestamp() });
            }
          } else {
            // LOGIKA SINKRONISASI DATA SISWA VIA CSV (Hanya untuk role siswa)
            const userData = userSnap.data() as UserProfile;
            
            if (userData.role === 'siswa' && userData.nis && !userData.displayName?.includes(' ')) {
              // Jika nama masih default/email dan ada NIS, coba sinkronisasi dari CSV
              const schoolSnap = await getDoc(doc(firestore, 'schools', SCHOOL_DATA_ID));
              const schoolData = schoolSnap.data() as School;
              
              if (schoolData?.studentDatabaseUrl) {
                try {
                  const response = await fetch(schoolData.studentDatabaseUrl);
                  const csvText = await response.text();
                  const studentData = parseCSV(csvText);
                  
                  // Cari baris yang cocok dengan NIS
                  // Asumsi kolom di CSV bernama 'NIS', 'Nama', 'Kelas'
                  const match = studentData.find(s => String(s.NIS) === String(userData.nis) || String(s.nis) === String(userData.nis));
                  
                  if (match) {
                    const fullName = match.Nama || match.nama || match.NAME || match.name;
                    const className = match.Kelas || match.kelas || match.CLASS || match.class;
                    
                    if (fullName) {
                      await updateDoc(userDocRef, {
                        displayName: fullName,
                        className: className || 'Umum',
                        lastSyncedAt: serverTimestamp()
                      });
                    }
                  }
                } catch (csvError) {
                  console.error("CSV Sync Error:", csvError);
                }
              }
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
