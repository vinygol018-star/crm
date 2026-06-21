'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Inicializa as instâncias do Firebase no lado do cliente de forma segura.
 * Retorna também um flag indicando se a configuração está presente.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  isConfigured: boolean;
} {
  // Verifica se a API Key está presente e não é uma string vazia ou "undefined"
  const isConfigured = !!(
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== "undefined" && 
    firebaseConfig.apiKey.trim() !== ""
  );

  // Safe logs para debug em produção (Netlify) sem expor as chaves
  if (typeof window !== 'undefined') {
    console.group('🛡️ FluxFlow CRM - Firebase Config Check');
    console.log(`- Environment: ${process.env.NODE_ENV}`);
    console.log(`- API Key: ${isConfigured ? '✅ Configurada' : '❌ Ausente'}`);
    console.log(`- Project ID: ${!!firebaseConfig.projectId ? '✅ Configurado' : '❌ Ausente'}`);
    console.log(`- Auth Domain: ${!!firebaseConfig.authDomain ? '✅ Configurado' : '❌ Ausente'}`);
    if (!isConfigured && process.env.NODE_ENV === 'production') {
      console.warn('⚠️ ATENÇÃO: Variáveis NEXT_PUBLIC_* não encontradas no ambiente de produção.');
    }
    console.groupEnd();
  }

  if (!isConfigured) {
    return { firebaseApp: null, firestore: null, auth: null, isConfigured: false };
  }

  try {
    const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);

    return { firebaseApp, firestore, auth, isConfigured: true };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return { firebaseApp: null, firestore: null, auth: null, isConfigured: false };
  }
}
