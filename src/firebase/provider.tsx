
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { SCHOOL_DATA_ID, type UserProfile, type School, type CsvMappings } from '@/lib/data';

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

const parseCSV = (csv: string) => {
  const lines = csv.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  
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

  const defaultLogo = 'https://firebasestorage.googleapis.com/v0/b/firebasestudio-images/o/user-uploaded-image.png?alt=media';

  useEffect(() => {
    if (!auth || !firestore) {
      setUserState(prev => ({ ...prev, isUserLoading: false }));
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        
        try {
          // Initialize School Profile with Default Logo if needed
          const schoolRef = doc(firestore, 'schools', SCHOOL_DATA_ID);
          const schoolSnap = await getDoc(schoolRef);
          if (!schoolSnap.exists()) {
            await setDoc(schoolRef, {
              name: "SMKS PGRI 2 KEDONDONG",
              shortName: "SMK PRIDA",
              logoUrl: defaultLogo,
              address: "Jl. Raya Kedondong No. 2, Pesawaran, Lampung",
              email: "info@smkpgri2kedondong.sch.id",
              phone: "0812-3456-7890",
              vision: "Mewujudkan lulusan yang kompeten, berakhlak mulia, dan siap kerja.",
              mission: ["Menerapkan kurikulum berbasis industri", "Menanamkan nilai-nilai karakter bangsa", "Meningkatkan kualitas SDM dan sarpras"],
              layoutSettings: {
                showHero: true,
                showPartners: true,
                showStats: true,
                showMajors: true,
                showNews: true,
                showCta: true,
                showShowcase: true,
                sectionOrder: ['hero', 'partners', 'apps', 'stats', 'majors', 'showcase', 'news', 'cta']
              }
            });
          }

          const userSnap = await getDoc(userDocRef);
          if (!userSnap.exists()) {
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
            const userData = userSnap.data() as UserProfile;
            if (userData.role === 'siswa' && userData.nis && !userData.lastSyncedAt) {
              const currentSchoolSnap = await getDoc(schoolRef);
              const schoolData = currentSchoolSnap.data() as School;
              if (schoolData?.studentDatabaseUrl && schoolData.csvMappings) {
                try {
                  const response = await fetch(schoolData.studentDatabaseUrl);
                  const csvText = await response.text();
                  const studentData = parseCSV(csvText);
                  const mappings = schoolData.csvMappings;
                  const match = studentData.find(s => String(s[mappings.nis]).trim() === String(userData.nis).trim());
                  if (match) {
                    const updates: any = {
                      displayName: match[mappings.name] || userData.displayName,
                      className: match[mappings.class] || 'X',
                      session: (match[mappings.session] === 'Siang' ? 'Siang' : 'Pagi'),
                      address: match[mappings.address] || '',
                      phone: match[mappings.phone] || '',
                      parentName: match[mappings.parentName] || '',
                      parentPhone: match[mappings.parentPhone] || '',
                      bkTeacher: match[mappings.bkTeacher] || '',
                      homeroomTeacher: match[mappings.homeroomTeacher] || '',
                      guardianTeacher: match[mappings.guardianTeacher] || '',
                      studentAffairs: match[mappings.studentAffairs] || '',
                      lastSyncedAt: serverTimestamp()
                    };
                    await updateDoc(userDocRef, updates);
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
