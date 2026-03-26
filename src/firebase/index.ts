
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export type FirebaseServices = {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
};

export function initializeFirebase(): FirebaseServices {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  try {
    if (!getApps().length) {
      if (!firebaseConfig.projectId) {
        console.warn('Firebase Project ID is missing. Please use the "Connect to Firebase" button.');
        return { firebaseApp: null, auth: null, firestore: null };
      }
      const app = initializeApp(firebaseConfig);
      return {
        firebaseApp: app,
        auth: getAuth(app),
        firestore: getFirestore(app)
      };
    }
    const app = getApp();
    return {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app)
    };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { firebaseApp: null, auth: null, firestore: null };
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
