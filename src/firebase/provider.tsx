
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { useDoc } from './firestore/use-doc';
import type { UserProfile } from '@/lib/data';

// The combined user object, including the Firestore profile
export type AppUser = User & { profile: UserProfile | null };

// Result for the new useUser hook
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

// Internal state for basic user authentication
interface BasicUserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// The core context state, still provides raw services
export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

// A tracker to ensure Firestore references/queries are properly memoized
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


/**
 * HOOKS
 */

/**
 * Internal hook to get the basic Firebase Auth user state.
 */
const useBasicAuthUser = (): BasicUserAuthState => {
  const [userAuthState, setUserAuthState] = useState<BasicUserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  const { auth } = useContext(FirebaseContext) ?? {};

  useEffect(() => {
    if (!auth) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth service not provided.") });
      return;
    }
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error("useBasicAuthUser: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe();
  }, [auth]);

  return userAuthState;
}


/**
 * Hook to access core Firebase services.
 * Throws error if core services are not available or used outside provider.
 */
const useFirebaseServices = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined || !context.firebaseApp || !context.firestore || !context.auth) {
        throw new Error('useFirebaseServices must be used within a FirebaseProvider with all services available.');
    }
    return {
        firebaseApp: context.firebaseApp,
        firestore: context.firestore,
        auth: context.auth,
    };
}

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => useFirebaseServices().auth;
/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => useFirebaseServices().firestore;
/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => useFirebaseServices().firebaseApp;


/**
 * The main user hook.
 */
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
  const memoized = factory(); // Execute factory to get the value
  const memoizedRef = useMemo(() => memoized, deps); // Standard React useMemo for stability
  
  if (memoizedRef && typeof memoizedRef === 'object' && memoizedRef !== null) {
    try {
      firebaseMemoTracker.add(memoizedRef);
    } catch (e) {
      // Ignored if not an object
    }
  }
  return memoizedRef;
}
