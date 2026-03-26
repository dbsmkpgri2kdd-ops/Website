'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Inisialisasi Firebase App secara Idempotent
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Inisialisasi Layanan
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, auth, firestore };

// Export Hooks dan Provider
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './non-blocking-updates';
