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
    const isConfigValid = !!(firebaseConfig && firebaseConfig.projectId && firebaseConfig.projectId !== "");
    
    if (!isConfigValid) {
      return { firebaseApp: null, auth: null, firestore: null };
    }

    let app: FirebaseApp;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

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

// Singleton instances for client-side use
const services = initializeFirebase();
export const firebaseApp = services.firebaseApp;
export const auth = services.auth;
export const firestore = services.firestore;

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
