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

/**
 * Robust CSV Parser for student database sync.
 */
const parseCSV = (csv: string) => {
  const rows = csv.split(/\r?\n/).filter(row => row.trim() !== '');
  if (rows.length < 2) return [];
  
  const headers = rows[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  return rows.slice(1).map(row => {
    const values = row.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    return headers.reduce((obj: any, header, i) => {
      obj[header] = values[i] || '';
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

  const defaultLogo = 'https://picsum.photos/seed/school/200/200';

  useEffect(() => {
    if (!auth || !firestore) {
      setUserState(prev => ({ ...prev, isUserLoading: false }));
      return;
    }

    // Initialize School Data if not exists
    const initSchoolData = async () => {
      try {
        const schoolRef = doc(firestore, 'schools', SCHOOL_DATA_ID);
        const schoolSnap = await getDoc(schoolRef);
        if (!schoolSnap.exists()) {
          await setDoc(schoolRef, {
            name: "SMKS PGRI 2 KEDONDONG",
            shortName: "SMK PRIDA",
            logoUrl: defaultLogo,
            address: "Jl. Tritura No. 7 Kedondong, Pesawaran, Lampung",
            email: "smkpgri2kdd_pswrn@yahoo.com",
            phone: "0729-7371134",
            vision: "Visi: Islam Berdikari Unggul (IBU)",
            mission: [
              "Meningkatkan sumber daya manusia dengan mengikuti perkembangan pendidikan yang bertakwa dan berbudi pekerti",
              "Meningkatkan kesadaran terhadap budaya tertib, disiplin, keterampilan, dan hidup yang mandiri",
              "Memberikan prestasi yang terbaik"
            ],
            primaryColor: "221 100% 50%",
            accentColor: "45 100% 50%",
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
      } catch (e) {
        console.warn("School auto-initialization failed, possibly due to permission rules.");
      }
    };

    initSchoolData();

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        
        try {
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
            // Profile Sync logic for Students
            const userData = userSnap.data() as UserProfile;
            if (userData.role === 'siswa' && userData.nis && !userData.lastSyncedAt) {
              const schoolRef = doc(firestore, 'schools', SCHOOL_DATA_ID);
              const currentSchoolSnap = await getDoc(schoolRef);
              const schoolData = currentSchoolSnap.data() as School;
              
              if (schoolData?.studentDatabaseUrl && schoolData.csvMappings) {
                try {
                  const res = await fetch(schoolData.studentDatabaseUrl);
                  const csvText = await res.text();
                  const studentList = parseCSV(csvText);
                  const maps = schoolData.csvMappings;
                  
                  const match = studentList.find(s => 
                    String(s[maps.nis]).trim() === String(userData.nis).trim()
                  );

                  if (match) {
                    await updateDoc(userDocRef, {
                      displayName: match[maps.name] || userData.displayName,
                      className: match[maps.class] || 'X',
                      session: (match[maps.session] === 'Siang' ? 'Siang' : 'Pagi'),
                      address: match[maps.address] || '',
                      phone: match[maps.phone] || '',
                      parentName: match[maps.parentName] || '',
                      parentPhone: match[maps.parentPhone] || '',
                      bkTeacher: match[maps.bkTeacher] || '',
                      homeroomTeacher: match[maps.homeroomTeacher] || '',
                      guardianTeacher: match[maps.guardianTeacher] || '',
                      studentAffairs: match[maps.studentAffairs] || '',
                      lastSyncedAt: serverTimestamp()
                    });
                  }
                } catch (err) {
                  console.error("CSV Database Sync Error:", err);
                }
              }
            }
          }
        } catch (e) {
          console.warn("User profile setup error:", e);
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
            userError: err
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