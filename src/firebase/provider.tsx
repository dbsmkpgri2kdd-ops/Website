
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { useDoc } from './firestore/use-doc';
import type { UserProfile } from '@/lib/data';

export type AppUser = User & { profile: UserProfile | null };

export interface UserHookResult {
  user: AppUser | null;
  isLoading: boolean;
  error: Error | null;
}

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

interface BasicUserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);
export const firebaseMemoTracker = new WeakSet<object>();

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const contextValue = useMemo((): FirebaseContextState => ({
      firebaseApp: firebaseApp,
      firestore: firestore,
      auth: auth,
  }), [firebaseApp, firestore, auth]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

const useBasicAuthUser = (): BasicUserAuthState => {
  const [userAuthState, setUserAuthState] = useState<BasicUserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  const { auth, firestore } = useContext(FirebaseContext) ?? {};

  useEffect(() => {
    if (!auth || !firestore) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Services not provided.") });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          const userDocRef = doc(firestore, 'users', firebaseUser.uid);
          try {
            const docSnap = await getDoc(userDocRef);
            if (!docSnap.exists()) {
              // Create default profile for any new signups
              // By default role is 'siswa', but rules allow owner to change it to 'admin'
              await setDoc(userDocRef, {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                role: 'siswa', 
                createdAt: serverTimestamp(),
              });
            }
          } catch (err) {
            console.error("Auto-Profile Sync Error:", err);
          }
        }
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      }
    );
    return () => unsubscribe();
  }, [auth, firestore]);

  return userAuthState;
}

const useFirebaseServices = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined || !context.firebaseApp || !context.firestore || !context.auth) {
        throw new Error('useFirebaseServices must be used within a FirebaseProvider.');
    }
    return {
        firebaseApp: context.firebaseApp,
        firestore: context.firestore,
        auth: context.auth,
    };
}

export const useAuth = (): Auth => useFirebaseServices().auth;
export const useFirestore = (): Firestore => useFirebaseServices().firestore;
export const useFirebaseApp = (): FirebaseApp => useFirebaseServices().firebaseApp;

export const useUser = (): UserHookResult => {
  const { user: authUser, isUserLoading: isAuthLoading, userError: authError } = useBasicAuthUser();
  const services = useContext(FirebaseContext);
  const firestore = services?.firestore;

  const userDocRef = useMemoFirebase(() => {
    if (firestore && authUser) {
      return doc(firestore, 'users', authUser.uid);
    }
    return null;
  }, [firestore, authUser]);

  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useDoc<UserProfile>(userDocRef);

  const isLoading = isAuthLoading || (!!authUser && isProfileLoading);
  const error = authError || profileError;

  const user = useMemo<AppUser | null>(() => {
    if (isLoading || error || !authUser) {
      return null;
    }
    return {
      ...authUser,
      profile: profile ?? null,
    } as AppUser;
  }, [isLoading, error, authUser, profile]);
  
  return { user, isLoading, error };
};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  const memoized = useMemo(() => factory(), deps); 
  if (memoized && typeof memoized === 'object' && memoized !== null) {
    try {
      firebaseMemoTracker.add(memoized);
    } catch (e) {}
  }
  return memoized;
}
