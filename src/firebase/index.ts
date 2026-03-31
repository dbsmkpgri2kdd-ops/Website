'use client';

import { firebaseConfig } from './config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export type FirebaseServices = {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
};

/**
 * Inisialisasi aman untuk Client Side.
 * Mencegah eksekusi pada lingkungan Server (SSR) untuk menghindari Hydration Mismatch.
 */
export function initializeFirebase(): FirebaseServices {
  try {
    // SSR Guard: Jangan inisialisasi Firebase di server
    if (typeof window === 'undefined') {
      return { firebaseApp: null, auth: null, firestore: null, storage: null };
    }

    const isConfigValid = !!(firebaseConfig && firebaseConfig.projectId && firebaseConfig.projectId !== "");
    
    if (!isConfigValid) {
      return { firebaseApp: null, auth: null, firestore: null, storage: null };
    }

    let app: FirebaseApp;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const storage = getStorage(app);

    return {
      firebaseApp: app,
      auth,
      firestore,
      storage
    };
  } catch (error) {
    console.warn('Firebase initialization error:', error);
    return { firebaseApp: null, auth: null, firestore: null, storage: null };
  }
}

const services = initializeFirebase();
export const firebaseApp = services.firebaseApp;
export const auth = services.auth;
export const firestore = services.firestore;
export const storage = services.storage;

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './mutations';
export * from './errors';
export * from './error-emitter';
