'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Inicializa as instâncias do Firebase no lado do cliente de forma segura.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  isConfigured: boolean;
} {
  const isConfigured = !!(
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== "undefined" && 
    firebaseConfig.apiKey.trim() !== ""
  );

  if (typeof window !== 'undefined') {
    console.group('🛡️ FluxFlow CRM - Firebase Config Check');
    console.log(`- API Key: ${isConfigured ? '✅ Present' : '❌ Missing'}`);
    console.log(`- Project ID: ${firebaseConfig.projectId || '❌ Missing'}`);
    console.groupEnd();
  }

  if (!isConfigured) {
    return { firebaseApp: null, firestore: null, auth: null, isConfigured: false };
  }

  try {
    const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);

    // Tenta habilitar persistência offline se possível
    if (typeof window !== 'undefined') {
      enableIndexedDbPersistence(firestore).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Persistence failed-precondition (multiple tabs open)');
        } else if (err.code === 'unimplemented') {
          console.warn('Persistence unimplemented (browser not supported)');
        }
      });
    }

    return { firebaseApp, firestore, auth, isConfigured: true };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return { firebaseApp: null, firestore: null, auth: null, isConfigured: false };
  }
}
