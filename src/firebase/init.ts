'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  DocumentData
} from 'firebase/firestore';
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
    
    // Para evitar o erro "Firestore has already been started", verificamos se já existe uma instância.
    // Se não existir (ou se for a primeira inicialização do app), usamos initializeFirestore com cache persistente.
    let firestore: Firestore;
    
    if (getApps().length > 0) {
      try {
        firestore = getFirestore(firebaseApp);
      } catch (e) {
        // Fallback caso o app exista mas o firestore ainda não tenha sido instanciado
        firestore = initializeFirestore(firebaseApp, {
          localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
        });
      }
    } else {
      firestore = initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      });
    }

    const auth = getAuth(firebaseApp);

    return { firebaseApp, firestore, auth, isConfigured: true };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return { firebaseApp: null, firestore: null, auth: null, isConfigured: false };
  }
}
