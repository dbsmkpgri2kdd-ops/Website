'use client';

import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Fungsi mutasi Firestore tanpa 'await' untuk mendukung UI Optimistik.
 * Error ditangkap dan dikirim ke listener global.
 */

export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions = {}) {
  setDoc(docRef, data, options).catch(async (error) => {
    const contextualError = new FirestorePermissionError({
      path: docRef.path,
      operation: options && 'merge' in options ? 'update' : 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', contextualError);
  });
}

export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  addDoc(colRef, data).catch(async (error) => {
    const contextualError = new FirestorePermissionError({
      path: colRef.path,
      operation: 'create',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', contextualError);
  });
}

export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data).catch(async (error) => {
    const contextualError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'update',
      requestResourceData: data,
    });
    errorEmitter.emit('permission-error', contextualError);
  });
}

export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef).catch(async (error) => {
    const contextualError = new FirestorePermissionError({
      path: docRef.path,
      operation: 'delete',
    });
    errorEmitter.emit('permission-error', contextualError);
  });
}
